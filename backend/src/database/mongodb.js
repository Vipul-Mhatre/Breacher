const mongoose = require('mongoose');
const config = require('../config/config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize models
    require('../models');
    
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 