// src/components/ChatWidget.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper } from '@mui/material';

export default function ChatWidget() {
  const [input, setInput]   = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: '¡Hola! ¿En qué puedo ayudarte hoy?' }
  ]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    // Añade el mensaje del usuario a la lista
    setMessages(prev => [...prev, { from:'user', text: input }]);
    const userMsg = input;
    setInput('');

    try {
      const res = await axios.post('/api/chat', { message: userMsg });
      const botReply = res.data.reply;
      setMessages(prev => [...prev, { from:'bot', text: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { from:'bot', text: 'Lo siento, algo salió mal.' }]);
    }
  };

  return (
    <Paper sx={{ p:2, maxWidth:400 }}>
      <List sx={{ maxHeight:300, overflowY:'auto' }}>
        {messages.map((m, i) => (
          <ListItem key={i}>
            <ListItemText
              primary={m.text}
              sx={{ textAlign: m.from==='user' ? 'right' : 'left' }}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display:'flex', mt:1 }}>
        <TextField
          fullWidth
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && sendMessage()}
          placeholder="Escribe tu mensaje…"
        />
        <Button onClick={sendMessage}>Enviar</Button>
      </Box>
    </Paper>
  );
}
