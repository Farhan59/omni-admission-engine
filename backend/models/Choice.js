const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Student = require('./Student');
const Program = require('./Program');

const Choice = sequelize.define('Choice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
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
  },
  preference_order: {
    type: DataTypes.INTEGER,
    allowNull: false // 1 means Choice 1, 2 means Choice 2
  }
}, {
  timestamps: false
});

module.exports = Choice;
