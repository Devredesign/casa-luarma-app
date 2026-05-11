import React, { useState } from 'react';
import { Box, IconButton, TextField, Paper, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hola! ¿En qué te puedo ayudar con Casa Luarma?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleOpen = () => setOpen(prev => !prev);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newUserMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error en el chat');
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: 'Error: no pude responder. Revisá el backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      {!open ? (
        <IconButton color="primary" onClick={toggleOpen} sx={{ bgcolor: 'white' }}>
          <ChatIcon />
        </IconButton>
      ) : (
        <Paper elevation={3} sx={{ width: 320, height: 420, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">Asistente</Typography>
            <IconButton size="small" onClick={toggleOpen} sx={{ color: 'white' }}>
              ✕
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, p: 1, overflowY: 'auto' }}>
            {messages.map((m, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {m.role === 'user' ? 'Vos' : 'Asistente'}
                </Typography>
                <Typography variant="body2">{m.content}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              disabled={loading}
            />
            <IconButton onClick={sendMessage} disabled={loading}>
              ➤
            </IconButton>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ChatWidget;
