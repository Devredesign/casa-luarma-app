import { Router } from 'express';
import { Configuration, OpenAIApi } from 'openai';

const router = Router();
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

// POST /api/chat
router.post('/', async (req, res) => {
  const { messages } = req.body;
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
    });
    res.json({ message: completion.data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al contactar a Lilo' });
  }
});

export default router;
