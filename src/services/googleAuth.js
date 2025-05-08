/* global google */
export const initializeGoogleSignIn = (onSuccess, onError) => {
    // Configura la inicialización
    google.accounts.id.initialize({
      client_id: '342291539398-63cpu44t7rspnvff25u25tb13f6n7oos.apps.googleusercontent.com',  // Reemplaza con tu Client ID
      callback: (response) => {
        // Aquí recibes el token ID en response.credential
        console.log("ID Token:", response.credential);
        onSuccess(response.credential);
      },
      auto_select: false, // Puedes ajustar según tu flujo
    });
    // Renderiza el botón de Google Sign-In
    google.accounts.id.renderButton(
      document.getElementById("google-signin-button"),  // Un div en tu componente
      { theme: "outline", size: "large" } // Opciones de estilo
    );
    // Puedes opcionalmente mostrar el prompt
    google.accounts.id.prompt();
  };
