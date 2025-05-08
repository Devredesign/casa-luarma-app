// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Conectar a Mongo
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tuDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas existentes
app.use('/api/spaces', require('./routes/spaces'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/modalities', require('./routes/modalities'));
app.use('/api/rentals', require('./routes/rentals'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/finance/teachers', require('./routes/financeTeachers'));
app.use('/api/costs', require('./routes/costs'));
// **¡AÑADE ESTA LÍNEA PARA ESTUDIANTES!**
app.use('/api/students', require('./routes/students'));

// Error handler genérico (opcional)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Levantar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

