const express = require('express');
const connectDB = require('./db');
require('dotenv').config();
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

connectDB(); // ✅ connects to MongoDB Atlas

app.use(express.json()); // middleware
app.use('/auth', authRoutes); // routes

app.get('/', (req, res) => {
  res.send('WakePoint Backend Server ✅');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
