import bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Human } from '../models/human.js';

export const login = async (req, res) => {
    try {
        const authData = req.body;
        const tempToken = crypto.randomUUID(); // Generates a new temporary token

        // Validate if 'id' is provided
        if (!authData.id) return res.status(401).json({ message: "Unauthorized: id required for login" });

        // Find the user by pubid
        const user = await Human.findOne({
            where: {
                pubid: authData.pubid
            }
        });
        if (!user) return res.status(404).json({ message: `User ${authData.pubid} not found` });

        const { id, pswd } = user.dataValues;

        // TODO: check if ai suggested auth fix work

        // DANGER - AI ZONE
        // // If password exists, ensure it is provided
        // if (pswd && !authData.pswd) return res.status(401).json({ message: "Unauthorized: Password required for login" }); // NOT AI

        // Validate id and password
        const validId = await bcrypt.compare(authData.id, id); // NOT AI
        // const validPswd = await bcrypt.compare(authData.pswd, pswd); // NOT AI

        if (!validId) return res.status(401).json({ message: "Unauthorized: invalid id" }); // NOT AI
         
        // if (!validPswd) return res.status(401).json({ message: "Unauthorized: invalid password" }); // NOT AI
        if (pswd) {
            if (!authData.pswd) return res.status(401).json({ message: "Unauthorized: Password required for login" });
            const validPswd = await bcrypt.compare(authData.pswd, pswd);
            if (!validPswd) return res.status(401).json({ message: "Unauthorized: invalid password" });
        }
        // END AI ZONE

        // Update user with tempToken and tempTokenCreatedAt
        await Human.update(
            { tempToken: tempToken, tempTokenCreatedAt: Date.now() },
            {
                where: {
                    pubid: authData.pubid,
                },
            },
        );

        // Remove sensitive information (id and password) from response
        let resData = { ...user.dataValues };
        delete resData.id;
        delete resData.pswd;

        // Add tempToken and tempTokenCreatedAt to the response
        resData.tempToken = tempToken;
        resData.tempTokenCreatedAt = Date.now();

        // Send the response with user data and tempToken
        return res.status(200).json(
            await bcrypt.compare("changeMe", pswd)
            ? { message: "WARNING: you are using the default password, for security reasons you should change it", user: resData} 
            : { user: resData }
        );

    } catch (error) {
        console.log("Error during login controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
