import { Human } from "../models/human.js";

export async function authCheck(req, res, next) {
    if (req.method !== 'GET') {
        const { sid, tempToken, pswd } = req.body;
        const user = await Human.findAll({
            where: {
                pubid: sid
            },
            attributes: ['pswd', 'id', 'tempToken']
        })

        // DANGER DEBUG ONLY!!!
        // console.log(user[0].dataValues.id) Prints the user super seacret id, in the logs...
    }
    next();
}