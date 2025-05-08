// backend/models/Rental.js
const mongoose = require('mongoose');
const rentalSchema = new mongoose.Schema({
  space:       { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
  tenantName:  { type: String, required: true },
  activityName:{ type: String, required: true },
  hours:       { type: Number, required: true },
  startTime:   { type: Date,   required: true },
  eventId:     { type: String, default: null }
}, { timestamps: true });
module.exports = mongoose.model('Rental', rentalSchema);
