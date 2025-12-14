export function isMemberManaged(targetDpArr, authDpArr) {
    // targetDpArr: array of strings like 'deptName.level' representing target user's departments
    // authDpArr: array of strings like 'deptName.level' representing auth user's departments
    const authDpMap = (authDpArr || []).reduce((map, dpString) => {
        const clean = String(dpString).replace(/^'|'$/g, '');
        const [name, level] = clean.split('.');
        map[name] = Number(level);
        return map;
    }, {});

    for (const dpString of (targetDpArr || [])) {
        const clean = String(dpString).replace(/^'|'$/g, '');
        const [name] = clean.split('.');
        // Check if auth user manages this department at level >= 3
        if (authDpMap.hasOwnProperty(name) && authDpMap[name] >= 3) {
            return { error: false };
        }
    }

    return { error: true, status: 403, message: 'Unauthorized: You are not manager of any department the target user is a member of.' };
}
