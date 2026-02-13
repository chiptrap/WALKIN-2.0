/**
 * app.js
 * Application entry point — wires up DOMContentLoaded initialization.
 */

document.addEventListener('DOMContentLoaded', () => {
    initDates();
    renderSettings();
    renderUsageSettings();
    renderProjections();
});
