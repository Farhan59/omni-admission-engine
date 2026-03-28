const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  registration_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.ENUM('Focused', 'Diverse'),
    allowNull: false
  },
  preliminary_score: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  preliminary_qualified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  round2_math_score: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  round2_bio_score: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  eng_rank: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  agri_rank: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true // Useful for tracking when uploaded
});

module.exports = Student;
