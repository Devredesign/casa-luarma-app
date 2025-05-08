// backend/models/Cost.js
const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
  name:        { type: String, required: true },             // e.g. “Renta local”
  amount:      { type: Number, required: true },             // monto en colones
  type:        { type: String, enum: ['fixed','variable'], required: true },
  // Sólo para recurrentes: cada mes
  recurrence:  { type: String, enum: ['monthly'], default: null },
  dateIncurred:{ type: Date,   default: () => new Date() }   // para variable: fecha exacta
}, { timestamps: true });

module.exports = mongoose.model('Cost', costSchema);
