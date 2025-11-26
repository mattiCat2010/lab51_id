import {Sequelize } from "sequelize";

export const sequelize = new Sequelize('lab51id_db', 'lab51idserver', 'L4b511d-S', {
  host: 'localhost',
  port: '4468',
  dialect: "postgres"
});

export const dbConnect = async () => {
    try {
        await sequelize.authenticate()
        
        console.log('DATABASE CONNECTED SUCCESFULLY')
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}