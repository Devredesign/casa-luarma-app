/* global google */

// Scope: solo lectura (para listar). Si querés crear/editar/borrar eventos,
// cambiá a 'https://www.googleapis.com/auth/calendar.events'
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

export const initializeGoogleSignIn = (onSuccess, onError) => {
  try {
    google.accounts.id.initialize({
      client_id: '342291539398-63cpu44t7rspnvff25u25tb13f6n7oos.apps.googleusercontent.com',
      callback: async (response) => {
        try {
          // 1) ID token (sirve para login / verificar identidad)
          const idToken = response.credential;
          console.log('ID Token recibido (login):', !!idToken);

          // 2) Pedir Access Token para Calendar (OAuth)
          const accessToken = await requestGoogleAccessToken();

          // Guardar access token para Calendar
          localStorage.setItem('google_access_token', accessToken);

          // Podés pasar ambos al onSuccess si te sirve
          onSuccess({ idToken, accessToken });
        } catch (e) {
          console.error('Error en Google callback:', e);
          onError?.(e);
        }
      },
      auto_select: false,
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      { theme: 'outline', size: 'large' }
    );

    google.accounts.id.prompt();
  } catch (e) {
    console.error('Error inicializando Google Sign-In:', e);
    onError?.(e);
  }
};

export const requestGoogleAccessToken = () => {
  return new Promise((resolve, reject) => {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: '342291539398-63cpu44t7rspnvff25u25tb13f6n7oos.apps.googleusercontent.com',
        scope: CALENDAR_SCOPE,
        callback: (resp) => {
          if (resp?.access_token) {
            resolve(resp.access_token);
          } else {
            reject(new Error('No se obtuvo access_token'));
          }
        },
      });

      // prompt: '' intenta no mostrar popup si ya hay sesión/consentimiento
      tokenClient.requestAccessToken({ prompt: '' });
    } catch (e) {
      reject(e);
    }
  });
};

