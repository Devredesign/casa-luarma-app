// src/services/calendarAuth.js
import { initCalendarTokenClient } from './calendarTokenClient';

const STORAGE_KEY = 'calendarAccessToken';
const EXP_KEY = 'calendarAccessTokenExpiresAt';

// margen para refrescar antes de expirar (60s)
const SKEW_MS = 60 * 1000;

export function getCachedCalendarToken() {
  const token = localStorage.getItem(STORAGE_KEY);
  const expiresAt = Number(localStorage.getItem(EXP_KEY) || 0);

  if (!token) return null;
  if (!expiresAt) return null;

  // si ya expiró (o está por expirar), no lo uses
  if (Date.now() >= (expiresAt - SKEW_MS)) return null;

  return token;
}

export function saveCalendarToken(accessToken, expiresInSeconds) {
  const expiresAt = Date.now() + (Number(expiresInSeconds || 0) * 1000);
  localStorage.setItem(STORAGE_KEY, accessToken);
  localStorage.setItem(EXP_KEY, String(expiresAt));
}

export function clearCalendarToken() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(EXP_KEY);
}

/**
 * Obtiene token:
 * - si hay uno válido en cache, lo devuelve
 * - si no, intenta pedirlo:
 *    - prompt '' (silencioso)
 *    - si falla, prompt 'consent' (interactivo)
 */
export async function getCalendarAccessToken({ interactiveFallback = true } = {}) {
  const cached = getCachedCalendarToken();
  if (cached) return cached;

  // 1) intento silencioso
  const tryRequest = (prompt) =>
    new Promise((resolve, reject) => {
      const client = initCalendarTokenClient((resp) => {
        if (resp?.error) return reject(resp);
        if (!resp?.access_token) return reject(new Error('No access_token en respuesta'));
        saveCalendarToken(resp.access_token, resp.expires_in);
        resolve(resp.access_token);
      });
      client.requestAccessToken({ prompt }); // '' o 'consent'
    });

  try {
    return await tryRequest(''); // silencioso
  } catch (e) {
    if (!interactiveFallback) throw e;
    // 2) fallback interactivo
    return await tryRequest('consent');
  }
}
