/* ==========================================================================
   humans.js — Fishermen NPCs: fish at docks, flee cartoonishly when attacked
   ========================================================================== */
(function (HC) {
  'use strict';
  HC.EntityFactories = HC.EntityFactories || {};
  HC.EntityDraw = HC.EntityDraw || {};

  HC.EntityFactories.fisherman = (x, y) => {
    const def = HC.CONFIG.PREY.fisherman;
    const e = new HC.Entity(Object.assign({ defId: 'fisherman', category: 'prey' }, def), x, y);
    e.wanderRadius = 40;
    return e;
  };

  function drawFisherman(ctx, e, sx, sy) {
    const s = e.size;
    const wobble = e.state === 'flee' ? Math.sin(e.animPhase * 12) * 0.3 : 0;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(wobble);
    if (e.flashTimer > 0) ctx.filter = 'brightness(2)';
    // body
    ctx.fillStyle = '#3d6b93';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.1, s * 0.5, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(0, -s * 0.55, s * 0.4, 0, Math.PI * 2);
    ctx.fill();
    // hat
    ctx.fillStyle = '#c9622e';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.8, s * 0.5, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    // fishing rod
    ctx.strokeStyle = '#8a6244';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s * 0.4, -s * 0.2);
    ctx.lineTo(s * 1.4, -s * 0.9);
    ctx.stroke();
    ctx.restore();
  }
  HC.EntityDraw.fisherman = drawFisherman;
})(window.HC = window.HC || {});
