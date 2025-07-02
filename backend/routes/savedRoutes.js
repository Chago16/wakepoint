const express = require('express');
const router = express.Router();
const SavedRoute = require('../models/saved_routes');

// POST - Save a route
router.post('/', async (req, res) => {
  try {
    const newRoute = new SavedRoute(req.body);
    await newRoute.save();
    res.status(201).json({ message: 'Route saved' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET - Get all routes of a user
router.get('/:user_id', async (req, res) => {
  try {
    const routes = await SavedRoute.find({ user_id: req.params.user_id });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
