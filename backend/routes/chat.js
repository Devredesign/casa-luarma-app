// backend/routes/chat.js
import { Router } from 'express';
import { Configuration, OpenAIApi } from 'openai';

// Inicializar router
const router = Router();

// Configurar OpenAI con la clave en .env
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

// POST /api/chat
// Recibe un array de mensajes y devuelve la respuesta de GPT
router.post('/', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages debe ser un array' });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
    });
    const reply = completion.data.choices[0].message.content;
    res.json({ message: reply });
  } catch (err) {
    console.error('Error al llamar a OpenAI:', err);
    res.status(500).json({ error: 'Error al contactar a Lilo' });
  }
});

export default router;
