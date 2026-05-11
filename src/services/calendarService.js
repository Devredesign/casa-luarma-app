// src/services/calendarService.js
// Nota: Este servicio se conserva por compatibilidad, pero el app ya NO sincroniza
// eventos automáticamente. Podés eliminarlo más adelante si no lo necesitás.

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export async function listEvents({ timeMin, maxResults } = {}) {
  const params = new URLSearchParams();
  if (timeMin) params.set('timeMin', timeMin);
  if (maxResults) params.set('maxResults', String(maxResults));

  const url = `${API_BASE_URL}/api/calendar/events?${params.toString()}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al listar eventos');
  }

  return res.json();
}
