import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Material = sequelize.define(
  'material',
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
    inStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    shopLink: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    materialData: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datasheetLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // location: {
    //   // storage location id, future implementation
    // },
    requiredLevel: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: "Material",
    timestamps: false
  },
);

// const sync = async () => { await Material.sync({force: true}) }

// sync();