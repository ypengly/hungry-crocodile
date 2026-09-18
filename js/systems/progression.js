/* ==========================================================================
   progression.js — XP thresholds, level-up rewards, achievement checking
   ========================================================================== */
(function (HC) {
  'use strict';

  const Progression = {
    xpToNext(level) {
      if (level >= HC.CONFIG.MAX_LEVEL) return null;
      return HC.utils.xpForLevel(level + 1);
    },

    xpProgressFraction(level, xp) {
      const prevReq = level <= 1 ? 0 : HC.utils.xpForLevel(level);
      const nextReq = Progression.xpToNext(level);
      if (nextReq === null) return 1;
      return HC.utils.clamp((xp - prevReq) / (nextReq - prevReq), 0, 1);
    },

    levelUpCoinReward(level) {
      return 20 + level * 8;
    },

    checkAchievements(saveState) {
      const unlockedNow = [];
      for (const ach of HC.CONFIG.ACHIEVEMENTS) {
        if (!saveState.achievements.includes(ach.id) && ach.check(saveState)) {
          saveState.achievements.push(ach.id);
          unlockedNow.push(ach);
        }
      }
      return unlockedNow;
    }
  };

  HC.Progression = Progression;
})(window.HC = window.HC || {});
