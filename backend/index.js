// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';  // <- ruta correctamente exportada

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// monta /api/chat
app.use('/api/chat', chatRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend corriendo en puerto ${PORT}`));
