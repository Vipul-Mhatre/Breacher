const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { Alert } = require('../models');

// Get all alerts
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ timestamp: -1 })
      .populate('logId');

    res.json({
      status: 'success',
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update alert status
router.patch('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        status: 'error',
        message: 'Alert not found'
      });
    }

    res.json({
      status: 'success',
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router; 