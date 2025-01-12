const { initStorage } = require('./jsonStorage');
const defaultUsers = require('../config/defaultUsers');
const { db } = require('./jsonStorage');

const connectDB = async () => {
  try {
    // Initialize JSON storage
    await initStorage();
    console.log('JSON Storage initialized');
    
    // Initialize default users if they don't exist
    for (const user of defaultUsers) {
      const existingUser = await db.users.findOne({ email: user.email });
      if (!existingUser) {
        await db.users.create(user);
        console.log(`Created default user: ${user.email}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Storage Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 