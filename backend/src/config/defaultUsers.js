require('dotenv').config();

const defaultUsers = [
  {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: process.env.ANALYST_EMAIL || 'analyst@example.com',
    password: process.env.ANALYST_PASSWORD || 'analyst123',
    name: 'Analyst User',
    role: 'analyst'
  }
];

module.exports = defaultUsers; 