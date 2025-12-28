// Simple API tester app for non-developers
const $ = (id) => document.getElementById(id);

function pretty(obj) {
    try { return JSON.stringify(obj, null, 2); } catch (e) { return String(obj); }
}

function loadSettings() {
    $('baseUrl').value = localStorage.getItem('api_base') || 'http://localhost:4035/api';
    $('savedPubid').value = localStorage.getItem('api_pubid') || '';
    $('savedToken').value = localStorage.getItem('api_token') || '';
}

function saveAuth(pubid, token) {
    localStorage.setItem('api_pubid', pubid);
    localStorage.setItem('api_token', token);
    $('savedPubid').value = pubid;
    $('savedToken').value = token;
}

function clearAuth() {
    localStorage.removeItem('api_pubid');
    localStorage.removeItem('api_token');
    $('savedPubid').value = '';
    $('savedToken').value = '';
}

function showResponse(status, body, containerId) {
    // If containerId provided, show there, otherwise use old global elements
    if (containerId) {
        const statusEl = document.getElementById(containerId + 'Status');
        const bodyEl = document.getElementById(containerId + 'Body');
        if (statusEl) statusEl.textContent = `Status: ${status}`;
        if (bodyEl) bodyEl.textContent = pretty(body);
        return;
    }
    $('responseStatus').textContent = `Status: ${status}`;
    $('responseBody').textContent = pretty(body);
}

async function doFetch(method, url, body, autoAuth = true, targetContainerId = null) {
    const headers = { 'Content-Type': 'application/json' };
    let bodyObj = body;
    if (autoAuth && method !== 'GET') {
        const pubid = localStorage.getItem('api_pubid');
        const token = localStorage.getItem('api_token');
        if (!bodyObj) bodyObj = {};
        if (pubid) bodyObj.pubid = pubid;
        if (token) bodyObj.token = token;
    }
    try {
        const resp = await fetch(url, { method, headers, body: method === 'GET' ? undefined : JSON.stringify(bodyObj) });
        const text = await resp.text();
        let parsed;
        try { parsed = JSON.parse(text); } catch (e) { parsed = text; }
        showResponse(resp.status, parsed, targetContainerId);
        return { status: resp.status, body: parsed };
    } catch (err) {
        showResponse('ERROR', err.message || err, targetContainerId);
        return { status: 'ERROR', body: err };
    }
}

// Login
$('btnLogin').addEventListener('click', async () => {
    const base = $('baseUrl').value.replace(/\/$/, '');
    localStorage.setItem('api_base', base);
    const pubid = $('loginPubid').value.trim();
    const id = $('loginId').value.trim();
    const pswd = $('loginPswd').value.trim();
    if (!pubid || !id) { alert('Please provide pubid and id'); return; }
    const res = await doFetch('POST', `${base}/login/`, { pubid, id, pswd }, false, 'loginResponse');
    if (res.status === 200 && res.body && res.body.user && res.body.user.tempToken) {
        saveAuth(pubid, res.body.user.tempToken);
    }
});

// Create user
let newDeps = [];
function renderNewDeps() {
    const wrap = $('newDepsList'); wrap.innerHTML = '';
    newDeps.forEach((d, i) => {
        const el = document.createElement('span'); el.className = 'dep-item'; el.textContent = d;
        const btn = document.createElement('button'); btn.textContent = '✕'; btn.title = 'Remove'; btn.onclick = () => { newDeps.splice(i, 1); renderNewDeps(); };
        el.appendChild(btn); wrap.appendChild(el);
    })
}
$('addDep').addEventListener('click', () => {
    const v = $('addDepInput').value.trim(); if (!v) return; newDeps.push(v); $('addDepInput').value = ''; renderNewDeps();
});
$('btnCreateUser').addEventListener('click', async () => {
    const base = $('baseUrl').value.replace(/\/$/, '');
    localStorage.setItem('api_base', base);
    const body = {
        name: $('newName').value.trim(),
        surname: $('newSurname').value.trim(),
        email: $('newEmail').value.trim(),
        pswd: $('newPswd').value.trim(),
        highestLevel: Number($('newHighestLevel').value) || 1,
        departments: newDeps
    }
    const res = await doFetch('POST', `${base}/humans/new-user`, body, true, 'createResponse');
});

// Update user
let updateDeps = [];
function renderUpdateDeps() {
    const wrap = $('updateDepsList'); wrap.innerHTML = '';
    updateDeps.forEach((d, i) => {
        const el = document.createElement('span'); el.className = 'dep-item'; el.textContent = d;
        const btn = document.createElement('button'); btn.textContent = '✕'; btn.title = 'Remove'; btn.onclick = () => { updateDeps.splice(i, 1); renderUpdateDeps(); };
        el.appendChild(btn); wrap.appendChild(el);
    })
}
$('addUpdateDep').addEventListener('click', () => {
    const v = $('addUpdateDepInput').value.trim(); if (!v) return; updateDeps.push(v); $('addUpdateDepInput').value = ''; renderUpdateDeps();
});
$('btnUpdateUser').addEventListener('click', async () => {
    const base = $('baseUrl').value.replace(/\/$/, '');
    localStorage.setItem('api_base', base);
    const targetId = $('updateTargetId').value.trim(); if (!targetId) { alert('targetId required'); return; }
    const body = { targetId };
    if ($('updateName').value.trim()) body.newName = $('updateName').value.trim();
    if ($('updateSurname').value.trim()) body.newSurname = $('updateSurname').value.trim();
    if ($('updateEmail').value.trim()) body.newEmail = $('updateEmail').value.trim();
    if ($('updatePswd').value.trim()) body.newPswd = $('updatePswd').value.trim();
    if (updateDeps.length) body.newDepartments = updateDeps;
    await doFetch('PUT', `${base}/humans/`, body, true, 'updateResponse');
});

// Get user
$('btnGetUser').addEventListener('click', async () => {
    const base = $('baseUrl').value.replace(/\/$/, '');
    const pid = $('getPubid').value.trim(); if (!pid) { alert('pubid required'); return; }
    await doFetch('GET', `${base}/humans/${encodeURIComponent(pid)}`, null, false, 'getResponse');
});
$('btnGetFullUser').addEventListener('click', async () => {
    const base = $('baseUrl').value.replace(/\/$/, '');
    await doFetch('POST', `${base}/humans/get-user/`, {}, true, 'getResponse');
});

$('btnGetUsersList').addEventListener('click', async () => {
    const base = $('baseUrl').value.replace(/\/$/, '');
    await doFetch('GET', `${base}/humans/`, null, false, 'getResponse');
});

// Raw request
$('btnSendRaw').addEventListener('click', async () => {
    const base = $('baseUrl').value.replace(/\/$/, '');
    let method = $('rawMethod').value;
    let endpoint = $('rawEndpoint').value.trim(); if (!endpoint.startsWith('/')) endpoint = '/' + endpoint;
    const autoAuth = $('autoAuth').checked;
    let body = null;
    if (method !== 'GET' && $('rawBody').value.trim()) {
        try { body = JSON.parse($('rawBody').value); } catch (e) { alert('Invalid JSON body'); return; }
    }
    await doFetch(method, `${base}${endpoint}`, body, autoAuth, 'rawResponse');
});

$('clearAuth').addEventListener('click', () => clearAuth());

loadSettings();
renderNewDeps(); renderUpdateDeps();