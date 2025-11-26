import { human } from "../models/human.js";
// import {  } from "sequelize";

export const getUserInfo = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

export const getUsersList = async (req, res) => {
    try {
        
    } catch (error) {
        
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
        const user = await human.create(User)
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