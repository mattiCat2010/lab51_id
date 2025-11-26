import {Sequelize } from "sequelize";

export const sequelize = new Sequelize('lab51id_db', 'postgres', 'M4t_C4t#2010', {
  host: 'localhost',
  port: '4468',
  dialect: "postgres"
});

export const dbConnect = async () => {
    try {
        sequelize.authenticate().then(
            console.log('DATABASE CONNECTED SUCCESFULLY')
        )
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}