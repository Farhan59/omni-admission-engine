const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Student = require('./Student');
const Program = require('./Program');

const Allocation = sequelize.define('Allocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    unique: true, // A student can only get one allocation
    references: {
      model: Student,
      key: 'id'
    }
  },
  program_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Program,
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Allocation;
