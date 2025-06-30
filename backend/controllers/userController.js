const User = require('../models/User');

// POST /api/user-name
const getUserNameById = async (req, res) => {
  const { user_id } = req.body;

  try {
    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const firstName = user.user_name.split(' ')[0]; // 🪓 get only first name
    return res.status(200).json({ user_name: firstName });

  } catch (err) {
    console.error('❌ Error in getUserNameById:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserNameById };
