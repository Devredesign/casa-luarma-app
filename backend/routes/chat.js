// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
const app = express();

app.use(express.json());
// importa y monta tu ruta de chat
const chatRouter = require('./routes/chat');
app.use('/api/chat', chatRouter);

// Lee tu API key de process.env.OPENAI_API_KEY
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// POST /api/chat  { message: "Hola" }
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message' });

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }]
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

module.exports = router;

