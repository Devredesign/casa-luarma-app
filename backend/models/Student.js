const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  cedula:  { type: String, required: true },        // ← nuevo
  email:   { type: String, required: true, unique: true },
  phone:   { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);