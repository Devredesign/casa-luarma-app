// backend/models/Space.js
const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    squareMeters: { type: Number, required: true },
    description: { type: String },
    color: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Space', spaceSchema);

