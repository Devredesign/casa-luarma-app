// server/Chatbot.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';  // la ruta de Lilo

// Carga variables de entorno
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Monta la ruta de chat en /api/chat
app.use('/api/chat', chatRouter);

// Aquí podrías montar otras rutas, p.ej.
// import spacesRouter from './routes/spaces.js';
// app.use('/api/spaces', spacesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
