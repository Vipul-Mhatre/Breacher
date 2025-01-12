const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { db } = require('../database/jsonStorage');
const bcrypt = require('bcrypt');

// Get all users (admin only)
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const users = await db.users.find();
    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create new user (admin only)
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Check if user exists
    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists'
      });
    }

    // Check if trying to create an admin
    if (role === 'admin') {
      // Count existing admins
      const admins = await db.users.find({ role: 'admin' });
      if (admins.length >= 2) {
        return res.status(400).json({
          status: 'error',
          message: 'Maximum number of admins (2) has been reached'
        });
      }
    }

    // Validate role
    if (!['analyst', 'employee', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.users.create({
      email,
      password: hashedPassword, // Store hashed password
      name,
      role
    });

    res.status(201).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update user (admin only)
router.patch('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { role, status } = req.body;
    const user = await db.users.update(req.params.id, { role, status });
    
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete user (admin only)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    await db.users.delete(req.params.id);
    
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router; 