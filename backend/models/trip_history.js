const mongoose = require('mongoose');

const tripHistorySchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  history_id: { type: String, required: true, unique: true },
  from: { type: Object, required: true },  // { lat, lng }
  from_name: { type: String },
  destination: { type: Object, required: true },  // { lat, lng }
  destination_name: { type: String },
  checkpoints: { type: Array, default: [] }, // array of coordinate objects
  date_start: { type: Date, required: true },
  duration: { type: Number, required: true }
}, {
  collection: 'trip_history'
});

module.exports = mongoose.model('TripHistory', tripHistorySchema);