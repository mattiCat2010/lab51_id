import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Instrument = sequelize.define(
  'instrument',
  {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    availability: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    materials: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true
    },
    requiredLevel: {
        type: DataTypes.SMALLINT,
        allowNull: true
    }
  },
  {
    tableName: "Instrument",
    timestamps: false
  },
);

// const sync = async () => { await Instrument.sync({force: true}) }

// sync();