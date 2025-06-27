const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // adjust path if needed

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

module.exports = router;
