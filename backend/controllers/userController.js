// controllers/userController.js
const User = require('../models/User');

exports.getUserNameById = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user_name: user.user_name });
  } catch (err) {
    console.error('Error fetching user name:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
