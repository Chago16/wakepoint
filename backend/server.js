const express = require('express');
const connectDB = require('./db');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const mapboxRoutes = require('./routes/mapboxRoutes');
const directionsRoutes = require('./routes/directions');
const savedRoutes = require('./routes/savedRoutes'); // ✅ ADD THIS
const tripHistoryRoutes = require('./routes/tripHistory'); // ✅ import the route

const app = express();
const PORT = 3000;

connectDB();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/mapbox', mapboxRoutes);
app.use('/api', directionsRoutes);
app.use('/api/saved-routes', savedRoutes); // ✅ ADD THIS
app.use('/api/trip-history', tripHistoryRoutes); // ✅ define the endpoint

app.get('/', (req, res) => {
  res.send('WakePoint Backend Server ✅');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
