const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { Log } = require('../models');

// Get all logs with pagination
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    const total = await Log.countDocuments();

    res.json({
      status: 'success',
      data: {
        logs,
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get anomaly logs
router.get('/anomalies', protect, restrictTo('admin'), async (req, res) => {
  try {
    const anomalies = await Log.find({ isAnomaly: true })
      .sort({ timestamp: -1 })
      .populate('userId', 'name email');

    res.json({
      status: 'success',
      data: anomalies
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router; 