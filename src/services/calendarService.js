// src/services/calendarService.js

const BASE = 'https://www.googleapis.com/calendar/v3';
const CAL_ID = 'primary';

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

export async function listUpcomingEvents(accessToken) {
  const timeMin = new Date().toISOString();
  const url = `${BASE}/calendars/${CAL_ID}/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=10&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, { headers: authHeaders(accessToken) });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(`Error fetching events: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function createCalendarEvent(accessToken, eventData) {
  const url = `${BASE}/calendars/${CAL_ID}/events`;

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(eventData),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(`Error creating event: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function updateCalendarEvent(accessToken, eventId, eventData) {
  const url = `${BASE}/calendars/${CAL_ID}/events/${encodeURIComponent(eventId)}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify(eventData),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(`Error updating event: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function deleteCalendarEvent(accessToken, eventId) {
  const url = `${BASE}/calendars/${CAL_ID}/events/${encodeURIComponent(eventId)}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(`Error deleting event: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return true;
}
