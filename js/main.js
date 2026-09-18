/* ==========================================================================
   main.js — Bootstraps the game once the DOM is ready
   ========================================================================== */
(function (HC) {
  'use strict';

  function boot() {
    try {
      window.HungryCrocodileGame = new HC.Game();
    } catch (err) {
      console.error('Failed to start Hungry Crocodile:', err);
      const root = document.getElementById('ui-root');
      if (root) {
        const msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;background:#08202c;font-family:sans-serif;padding:20px;text-align:center;pointer-events:auto;';
        msg.textContent = 'Something went wrong starting the game. Please refresh the page.';
        root.appendChild(msg);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window.HC = window.HC || {});
