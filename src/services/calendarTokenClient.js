// src/services/calendarTokenClient.js
/* global google */
export const initCalendarTokenClient = (callback) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: '342291539398-63cpu44t7rspnvff25u25tb13f6n7oos.apps.googleusercontent.com', // Reemplaza con tu Client ID
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: callback, // Esta función se llamará con la respuesta
    });
    return tokenClient;
  };
  