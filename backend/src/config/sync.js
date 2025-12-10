/*
    DOCUMENTATION
    This file is meant to be executed with node for DEV ONLY purpos, DON'T USE IN PRODUCTION!
    to use change the targhet table with the table of interest,
    execute in the backend dir with:
        "$ node src/config/sync.js";
*/

import { Human } from "../models/human.js";
import { Instrument } from "../models/instrument.js";
import { InstrumentQue } from "../models/instrumentsQue.js";
import { Material } from "../models/material.js";
import { Project } from "../models/project.js";
import { Request } from "../models/request.js";

const sync = async () => { 
    await /* !IMPORTANT! Change me --> */ Instrument.sync({force: true}) 
}

sync();