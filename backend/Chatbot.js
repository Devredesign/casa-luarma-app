// server/Chatbot.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';  // <— la ruta que ahora maneja POST /chat

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Aquí montas **todas** tus rutas de API bajo /api
app.use('/api', chatRouter);
// si tuvieras otros routers:
// import spacesRouter from './routes/spaces.js';
// app.use('/api/spaces', spacesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
