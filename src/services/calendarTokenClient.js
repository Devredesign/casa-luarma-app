// src/services/calendarTokenClient.js
/* global google */

export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

export const initCalendarTokenClient = (callback) => {
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google OAuth2 (GIS) no está cargado. Asegúrate de incluir https://accounts.google.com/gsi/client');
  }

  return google.accounts.oauth2.initTokenClient({
    client_id: '342291539398-63cpu44t7rspnvff25u25tb13f6n7oos.apps.googleusercontent.com',
    scope: CALENDAR_SCOPE,
    include_granted_scopes: true,
    callback: (resp) => {
      // resp: { access_token, expires_in, token_type, scope, error, ... }
      callback(resp);
    },
  });
};

  
