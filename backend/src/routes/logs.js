const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { restrictTo } = require('../middleware/auth');

router.post('/', logController.createLog);
router.get('/', logController.getLogs);
router.get('/anomalies', logController.getAnomalies);

module.exports = router; 