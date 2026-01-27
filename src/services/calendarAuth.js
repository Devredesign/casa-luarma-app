// src/services/calendarAuth.js
/* global google */

const STORAGE_KEY = 'calendarAccess_v1';

const CLIENT_ID = '342291539398-63cpu44t7rspnvff25u25tb13f6n7oos.apps.googleusercontent.com';
const SCOPE = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient = null;

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStored({ access_token, expires_in }) {
  const expiresAt = Date.now() + Number(expires_in || 3600) * 1000;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ access_token, expires_at: expiresAt })
  );
}

export function clearCalendarToken() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredCalendarToken() {
  const s = loadStored();
  if (!s?.access_token || !s?.expires_at) return null;
  // margen 60s
  if (Date.now() > s.expires_at - 60000) return null;
  return s.access_token;
}

function ensureTokenClient(callback) {
  if (tokenClient) {
    tokenClient.callback = callback;
    return tokenClient;
  }
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    callback,
  });
  return tokenClient;
}

/**
 * interactive=false => intenta silent (sin popup). Si no puede, lanza error.
 * interactive=true  => abre popup/consent.
 */
export function requestCalendarToken({ interactive }) {
  return new Promise((resolve, reject) => {
    const client = ensureTokenClient((resp) => {
      if (!resp) return reject(new Error('Respuesta vacía de Google'));
      if (resp.error) return reject(resp);
      if (!resp.access_token) return reject(new Error('No access_token'));
      saveStored(resp);
      resolve(resp.access_token);
    });

    client.requestAccessToken({ prompt: interactive ? 'consent' : '' });
  });
}
