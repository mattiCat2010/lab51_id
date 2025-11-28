import { Human } from "../models/human.js";

export async function authCheck(req, res, next) {
    try {
        if (req.method !== 'GET') {
            const { token, pubid } = req.body;
            
            if(!pubid) return res.status(401).json({ message: "Acces Danied: pubid required" }) // fix code here
            if(!token) return res.status(401).json({ message: "Acces Danied: token required" })

            const user = await Human.findAll({
                where: {
                    pubid: pubid
                },
            })

            if (token === user[0].dataValues.tempToken) {
                req.body.authUser = { // fix code here
                    authUser: user
                }
                return next();
            }

            res.status(401).json({ message: "Acces Danied: are you using a password?" })
            // DANGER DEBUG ONLY!!!
            // console.log(user[0].dataValues.id) Prints the user super seacret id, in the logs...
        }
        next(); // Skip auth for GET requests
    } catch (error) {
        console.log("Error in auth", error);
        res.status(500).json("Internal server error")
    }
}