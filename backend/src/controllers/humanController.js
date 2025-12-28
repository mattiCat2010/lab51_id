import * as crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Human } from "../models/human.js";
import { checkDepartments } from '../utils/checkDepartments.js';
import { isMemberManaged } from '../utils/isMemberManaged.js';
import { updateUser } from '../utils/updateUser.js';
// import { Op } from "sequelize";

export const getUserInfo = async (req, res) => {
    try {
        const { pubid } = req.params;
        if(isNaN(pubid)) return res.status(400).json({ message: "Malformed Request: " + pubid + " is not a valid id" })
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

        const authResult = checkDepartments(dpArr, authDpArr);
        if (authResult.error) {
            return res.status(authResult.status).json({ message: authResult.message });
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

        res.status(201).json({ message: "User created succesfully", user: userResponse})
    } catch (error) {
        res.status(500).json({ message: "internal server error" })
        console.log("Error in createUser controller", error)
    }
}

export const updateUserInfo = async (req, res) => {

    /*
        This controller manages the routes to update a user in the human table
        The rules to make changes to a user are generally these:
                - A user can edit their own data without restriction except for the highestLevel
                    and departments properties which can only be changed by another user of higher level
                - A user can change another user's highestLevel or departments if he/she is a department manager or higher
                    and if the departments is a department he/she manages
                - NO ONE can edit system critical information (pubid, token, token creation date, id)
                        in special case an admin (level 4) can change, disable, remove the private id
                        (for example if a user loses his keycard and the id might be stolen)
        There are a few conventions about the request format:
                - First the fields regarding the user to change must be preceded with "target":

                        departments ==> targetDepartments

                        PS for purely aesthetic reasons "pubid" becomes "targetId" and not "targetPubId"

                - Second all the fields to update must be preceded with "new" ("new"+"Param"):

                        name ==> newName
    */



    try {
        const User = { ...req.body };
        const authUser = req.authUser.dataValues;
        let newUser = {};

        // Primary checks
        if (!authUser) {
            return res.status(500).json({ message: "Authentication context missing." });
        }

        if (!User.targetId) {
            return res.status(403).json({ message: "targetId is required to update a user." });
        }

        if (authUser.pubid != User.targetId) {
            // Verify if user is Admin
            if (authUser.highestLevel < 3) {
                return res.status(403).json({ message: "Forbidden: Minimum level 3 required to update users." });
            }

            const user = await Human.findOne({
                where: { pubid: User.targetId },
                attributes: ["departments", "highestLevel"]
            })

            if (!user) {
                return res.status(404).json({ message: "Target user not found." });
            }

            // check if the target user is a member of at least one department
            // where the authenticated user is a manager (level >= 3)
            let authResult = isMemberManaged(user.dataValues.departments, authUser.departments);
            if (authResult.error) {
                return res.status(authResult.status).json({ message: authResult.message });
            }

            // check if the changes in the target user are valid for my dp
            if (User.newDepartments) {
                authResult = checkDepartments(User.newDepartments, authUser.departments);
                if (authResult.error) {
                    return res.status(authResult.status).json({ message: authResult.message });
                }

                // Merge departments: only change what's different (add/update entries)
                // Keep existing departments that are not mentioned in newDepartments
                const currentDeps = user.dataValues.departments || [];
                const depMap = currentDeps.reduce((m, s) => {
                    const [n, lv] = String(s).split('.');
                    m[n] = Number(lv);
                    return m;
                }, {});

                for (const s of User.newDepartments) {
                    const [n, lv] = String(s).split('.');
                    const level = Number(lv);
                    if (Number.isNaN(level)) continue; // ignore malformed entries
                    // level 0 means remove department
                    if (level === 0) {
                        delete depMap[n];
                    } else {
                        depMap[n] = level;
                    }
                }

                newUser.departments = Object.entries(depMap).map(([n, lv]) => `${n}.${lv}`);
            }

            // check if newHighestLevel is valid and assign it to newUser for the update
            if (User.newHighestLevel) {
                if (User.newHighestLevel > authUser.highestLevel) {
                    return res.status(401).json({ message: `Unauthorized: New user level can't be higher than your level (${authUser.highestLevel}).` });
                }
                newUser.highestLevel = User.newHighestLevel;
            }

            const updatedUser = await updateUser(User.targetId, newUser, ["highestLevel", "departments"]);

            if (updatedUser.error) {
                return res.status(500).json({ message: "Failed to update user." });
            }
            return res.status(200).json({ message: "User updated successfully", data: updatedUser.dataValues });
        } else {
            // fill newUser with requests info 
            if(User.newName) newUser.name = User.newName;
            if(User.newEmail) {
                let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!regex.test(User.newEmail)) {
                    return res.status(422).json({ message: "Invalid email" });
                }
                newUser.email = User.newEmail;
            }
            if(User.newSurname) newUser.surname = User.newSurname;
            if(User.newPswd) newUser.pswd = await bcrypt.hash(User.newPswd, 10);
            if (User.newDepartments) {
                // Users cannot change their own departments. Require elevated privilege.
                return res.status(403).json({ message: 'Forbidden: You cannot change your own departments.' });
            }

            try {
                const updatedUser = await updateUser(User.targetId, newUser, ["name", "surname", "email", "pswd"]);
                return res.status(200).json({ message: "User updated successfully", data: updatedUser.dataValues });
            } catch (error) {
                console.log("Failed to update user:", error);
                return res.status(500).json({ message: "Failed to update user." });
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
        console.log("Error in updateUserInfo: ", error);
    }
}

export const deleteUser = async (req, res) => {
    try {
        return res.status(501).json({ message: "Not implemented" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
        console.log("Error in deleteUser: ", error);
    }
}
