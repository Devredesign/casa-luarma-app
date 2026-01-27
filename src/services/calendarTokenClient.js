/* global google */
export const initCalendarTokenClient = (callback) => {
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google OAuth2 (GIS) no está cargado. Falta gsi/client.');
  }

  return google.accounts.oauth2.initTokenClient({
    client_id: '342291539398-63cpu44t7rspnvff25u25tb13f6n7oos.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    include_granted_scopes: true,
    callback,
  });
};
