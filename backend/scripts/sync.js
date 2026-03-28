require('dotenv').config({ path: __dirname + '/../.env' });
const mysql = require('mysql2/promise');
const { sequelize, Program } = require('../models');

async function syncDb() {
  try {
    // 1. Create DB if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'omni_admission'}\`;`);
    console.log('Database created or already exists.');
    await connection.end();

    // 2. Sync Models
    await sequelize.sync({ force: true });
    console.log('Tables synced.');

    // 3. Seed Programs
    const programsData = [];
    const categories = ['Science', 'Engineering', 'Agriculture'];
    
    // Generating 40 mock programs mixed across categories
    for (let i = 1; i <= 40; i++) {
        let category = categories[i % 3];
        programsData.push({
            name: `${category} Program ${i}`,
            category: category,
            seats_per_section: 20,
            total_sections: 2
        });
    }
    
    await Program.bulkCreate(programsData);
    console.log('Seeded 40 programs.');

    process.exit(0);
  } catch (error) {
    console.error('Error syncing DB:', error);
    process.exit(1);
  }
}

syncDb();
