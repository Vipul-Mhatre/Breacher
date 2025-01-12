const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const { createServer } = require('http');
const connectDB = require('./src/database/mongodb');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// Initialize database connection
connectDB();

const io = socketIO(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

// Basic middleware
app.use(cors());
app.use(express.json());

// Security middleware (with try-catch to handle missing modules)
try {
  const helmet = require('helmet');
  const xss = require('xss-clean');
  const mongoSanitize = require('express-mongo-sanitize');
  const securityHeaders = require('./src/middleware/securityHeaders');
  const ipFilter = require('./src/middleware/ipFilter');
  const sanitize = require('./src/middleware/sanitize');

  app.use(helmet());
  app.use(xss());
  app.use(mongoSanitize());
  app.use(securityHeaders());
  app.use(ipFilter);
  app.use(sanitize);
} catch (error) {
  console.warn('Some security middleware failed to load:', error.message);
}

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/logs', require('./src/routes/logs.routes'));
app.use('/api/alerts', require('./src/routes/alerts.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
}); 