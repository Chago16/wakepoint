const express = require('express');
const router = express.Router();
const {
  forwardGeocode,
  reverseGeocode,
} = require('../controllers/mapboxController');

// 🌍 Text → Coordinates
router.get('/geocode', forwardGeocode);

// 📍 Coordinates → Address
router.get('/reverse-geocode', reverseGeocode);

module.exports = router;
