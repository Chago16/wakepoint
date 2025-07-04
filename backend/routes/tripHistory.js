const express = require('express');
const router = express.Router();
const TripHistory = require('../models/trip_history');

// CREATE trip history
router.post('/', async (req, res) => {
  try {
    const trip = new TripHistory(req.body);
    await trip.save();
    res.status(201).json({ message: 'Trip history saved!', trip });
  } catch (err) {
    console.error('Failed to save trip history:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET all trip histories by user_id
router.get('/:user_id', async (req, res) => {
  try {
    const trips = await TripHistory.find({ user_id: req.params.user_id }).sort({ date_start: -1 });
    res.status(200).json(trips);
  } catch (err) {
    console.error('Failed to fetch trip histories:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET one trip history by history_id
router.get('/one/:history_id', async (req, res) => {
  try {
    const trip = await TripHistory.findOne({ history_id: req.params.history_id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.status(200).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
