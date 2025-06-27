const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  user_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, {
  collection: 'user_accounts' // 👈 your custom collection name
});

module.exports = mongoose.model('User', userSchema);
