/* ==========================================================================
   collision.js — Circle-based collision detection helpers
   ========================================================================== */
(function (HC) {
  'use strict';

  HC.Collision = {
    circleHit(ax, ay, ar, bx, by, br) {
      return HC.utils.dist(ax, ay, bx, by) < (ar + br);
    },

    // Returns true if the player can eat the given entity based on relative size
    canEat(playerSize, entitySize) {
      return playerSize > entitySize * 0.95;
    },

    // Finds nearest entity within range matching predicate, or null
    findNearest(x, y, range, entities, predicate) {
      let best = null, bestDist = range;
      for (const e of entities) {
        if (!e.alive) continue;
        if (predicate && !predicate(e)) continue;
        const d = HC.utils.dist(x, y, e.x, e.y);
        if (d < bestDist) { bestDist = d; best = e; }
      }
      return best;
    }
  };
})(window.HC = window.HC || {});
