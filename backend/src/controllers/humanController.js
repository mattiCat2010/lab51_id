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
        
    } catch (error) {
        
    }
}

export const createUser = async (req, res) => {
    console.log("function called")
    try {
        console.log("recived reqest")
        const User = req.body;
        const user = await Human.create(User, { fields: ['pubid', 'name', 'surname', 'departments', 'email', 'higestLevel', 'pswd'] })
        res.status(200).json(user)
        console.log("reqest succesful")
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