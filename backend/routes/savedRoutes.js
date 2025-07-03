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

// DELETE - Delete a saved route by its ID
router.delete('/:saved_route_id', async (req, res) => {
  try {
    const { saved_route_id } = req.params;
    const deleted = await SavedRoute.findOneAndDelete({ saved_route_id });

    if (!deleted) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ message: 'Route deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Get one route by saved_route_id
router.get('/id/:saved_route_id', async (req, res) => {
  try {
    const route = await SavedRoute.findOne({ saved_route_id: req.params.saved_route_id });
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update a saved route by its ID
router.put('/:saved_route_id', async (req, res) => {
  try {
    const { saved_route_id } = req.params;
    const updates = req.body;

    const updatedRoute = await SavedRoute.findOneAndUpdate(
      { saved_route_id },
      { ...updates, date_modified: new Date().toISOString() },
      { new: true }
    );

    if (!updatedRoute) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ message: 'Route updated', route: updatedRoute });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
