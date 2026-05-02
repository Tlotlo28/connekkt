// Splash screen controller
// After the entrance animation finishes, redirect to the main app.
// For now we just log it — once we build the home screen, this becomes a redirect.

const SPLASH_DURATION = 2800;

window.addEventListener('load', () => {
  setTimeout(() => {
    window.location.href = 'home.html';
  }, SPLASH_DURATION);
});