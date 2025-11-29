import * as crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Human } from "../models/human.js";
// import { Op } from "sequelize";

export const getUserInfo = async (req, res) => {
    try {
        const { pubid } = req.params; 
        const user = await Human.findAll({
            where: {
                pubid: pubid
            },
            attributes: { exclude: ['pswd', 'id', 'tempToken'] }
        })

        if(user) return res.status(200).json(user)

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

        if(user) return res.status(200).json(user)

        res.status(404).json({ message: `Error user ${pubid} dosn't exist` })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
        console.log("Error in getUserInfo: ", error)
    }
}

export const getFullUserData = async (req, res) => {
    try {
        const { pubid } = req.authUser[0].dataValues;
        
        const user = await Human.findAll({
            where: {
                pubid: pubid,
            }
        })

        // console.log(user[0].dataValues.departments.length) // Debug

        if(user) return res.status(200).json(user[0])
        res.status(404).json({ message: "User not found" })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
        console.log("Error in getFullUSerData: ", error)
    }
}

export const createUser = async (req, res) => {
    try {
        const User = { ...req.body };
        const authUser = req.authUser[0].dataValues;

        // Primary checks
        if (!authUser) {
            return res.status(500).json({ message: "Authentication context missing." });
        }
        if (authUser.highestLevel < 3) {
            return res.status(401).json({ message: "Unauthorized access: Minimum level 3 required to create users." });
        }
        if (authUser.highestLevel < User.higestLevel) {
            return res.status(401).json({ message: `Unauthorized: New user level can't be higher than your level (${authUser.highestLevel}).` });
        }
        if (User.higestLevel >= 2 && !User.pswd) {
            return res.status(406).json({ message: "Password required for user level 2 or higher." });
        }

        // if(authUser.higestLevel < 3) return res.status(401).json({ message: "Unauthorized acces" })
        // if(User.higestLevel >= 2 && !User.pswd) return res.status(406).json({ message: "Password required for level higher than 2" });

        const id = crypto.randomUUID();
        const hashId = await bcrypt.hash(id, 10);

        User.id = hashId;

        const pswd = "";

        if (User.pswd) {
            pswd = User.pswd;
            User.pswd = await bcrypt.hash(User.pswd, 10);
        }

        const dpArr = User.departments || [];
        const authDpArr = authUser.departments || [];

        // Prepare authUser's department map for easy lookup: { 'name': level }
        const authDpMap = authDpArr.reduce((map, dpString) => {
            const [name, level] = dpString.split(".");
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

            // Check 2: Can the authorized user create a user at this level in this department?
            // This needs to be strictly lower or equal, AND the auth user must have sufficient level (level > 2)
            if (
                newDpLevel > authUserDpLevel || // New user level is higher than auth user's level in that department
                authUserDpLevel < 3             // Auth user's level in this department is too low to assign users
            ) {
                 return res.status(401).json({ message: `Unauthorized level: Your level (${authUserDpLevel}) in ${dpName} is insufficient.` });
            }
        }

        // const dpArr = User.departments;
        // const authDpArr = authUser.departments;

        // let authDpNames = [];
        // let authDpLv = [];

        // for(let i = 0; i < authDpArr.length; i++){
        //     const dp = authDpArr[i].split(".");
        //     authDpLv.push(Number(dp[1]));
        //     authDpNames.push(dp[0]);
        // }

        // for(let i = 0; i < dpArr.length; i++){
        //     const dp = dpArr[i].split(".");
        //     const dpLv = Number(dp[1]);
        //     const dpName = dp[0];

        //     if(
        //         authDpNames.includes(dpName) 
        //         && dpLv <= authDpLv[authDpNames.findIndex(dpName)] 
        //         && authDpLv[authDpNames.findIndex(dpName)] > 2
        //     );

        //     else return res.status(401).json({ message: `Unauthorized department ${dpName}` })
        // }

        // if(authUser.higestLevel < User.higestLevel) return res.status(401).json({ message: `Unauthorized: newUser level can't be higher than authUser level` })

        const fields = [
            'name',
            'surname',
            'email',
            'departments',
            'higestLevel',
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