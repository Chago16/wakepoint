const express = require('express');
const router = express.Router();
const { getDirections } = require('../controllers/directionsController');

// POST /api/directions
router.post('/directions', getDirections);

module.exports = router;
