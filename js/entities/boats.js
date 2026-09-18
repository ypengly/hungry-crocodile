/* ==========================================================================
   boats.js — Fishing boats, speedboats, cargo ships and patrol boats
   ========================================================================== */
(function (HC) {
  'use strict';
  HC.EntityFactories = HC.EntityFactories || {};
  HC.EntityDraw = HC.EntityDraw || {};

  const BOAT_PREY_IDS = ['smallBoat', 'speedBoat', 'cargoBoat'];
  BOAT_PREY_IDS.forEach((id) => {
    HC.EntityFactories[id] = (x, y) => {
      const def = HC.CONFIG.PREY[id];
      return new HC.Entity(Object.assign({ defId: id, category: 'prey', kind: 'boat' }, def), x, y);
    };
  });
  HC.EntityFactories.patrolBoat = (x, y) => {
    const def = HC.CONFIG.PREDATORS.patrolBoat;
    return new HC.Entity(Object.assign({ defId: 'patrolBoat', category: 'predator', kind: 'boat' }, def), x, y);
  };

  function drawBoat(ctx, e, sx, sy) {
    const s = e.size;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(e.heading);
    if (e.flashTimer > 0) ctx.filter = 'brightness(2)';
    // hull
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.moveTo(-s, -s * 0.35);
    ctx.lineTo(s * 0.8, -s * 0.35);
    ctx.lineTo(s, 0);
    ctx.lineTo(s * 0.8, s * 0.35);
    ctx.lineTo(-s, s * 0.35);
    ctx.closePath();
    ctx.fill();
    // deck detail
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(-s * 0.7, -s * 0.15, s * 1.1, s * 0.3);
    // cabin
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(-s * 0.2, -s * 0.55, s * 0.5, s * 0.4);
    ctx.restore();
  }
  BOAT_PREY_IDS.concat(['patrolBoat']).forEach(id => { HC.EntityDraw[id] = drawBoat; });
})(window.HC = window.HC || {});
