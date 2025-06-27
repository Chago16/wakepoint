const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // adjust path if needed

// ✅ REGISTER
router.post('/register', async (req, res) => {
  console.log('📥 Register request received');
  console.log('➡️  Body:', req.body);

  try {
    const { user_name, email, password } = req.body;

    if (!user_name || !email || !password) {
      console.log('⚠️  Missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('❌ Email already used');
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user_id = 'UID_' + Date.now().toString();

    const newUser = new User({ user_id, user_name, email, password: hashed });
    await newUser.save();

    console.log('✅ User saved:', newUser);
    return res.json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('💥 Error during register:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  console.log('📥 Login request received');
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('⚠️  Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('❌ Incorrect password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Login success:', user.email);
    res.json({ message: 'Login successful', user_id: user.user_id });

  } catch (err) {
    console.error('💥 Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ✅ GET USER INFO
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ user_id: id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const firstName = user.user_name.split(' ')[0];
    res.json({ firstName });
  } catch (err) {
    console.error('💥 Error fetching user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
