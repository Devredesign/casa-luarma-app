// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/chat
// Recibe un array de mensajes y devuelve la respuesta de GPT
router.post('/', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages debe ser un array' });
  }
  console.log('[chat.js] mensajes recibidos:', messages);
  try {
    console.log('[chat.js] llamando a OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
    });
    const reply = completion.choices[0].message.content;
    console.log('[chat.js] respuesta de OpenAI:', reply);
    res.json({ message: reply });
  } catch (err) {
    console.error('[chat.js] error OpenAI:', err);
    res.status(500).json({ error: 'Error al contactar a Lilo' });
  }
});

module.exports = router;
