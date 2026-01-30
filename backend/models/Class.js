// backend/models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  modality:        { type: mongoose.Schema.Types.ObjectId, ref: 'Modality', default: null },
  isRecurring:     { type: Boolean, default: false },
  professor:       { type: String, required: true },
  schedule:        { type: Date,   required: true },
  space:           { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
  eventId:         { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
