/* ==========================================================================
   saveSystem.js — Persists progression to LocalStorage with safe fallback
   ========================================================================== */
(function (HC) {
  'use strict';

  let memoryFallback = null;
  let storageAvailable = true;
  try {
    const testKey = '__hc_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
  } catch (e) {
    storageAvailable = false;
    console.warn('LocalStorage unavailable — progress will not persist between sessions.');
  }

  function defaultSave() {
    return {
      level: 1,
      xp: 0,
      coins: 150,
      gems: 0,
      bestLevel: 1,
      equippedCroc: 'swamp',
      unlockedCrocs: ['swamp'],
      upgrades: { health: 0, speed: 0, damage: 0 },
      abilitiesUnlocked: ['swamp'],
      skins: {},
      missions: { active: [], completed: [] },
      achievements: [],
      stats: {
        animalsEaten: 0, boatsDestroyed: 0, predatorsDefeated: 0,
        treasuresFound: 0, distanceTraveled: 0, survivalTime: 0
      },
      settings: {
        sound: true, music: true, particles: true, screenShake: true, quality: 'high'
      }
    };
  }

  const SaveSystem = {
    load() {
      if (!storageAvailable) {
        return memoryFallback ? JSON.parse(JSON.stringify(memoryFallback)) : defaultSave();
      }
      try {
        const raw = window.localStorage.getItem(HC.CONFIG.STORAGE_KEY);
        if (!raw) return defaultSave();
        const parsed = JSON.parse(raw);
        // merge with defaults to handle version upgrades gracefully
        return Object.assign(defaultSave(), parsed, {
          stats: Object.assign(defaultSave().stats, parsed.stats || {}),
          settings: Object.assign(defaultSave().settings, parsed.settings || {}),
          missions: parsed.missions && parsed.missions.active ? parsed.missions : { active: [], completed: [] }
        });
      } catch (e) {
        console.warn('Failed to load save, using defaults.', e);
        return defaultSave();
      }
    },

    save(state) {
      if (!storageAvailable) {
        memoryFallback = JSON.parse(JSON.stringify(state));
        return true;
      }
      try {
        window.localStorage.setItem(HC.CONFIG.STORAGE_KEY, JSON.stringify(state));
        return true;
      } catch (e) {
        console.warn('Failed to save progress.', e);
        return false;
      }
    },

    reset() {
      if (storageAvailable) {
        try { window.localStorage.removeItem(HC.CONFIG.STORAGE_KEY); } catch (e) { /* ignore */ }
      }
      memoryFallback = null;
      return defaultSave();
    },

    isAvailable() { return storageAvailable; }
  };

  HC.SaveSystem = SaveSystem;
})(window.HC = window.HC || {});
