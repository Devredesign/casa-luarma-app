// src/services/googleAuth.js
// Nota: Ya no usamos OAuth en el app, pero dejamos helpers por si querés reactivar.
// Podés eliminar este archivo cuando confirmemos que no se usa en ningún lado.

export const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

export function isGoogleAuthConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}

