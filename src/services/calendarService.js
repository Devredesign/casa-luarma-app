// src/services/calendarService.js

const BASE = 'https://www.googleapis.com/calendar/v3';

async function parseError(res) {
  let bodyText = '';
  try { bodyText = await res.text(); } catch {}
  const err = new Error(`Error fetching events: ${res.status}`);
  err.status = res.status;
  err.body = bodyText;
  return err;
}

export async function listUpcomingEvents(accessToken, {
  timeMin = new Date().toISOString(),
  maxResults = 10,
} = {}) {
  if (!accessToken) throw new Error('Missing access token');

  const url =
    `${BASE}/calendars/primary/events` +
    `?timeMin=${encodeURIComponent(timeMin)}` +
    `&maxResults=${maxResults}` +
    `&singleEvents=true` +
    `&orderBy=startTime`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      // ✅ ESTA LÍNEA es clave:
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    const err = await parseError(res);
    err.code = 'AUTH_401';
    throw err;
  }

  if (!res.ok) throw await parseError(res);

  return res.json();
}
