import * as crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Human } from "../models/human.js";
// import { Op } from "sequelize";

export const getUserInfo = async (req, res) => {
    try {
        const { pubid } = req.params;
        const user = await Human.findOne({
            where: {
                pubid: pubid
            },
            attributes: { exclude: ['pswd', 'id', 'tempToken'] }
        })

        if (user) return res.status(200).json(user)

        res.status(404).json({ message: `Error user ${pubid} dosn't exist` })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
        console.log("Error in getUserInfo: ", error)
    }
}

export const getUsersList = async (req, res) => {
    try {
        const { pubid } = req.params;
        const user = await Human.findAll({
            attributes: ['pubid', 'name', 'surname']
        })

        if (user) return res.status(200).json(user)

        res.status(404).json({ message: `Error user ${pubid} dosn't exist` })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
        console.log("Error in getUserInfo: ", error)
    }
}

export const getFullUserData = async (req, res) => {
    try {
        const { pubid } = req.authUser.dataValues;

        const user = await Human.findOne({
            where: {
                pubid: pubid,
            }
        })

        // console.log(user.dataValues.departments.length) // Debug

        if (user) return res.status(200).json(user);
        res.status(404).json({ message: "User not found" })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
        console.log("Error in getFullUSerData: ", error)
    }
}

export const createUser = async (req, res) => {
    try {
        const User = { ...req.body };
        const authUser = req.authUser.dataValues;

        // Primary checks
        if (!authUser) {
            return res.status(500).json({ message: "Authentication context missing." });
        }

        // Verify if user is Admin
        if (authUser.highestLevel < 3) {
            return res.status(403).json({ message: "Unauthorized access: Minimum level 3 required to create users." });
        }

        // user data checks
        if (!User.name) {
            return res.status(422).json({ message: "Name is required to create a user" });
        }

        if (!User.surname) {
            return res.status(422).json({ message: "Surname is required to create a user" });
        }

        if (!User.email) {
            return res.status(422).json({ message: "Email is required to create a user" });
        }

        let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(User.email)) {
            return res.status(422).json({ message: "Invalid email" });
        }

        if (!User.departments) {
            return res.status(422).json({ message: "Departments is required to create a user" });
        }

        if (!User.highestLevel) {
            return res.status(422).json({ message: "highestLevel is required to create a user" });
        }

        // If user is a member or higher require password
        if (User.highestLevel >= 2 && !User.pswd) {
            return res.status(406).json({ message: "Password required for user level 2 or higher." });
        }

        // Only create user with equal or lower privilege level
        if (authUser.highestLevel < User.highestLevel) {
            return res.status(401).json({ message: `Unauthorized: New user level can't be higher than your level (${authUser.highestLevel}).` });
        }

        const id = crypto.randomUUID(); // create private id
        const hashId = await bcrypt.hash(id, 10); // hash the id for improved privacy

        User.id = hashId;

        let pswd = "";

        if (User.pswd) { // check for password and hash if present
            pswd = User.pswd;
            User.pswd = await bcrypt.hash(User.pswd, 10);
        }

        const dpArr = User.departments || [];
        const authDpArr = authUser.departments || [];

        // console.log(authDpArr)

        // Prepare authUser's department map for easy lookup: { 'name': level }
        const authDpMap = authDpArr.reduce((map, dpString) => {
            const String = dpString.replace(/^'|'$/g, '');
            const [name, level] = String.split(".");
            map[name] = Number(level);
            return map;
        }, {});

        for (const dpString of dpArr) {
            const [dpName, dpLv] = dpString.split(".");
            const newDpLevel = Number(dpLv);

            // Check 1: Does the authorized user manage this department?
            if (!authDpMap.hasOwnProperty(dpName)) {
                return res.status(401).json({ message: `Unauthorized department: You do not manage ${dpName}.` });
            }

            const authUserDpLevel = authDpMap[dpName];

            if (
                newDpLevel > authUserDpLevel || // New user level is higher than auth user's level in that department
                authUserDpLevel < 3             // Auth user's level in this department is too low to assign users
            ) {
                return res.status(401).json({ message: `Unauthorized level: Your level (${authUserDpLevel}) in ${dpName} is insufficient.` });
            }
        }

        const fields = [
            'name',
            'surname',
            'email',
            'departments',
            'highestLevel',
            'pswd',
            'id',
            'pubid'
        ]

        const user = await Human.create(User, { fields: fields })
        const userResponse = user.toJSON();
        userResponse.pswd = pswd;
        userResponse.id = id;

        res.status(200).json(userResponse)
    } catch (error) {
        res.status(500).json({ message: "internal server error" })
        console.log("Error in createUser controller", error)
    }
}

export const updateUserInfo = async (req, res) => {
    try {

    } catch (error) {

    }
}

export const deleteUser = async (req, res) => {
    try {

    } catch (error) {

    }
}