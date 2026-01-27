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

// ✅ espera a que google.accounts exista (evita AbortError por carrera)
function waitForGoogleAccounts({ timeoutMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const tick = () => {
      const ok =
        typeof window !== 'undefined' &&
        window.google &&
        window.google.accounts &&
        window.google.accounts.oauth2 &&
        typeof window.google.accounts.oauth2.initTokenClient === 'function';

      if (ok) return resolve(true);
      if (Date.now() - start > timeoutMs) {
        return reject(new Error('Google GSI no está listo (timeout)'));
      }
      setTimeout(tick, 50);
    };

    tick();
  });
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
 * interactive=false => intenta silent (sin popup).
 * interactive=true  => abre popup/consent.
 */
export async function requestCalendarToken({ interactive }) {
  await waitForGoogleAccounts(); // ✅ importantísimo

  return new Promise((resolve, reject) => {
    const client = ensureTokenClient((resp) => {
      if (!resp) return reject(new Error('Respuesta vacía de Google'));
      if (resp.error) return reject(resp);
      if (!resp.access_token) return reject(new Error('No access_token'));
      saveStored(resp);
      resolve(resp.access_token);
    });

    // prompt: '' intenta silent; 'consent' fuerza popup
    client.requestAccessToken({ prompt: interactive ? 'consent' : '' });
  });
}

/**
 * ✅ Lo que necesita tu AdminDashboard:
 * - si hay token guardado válido => lo devuelve
 * - si no => intenta silent
 * - si interactiveFallback=true y silent falla => hace popup/consent
 */
export async function getCalendarAccessToken({ interactiveFallback = true } = {}) {
  const stored = getStoredCalendarToken();
  if (stored) return stored;

  try {
    // intento silent
    return await requestCalendarToken({ interactive: false });
  } catch (err) {
    // si no queremos fallback interactivo, devolvemos null
    if (!interactiveFallback) return null;

    // fallback a popup/consent
    return await requestCalendarToken({ interactive: true });
  }
}
