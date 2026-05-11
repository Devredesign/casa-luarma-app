import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

export default function CalendarWidget() {
  const embedUrl = process.env.REACT_APP_CALENDAR_EMBED_URL || 'https://calendar.google.com/calendar/u/0/r';
  const openUrl = process.env.REACT_APP_CALENDAR_OPEN_URL || 'https://calendar.google.com/calendar/u/0/r';

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Calendario</Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => window.open(openUrl, '_blank', 'noopener,noreferrer')}
        >
          Abrir
        </Button>
      </Box>

      {!embedUrl ? (
        <Typography variant="body2" color="text.secondary">
          No hay URL de embed configurada. Agregá <code>REACT_APP_CALENDAR_EMBED_URL</code> en tu <code>.env.local</code>.
        </Typography>
      ) : (
        <Box sx={{ width: '100%', height: 520 }}>
          <iframe
            title="Google Calendar"
            src={embedUrl}
            style={{ border: 0, width: '100%', height: '100%' }}
            frameBorder="0"
            scrolling="no"
          />
        </Box>
      )}
    </Paper>
  );
}
