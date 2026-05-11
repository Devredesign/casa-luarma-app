import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

export default function CalendarWidget() {
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
      )}
    </Paper>
  );
}
