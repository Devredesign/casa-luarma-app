// backend/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },

  // ✅ NUEVO: modalidad elegida en el pago
  modalityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Modality',
    required: true
  },

  // ✅ SNAPSHOT recomendado (histórico)
  pricePerSession: { type: Number, required: true },
  teacherPayPerSession: { type: Number, required: true },

  // ✅ total pagado (calcula backend)
  amount: { type: Number, required: true },

  method: { type: String, required: true },
  paymentDate: { type: Date, required: true },

  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },

  sessions: { type: Number, default: 1 },
  eventId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
