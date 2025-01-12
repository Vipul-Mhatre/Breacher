require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const { initSocket } = require('./config/socket');
const routes = require('./routes');
const config = require('./config/config');
const connectDB = require('./database/mongodb');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(xss());
app.use(mongoSanitize());

// Routes
app.use('/api', routes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

// Connect to MongoDB
connectDB();

// Start server
const port = config.app.port;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Initialize Socket.io
initSocket(server); 