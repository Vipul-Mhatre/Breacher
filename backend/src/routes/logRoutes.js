const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { protect } = require('../middleware/auth');

// Log routes
router.get('/:id/verify', protect, logController.verifyLog);
router.get('/blockchain/status', protect, logController.getBlockchainStatus);
// Add other log routes here

module.exports = router; 