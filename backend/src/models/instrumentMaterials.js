// TEST junction table
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const InstrumentMaterials = sequelize.define('InstrumentMaterials', {
  // No need for a pubid or auto-incrementing key here, 
  // as the primary key is the combination of the two foreign keys.
}, {
    tableName: 'InstrumentMaterials',
    timestamps: false
});