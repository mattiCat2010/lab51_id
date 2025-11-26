import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export const human = sequelize.define(
  'human',
  {
    // Model attributes are defined here
    pubid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    surname: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    highestLevel: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    departments: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
    tempToken: {
        type: DataTypes.UUID,
        unique: true
    },
    pswd: {
        type: DataTypes.STRING
    }
  },
  {
    tableName: "Human"
  },
);