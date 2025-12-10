import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Department = sequelize.define(
  'department',
  {
    // pubid: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     unique: true,
    //     primaryKey: true,
    //     autoIncrement: true
    // },
    // id: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    //     unique: true
    // },
    // name: {
    //     type: DataTypes.TEXT,
    //     allowNull: false
    // },
    // surname: {
    //     type: DataTypes.TEXT,
    //     allowNull: false
    // },
    // email: {
    //     type: DataTypes.TEXT,
    //     allowNull: false,
    //     unique: true
    // },
    // higestLevel: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false
    // },
    // departments: {
    //     type: DataTypes.ARRAY(DataTypes.STRING),
    //     allowNull: false
    // },
    // tempToken: {
    //     type: DataTypes.STRING,
    //     unique: true
    // },
    // tempTokenCreatedAt: {
    //     type: DataTypes.DATE,
    //     unique: false
    // },
    // pswd: {
    //     type: DataTypes.STRING
    // }
  },
  {
    tableName: "Department",
    timestamps: false
  },
);

// const sync = async () => { await Department.sync({force: true}) }

// sync();