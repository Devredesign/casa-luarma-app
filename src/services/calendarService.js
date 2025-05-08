// src/services/calendarService.js

/**
 * Lista los eventos próximos del calendario primario.
 * @param {string} accessToken - Token de acceso obtenido de Google.
 * @returns {Promise<Array>} - Promesa que resuelve con un arreglo de eventos.
 */
export const listUpcomingEvents = async (accessToken) => {
  try {
    const now = new Date().toISOString();
    const maxResults = 10;
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching events: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error en listUpcomingEvents:", error);
    throw error;
  }
};

/**
 * Crea un evento en el calendario primario.
 * @param {string} accessToken - Token de acceso.
 * @param {object} eventData - Objeto con los datos del evento.
 * @returns {Promise<object>} - Promesa que resuelve con el evento creado.
 */
export const createCalendarEvent = async (accessToken, eventData) => {
  try {
    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creando evento: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en createCalendarEvent:", error);
    throw error;
  }
};

/**
 * Actualiza un evento existente en el calendario primario.
 * @param {string} accessToken - Token de acceso.
 * @param {string} eventId - ID del evento a actualizar.
 * @param {object} updatedData - Datos actualizados del evento.
 * @returns {Promise<object>} - Promesa que resuelve con el evento actualizado.
 */
export const updateCalendarEvent = async (accessToken, eventId, updatedData) => {
  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error actualizando evento: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en updateCalendarEvent:", error);
    throw error;
  }
};

/**
 * Elimina un evento del calendario primario.
 * @param {string} accessToken - Token de acceso.
 * @param {string} eventId - ID del evento a eliminar.
 * @returns {Promise<boolean>} - Promesa que resuelve en true si se elimina correctamente.
 */
export const deleteCalendarEvent = async (accessToken, eventId) => {
  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error eliminando evento: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteCalendarEvent:", error);
    throw error;
  }
};
  

