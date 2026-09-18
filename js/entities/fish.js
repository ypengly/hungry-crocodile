/* ==========================================================================
   fish.js — Fish entities: swim in loose schools, scatter when attacked
   ========================================================================== */
(function (HC) {
  'use strict';

  HC.EntityFactories = HC.EntityFactories || {};
  HC.EntityDraw = HC.EntityDraw || {};

  function makeFish(defId, x, y) {
    const def = HC.CONFIG.PREY[defId];
    const e = new HC.Entity(Object.assign({ defId, category: 'prey' }, def), x, y);
    e.schoolOffset = { x: HC.utils.rand(-30, 30), y: HC.utils.rand(-30, 30) };
    return e;
  }
  HC.EntityFactories.smallFish = (x, y) => makeFish('smallFish', x, y);
  HC.EntityFactories.largeFish = (x, y) => makeFish('largeFish', x, y);
  HC.EntityFactories.giantFish = (x, y) => makeFish('giantFish', x, y);

  function drawFish(ctx, e, sx, sy) {
    const s = e.size;
    const wag = Math.sin(e.animPhase * 5) * 0.5;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(e.heading);
    if (e.flashTimer > 0) ctx.filter = 'brightness(2)';

    // tail
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.moveTo(-s * 1.1, 0);
    ctx.lineTo(-s * 1.7, -s * 0.55 + wag * s * 0.3);
    ctx.lineTo(-s * 1.7, s * 0.55 + wag * s * 0.3);
    ctx.closePath();
    ctx.fill();

    // body
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // top fin
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.5);
    ctx.lineTo(s * 0.15, -s * 0.95);
    ctx.lineTo(s * 0.4, -s * 0.45);
    ctx.closePath();
    ctx.fill();

    // eye
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(s * 0.55, -s * 0.1, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  HC.EntityDraw.smallFish = drawFish;
  HC.EntityDraw.largeFish = drawFish;
  HC.EntityDraw.giantFish = drawFish;
})(window.HC = window.HC || {});
