/*
   * DOCUMENTATION
   * This file is meant to be executed with node for DEV ONLY purpos, DON'T USE IN PRODUCTION!
   * to use change the targhet table with the table of interest,
   * execute in the backend dir with:
   *     "$ node src/config/sync.js";
*/

import { Human } from "../models/human.js";
import { Instrument } from "../models/instrument.js";
import { InstrumentQue } from "../models/instrumentsQue.js";
import { Material } from "../models/material.js";
import { Project } from "../models/project.js";
import { Request } from "../models/request.js";
import readline from 'readline';

const env = process.env.NODE_ENV || 'development';

const question = (rl, q) => new Promise((res) => rl.question(q, answer => res(answer)));

const models = [
    { name: 'Human', model: Human },
    { name: 'Instrument', model: Instrument },
    { name: 'InstrumentQue', model: InstrumentQue },
    { name: 'Material', model: Material },
    { name: 'Project', model: Project },
    { name: 'Request', model: Request }
];

async function runSyncFor(modelObj, force = false) {
    const label = modelObj.name || 'model';
    if (force) {
        console.log(`Running destructive sync for ${label} (force: true)`);
        await modelObj.model.sync({ force: true });
    } else {
        console.log(`Running safe sync for ${label}`);
        await modelObj.model.sync();
    }
}

const sync = async () => {
    // Safety: Prevent any destructive operations in production. Use migrations in production.
    if (env === 'production') {
        throw new Error('Refusing to run Sequelize sync in production. Use migrations to modify schema.');
    }

    // Only consider interactive menu in development/test.
    if (!(env === 'development' || env === 'test')) {
        console.log('NODE_ENV is not development/test; skipping Sequelize.sync(). Use migrations to manage schema.');
        return;
    }

    const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
    if (!isInteractive) {
        // Non-interactive: run safe sync for all models
        console.log('Non-interactive terminal detected; running safe sync for all models.');
        for (const m of models) await runSyncFor(m, false);
        console.log('Safe sync for all models completed.');
        return;
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        console.log('\nSelect which table/model to sync:');
        models.forEach((m, i) => console.log(`  ${i + 1}) ${m.name}`));
        console.log(`  ${models.length + 1}) All models`);
        console.log(`  ${models.length + 2}) Exit`);

        const ans = (await question(rl, `Enter a number (1-${models.length + 2}): `)).trim();
        const choice = Number(ans);
        if (Number.isNaN(choice) || choice < 1 || choice > models.length + 2) {
            console.log('Invalid choice, aborting.');
            return;
        }

        if (choice === models.length + 2) {
            console.log('Exit selected. Nothing to do.');
            return;
        }

        const selected = choice === models.length + 1 ? models : [models[choice - 1]];

        // Ask whether to run destructive sync
        console.warn('\nDANGER: Running destructive sync will DROP and RECREATE the selected tables and WILL LOSE DATA.');
        const conf = (await question(rl, 'Proceed with destructive sync? Type Y to run destructive sync, any other key to run safe sync (Y/N): ')).trim().toUpperCase();
        const doForce = (conf === 'Y' || conf === 'YES');

        if (doForce) {
            // Extra confirm
            const extra = (await question(rl, 'Type FORCE to confirm destructive action: ')).trim();
            if (extra !== 'FORCE') {
                console.log('Confirmation token mismatch — aborting destructive sync. Running safe sync instead.');
                for (const m of selected) await runSyncFor(m, false);
                console.log('Safe sync completed.');
                return;
            }
        }

        for (const m of selected) {
            await runSyncFor(m, doForce);
        }

        console.log('Sync operations finished.');
    } finally {
        rl.close();
    }
};

sync().catch((err) => {
    console.error('Error while running sync:', err);
    process.exit(1);
});