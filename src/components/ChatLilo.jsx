// src/components/ChatLilo.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import api from '../services/api';

export default function ChatLilo() {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `Sos Lilo, el asistente cálido, acogedor y experto en redes sociales y actividades de Casa Luarma, un espacio cultural y artístico ubicado en Barrio Escalante, San José, Costa Rica. Casa Luarma se dedica al alquiler de espacios y a la enseñanza de arte y bienestar. Usás el voceo costarricense, con expresiones como "aprendé", "solicitá", "encontrá". Respondés preguntas sobre los espacios (Aula 1, Aula 2, Salón de Danza, Cocina, Sala de espera, Terraza) y las clases (canto popular, lírico, cante flamenco, guitarra clásica, eléctrica, flamenca, piano, bajo, violín, danza flamenca, ballet, barre, yoga). También ofrecés sugerencias para redes sociales y posts para web. Sé siempre amigable, útil y clara.`,
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const updated = [...messages, { role: "user", content: input.trim() }];
    setMessages(updated);
    setInput("");

    try {
      const { data } = await api.post("/chat", { messages: updated });
      setMessages([...updated, { role: "assistant", content: data.message }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...updated,
        { role: "assistant", content: "Ups, hubo un error comunicándome con Lilo." },
      ]);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2, height: 400, overflowY: "auto" }}>
        {messages
          .filter(m => m.role !== "system")
          .map((msg, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                mb: 1
              }}
            >
              <Box
                sx={{
                  bgcolor: msg.role === "user" ? "primary.main" : "grey.300",
                  color: msg.role === "user" ? "primary.contrastText" : "text.primary",
                  borderRadius: 2,
                  p: 1.5,
                  maxWidth: "80%"
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  {msg.role === "user" ? "Vos" : "Lilo"}
                </Typography>
                <Typography variant="body1">{msg.content}</Typography>
              </Box>
            </Box>
          ))}
        <div ref={bottomRef} />
      </Paper>

      <Box display="flex" sx={{ mt: 2 }}>
        <TextField
          fullWidth
          placeholder="Escribí tu mensaje…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          variant="outlined"
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          sx={{ ml: 1 }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
