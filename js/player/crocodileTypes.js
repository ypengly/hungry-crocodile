/* ==========================================================================
   crocodileTypes.js — Helpers for looking up crocodile type definitions
   ========================================================================== */
(function (HC) {
  'use strict';

  HC.CrocTypes = {
    all() { return HC.CONFIG.CROCODILE_TYPES; },
    get(id) { return HC.CONFIG.CROCODILE_TYPES.find(t => t.id === id) || HC.CONFIG.CROCODILE_TYPES[0]; },
    isUnlocked(id, save) { return save.unlockedCrocs.includes(id); }
  };
})(window.HC = window.HC || {});
