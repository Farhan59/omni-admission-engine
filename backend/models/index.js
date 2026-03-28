const sequelize = require('../config/db');
const Program = require('./Program');
const Student = require('./Student');
const Choice = require('./Choice');
const Allocation = require('./Allocation');

// Set up relationships
Student.hasMany(Choice, { foreignKey: 'student_id' });
Choice.belongsTo(Student, { foreignKey: 'student_id' });

Program.hasMany(Choice, { foreignKey: 'program_id' });
Choice.belongsTo(Program, { foreignKey: 'program_id' });

Student.hasOne(Allocation, { foreignKey: 'student_id' });
Allocation.belongsTo(Student, { foreignKey: 'student_id' });

Program.hasMany(Allocation, { foreignKey: 'program_id' });
Allocation.belongsTo(Program, { foreignKey: 'program_id' });

module.exports = {
  sequelize,
  Program,
  Student,
  Choice,
  Allocation
};
