// src/components/ChatLilo.jsx
import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Box, Typography, TextField, IconButton, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function ChatLilo() {
  const [msgs, setMsgs] = useState([
    { role: 'system', content: 'Sos Lilo, el asistente de Casa Luarma…' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef();

  // auto-scroll al final
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [msgs]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const updated = [...msgs, { role: 'user', content: input }];
    setMsgs(updated); setInput('');
    try {
      const { data } = await api.post('/chat', { messages: updated });
      setMsgs(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Error contactando a Lilo.' }]);
    }
  };

  return (
    <Paper sx={{ p:2, maxWidth:800, mx:'auto', height:400, overflowY:'auto', mt:4 }}>
      {msgs.filter(m=>m.role!=='system').map((m,i) => (
        <Box key={i} sx={{
          display:'flex',
          justifyContent: m.role==='user' ? 'flex-end':'flex-start',
          mb:1
        }}>
          <Box sx={{
            bgcolor: m.role==='user'? 'primary.main':'grey.300',
            color: m.role==='user'? 'primary.contrastText':'text.primary',
            p:1.5, borderRadius:2, maxWidth:'80%'
          }}>
            <Typography variant="body2" sx={{ fontWeight:'bold' }}>
              {m.role==='user' ? 'Vos' : 'Lilo'}
            </Typography>
            <Typography variant="body1">{m.content}</Typography>
          </Box>
        </Box>
      ))}
      <div ref={bottomRef} />
      <Box sx={{ display:'flex', mt:1 }}>
        <TextField
          fullWidth
          placeholder="Escribí tu mensaje…"
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter' && handleSend()}
          size="small"
        />
        <IconButton onClick={handleSend} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}