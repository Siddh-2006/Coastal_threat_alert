const express = require('express');
const router = express.Router();
const { getAlertsForLocation } = require('../controllers/alertController');

router.get('/location', getAlertsForLocation);

module.exports = router;