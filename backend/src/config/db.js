import { Client } from "pg";

const dbConnection = new Client({
    host: "localhost",
    user: "postgres",
    port: 4468,
    password: "M4t_C4t#2010",
    database: "lab51id_db"
})

export const dbConnect = async () => {
    try {
        dbConnection.connect().then(
            console.log("DATABASE CONNECTED SUCCESFULLY")
        )    
    } catch (error) {
        console.log("Error connecting to database", error)
        process.exit(1)
    }
    
}