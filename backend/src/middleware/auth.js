import { Human } from "../models/human.js";

export async function authCheck(req, res, next) {
    try {
        if (req.originalUrl === "/api/login/") return next(); // skip auth for login

        if (req.method !== 'GET') {
            let { token, pubid } = req.body;

            if (!pubid) return res.status(401).json({ message: "Access Denied: pubid required" }); // fixed typo
            if (!token) return res.status(401).json({ message: "Access Denied: token required" }); // fixed typo

            // Find user by pubid
            const user = await Human.findOne({
                where: { pubid: pubid }
            });

            if (!user) return res.status(404).json({ message: "User not found" });

            if (
                token === user.dataValues.tempToken 
                && Date.now() - user.dataValues.tempTokenCreatedAt <= 3600000
            ) {
                req.authUser = user;
                req.body.token = null; // Clear auth data
                req.body.pubid = null;
                return next();
            }

            return res.status(401).json({ message: "Access Denied: invalid token or token expired" })
            // DANGER DEBUG ONLY!!!
            // console.log(user[0].dataValues.id) Prints the user super seacret id, in the logs...
       }
        next(); // Skip auth for GET requests
    } catch (error) {
        console.log("Error in auth", error);
        res.status(500).json("Internal server error");
    }
}
