import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Project = sequelize.define(
  'project',
  {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    projectOwner: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requiredLevel: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: "Project"
  },
);

// const sync = async () => { await Project.sync({force: true}) }

// sync();