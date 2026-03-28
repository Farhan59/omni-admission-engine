require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const adminRoutes = require('./routes/adminRoutes');
// const studentRoutes = require('./routes/studentRoutes'); // To be added

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Omni Admission Engine is running.' });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate().then(() => {
  console.log('Database connected successfully.');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
});
