const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { db } = require('../database/jsonStorage');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', authController.register);
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ status: 'success', token, user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router; 