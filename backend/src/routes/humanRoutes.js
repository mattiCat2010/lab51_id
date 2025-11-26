import express from "express";
import { getFullUserData, getUserInfo, getUsersList, createUser, updateUserInfo, deleteUser } from "../controllers/humanController.js";

const router = express.Router();

/* DEBUG FUNCTION
export const debug = () => {
    console.log("Debug")
}
*/

router.get("/", getUsersList);
router.get("/:pubid", getUserInfo);
router.post("/get-user/:pubid", getFullUserData);

// ADMIN ONLY
router.post("/new-user", createUser);
router.put("/:pubid", updateUserInfo); // USER can update their own data
router.delete("/:id", deleteUser); // USER can delete their own data

export default router;