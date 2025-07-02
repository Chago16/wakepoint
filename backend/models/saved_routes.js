const mongoose = require('mongoose');

const savedRouteSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // You can also use mongoose.Schema.Types.ObjectId if you want to reference the User model directly
  saved_route_id: { type: String, required: true, unique: true },
  from: { type: Object, required: true }, // { lat: Number, lng: Number }
  from_name: { type: String },
  destination: { type: Object, required: true }, // { lat: Number, lng: Number }
  destination_name: { type: String },
  checkpoints: { type: Array, default: [] }, // Array of coordinate objects
  alarm_sound: { type: String },
  vibration: { type: Boolean, default: false },
  notif_early: { type: Number }, // in minutes
  date_modified: { type: Date, default: Date.now }
}, {
  collection: 'saved_routes'
});

module.exports = mongoose.model('SavedRoute', savedRouteSchema);
