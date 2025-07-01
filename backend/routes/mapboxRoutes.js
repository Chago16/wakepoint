const express = require('express');
const router = express.Router();
const {
  forwardGeocode,
  reverseGeocode,
  searchLocations, // ✅ include this too
} = require('../controllers/mapboxController');

// 🌍 Text → Coordinates
router.get('/geocode', forwardGeocode);

// 📍 Coordinates → Address
router.get('/reverse-geocode', reverseGeocode);

// 🔍 Autocomplete / location search
router.get('/search', searchLocations);

module.exports = router;
