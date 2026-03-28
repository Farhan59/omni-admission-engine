const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Program = sequelize.define('Program', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Science', 'Engineering', 'Agriculture'),
    allowNull: false
  },
  seats_per_section: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  total_sections: {
    type: DataTypes.INTEGER,
    defaultValue: 2
  },
  total_capacity: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.seats_per_section * this.total_sections;
    }
  }
}, {
  timestamps: false
});

module.exports = Program;
