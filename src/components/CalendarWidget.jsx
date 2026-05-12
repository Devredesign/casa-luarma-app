import { Box, Typography, Button, Paper } from '@mui/material';

export default function CalendarWidget() {
  const embedUrl = process.env.REACT_APP_CALENDAR_EMBED_URL || '';
  const openUrl = process.env.REACT_APP_CALENDAR_OPEN_URL || 'https://calendar.google.com/calendar/u/0/r';

  return (
@@ -17,21 +16,6 @@ export default function CalendarWidget() {
          Abrir
        </Button>
      </Box>

      {!embedUrl ? (
        <Typography variant="body2" color="text.secondary">
        </Typography>
      ) : (
        
      )}
    </Paper>
  );
