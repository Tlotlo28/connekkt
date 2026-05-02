// Splash screen controller
// After the entrance animation finishes, redirect to the main app.
// For now we just log it — once we build the home screen, this becomes a redirect.

const SPLASH_DURATION = 2800; // ms — total animation time before we move on

window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('[Connekkt] Splash complete — ready to load main app.');
    window.location.href = 'home.html';
  }, SPLASH_DURATION);
});