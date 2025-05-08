// src/hooks/useEventReminders.js
import { useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Hook que muestra un recordatorio mediante toast
 * cuando un evento está a 60 minutos de iniciarse.
 *
 * @param {Array<{ start: Date|string, title: string }>} events
 */
const useEventReminders = (events) => {
  useEffect(() => {
    // Función que revisa cada evento y dispara un toast si está a menos de 60'
    const checkReminders = () => {
      const now = new Date();
      events.forEach((event) => {
        const start = new Date(event.start);
        const diffMinutes = (start - now) / (1000 * 60);
        if (diffMinutes > 0 && diffMinutes <= 60) {
          toast.info(
            `El evento "${event.title}" inicia en ${Math.floor(diffMinutes)} minutos.`
          );
        }
      });
    };

    // Revisar inmediatamente al montar y luego cada 5 minutos
    checkReminders();
    const intervalId = setInterval(checkReminders, 5 * 60 * 1000);

    // Limpieza al desmontar: cancelar el interval
    return () => {
      clearInterval(intervalId);
    };
  }, [events]);
};

export default useEventReminders;

