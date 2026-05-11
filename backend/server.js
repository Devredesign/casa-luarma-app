// backend/server.js
require('dotenv').config();  // Carga variables de entorno
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const chatRoutes = require('./routes/chat');
const studentRoutes = require('./routes/students');
const classRoutes = require('./routes/classes');
const rentalRoutes = require('./routes/rentals');
const spaceRoutes = require('./routes/spaces');
const modalityRoutes = require('./routes/modalities');
const costRoutes = require('./routes/costs');
const paymentRoutes = require('./routes/payments');
const financeRoutes = require('./routes/finance');
const financeTeachersRoutes = require('./routes/financeTeachers');
const teacherRoutes = require('./routes/teachers');

const app = express();

// CORS: permitir orígenes desde .env (opcional)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sin origin (Postman, etc.)
    if (!origin) return callback(null, true);

    // Si no se configuró ALLOWED_ORIGINS, permitir todo (modo dev)
    if (allowedOrigins.length === 0) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error al conectar MongoDB:', err));

// Rutas API
app.use('/api/chat', chatRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/modalities', modalityRoutes);
app.use('/api/costs', costRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/finance/teachers', financeTeachersRoutes);
app.use('/api/teachers', teacherRoutes);

// Endpoint simple para salud del server
app.get('/', (req, res) => {
  res.send('API Casa Luarma corriendo ✅');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

