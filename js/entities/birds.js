/* ==========================================================================
   birds.js — Ducks and small birds: hover near water, fly away when close
   ========================================================================== */
(function (HC) {
  'use strict';
  HC.EntityFactories = HC.EntityFactories || {};
  HC.EntityDraw = HC.EntityDraw || {};

  function makeBird(defId, x, y) {
    const def = HC.CONFIG.PREY[defId];
    const e = new HC.Entity(Object.assign({ defId, category: 'prey' }, def), x, y);
    e.bobPhase = Math.random() * Math.PI * 2;
    return e;
  }
  HC.EntityFactories.duck = (x, y) => makeBird('duck', x, y);
  HC.EntityFactories.smallBird = (x, y) => makeBird('smallBird', x, y);

  function drawBird(ctx, e, sx, sy) {
    const s = e.size;
    const flap = Math.sin(e.animPhase * 8) * 0.6;
    const bob = Math.sin(e.bobPhase + e.animPhase) * 2;
    ctx.save();
    ctx.translate(sx, sy + bob);
    ctx.rotate(e.heading * 0.3);
    if (e.flashTimer > 0) ctx.filter = 'brightness(2)';

    ctx.fillStyle = e.color;
    // wings
    ctx.beginPath();
    ctx.ellipse(-s * 0.2, 0, s * 0.9, s * 0.25 + Math.abs(flap) * s * 0.2, flap * 0.4, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.6, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.arc(s * 0.55, -s * 0.1, s * 0.32, 0, Math.PI * 2);
    ctx.fill();
    // beak
    ctx.fillStyle = '#e08a2a';
    ctx.beginPath();
    ctx.moveTo(s * 0.85, -s * 0.1);
    ctx.lineTo(s * 1.15, -s * 0.02);
    ctx.lineTo(s * 0.85, s * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  HC.EntityDraw.duck = drawBird;
  HC.EntityDraw.smallBird = drawBird;
})(window.HC = window.HC || {});
