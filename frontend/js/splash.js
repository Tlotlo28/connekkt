// Splash screen controller
// After the entrance animation finishes, redirect to the main app.
// For now we just log it — once we build the home screen, this becomes a redirect.

const SPLASH_DURATION = 2800;

window.addEventListener('load', () => {
  setTimeout(() => {
    // For now: send everyone to onboarding. Once auth is wired (round 3),
    // we'll check for a saved JWT and skip onboarding for returning users.
    window.location.href = 'onboarding.html';
  }, SPLASH_DURATION);
});