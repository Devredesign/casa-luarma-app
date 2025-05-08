const mongoose = require('mongoose');

const modalitySchema = new mongoose.Schema({
  name:  { type: String, required: true, unique: true },
  price: { type: Number, required: true },       // precio por sesión
  teacherPay:  { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Modality', modalitySchema);
