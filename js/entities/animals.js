/* ==========================================================================
   animals.js — Frogs, turtles, boars, snakes, monkeys, deer, jungle cats
   ========================================================================== */
(function (HC) {
  'use strict';
  HC.EntityFactories = HC.EntityFactories || {};
  HC.EntityDraw = HC.EntityDraw || {};

  const ANIMAL_IDS = ['frog', 'turtle', 'boar', 'snake', 'monkey', 'deer', 'jungleCat', 'giantSnake'];

  ANIMAL_IDS.forEach((id) => {
    HC.EntityFactories[id] = (x, y) => {
      const def = HC.CONFIG.PREY[id];
      return new HC.Entity(Object.assign({ defId: id, category: 'prey' }, def), x, y);
    };
  });

  function drawBlobAnimal(ctx, e, sx, sy) {
    const s = e.size;
    const bounce = Math.abs(Math.sin(e.animPhase * 4)) * s * 0.12;
    ctx.save();
    ctx.translate(sx, sy - bounce);
    ctx.rotate(e.heading);
    if (e.flashTimer > 0) ctx.filter = 'brightness(2)';
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.95, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.arc(s * 0.85, 0, s * 0.45, 0, Math.PI * 2);
    ctx.fill();
    // legs
    ctx.fillStyle = e.color;
    for (const lx of [-s * 0.4, s * 0.3]) {
      ctx.beginPath();
      ctx.ellipse(lx, s * 0.55, s * 0.18, s * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSnake(ctx, e, sx, sy) {
    const s = e.size;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(e.heading);
    if (e.flashTimer > 0) ctx.filter = 'brightness(2)';
    ctx.strokeStyle = e.color;
    ctx.lineWidth = s * 0.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 1.2, 0);
    for (let i = -1; i <= 1; i += 0.25) {
      ctx.lineTo(i * s, Math.sin(i * 4 + e.animPhase * 4) * s * 0.4);
    }
    ctx.stroke();
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(s * 1.25, Math.sin(1 * 4 + e.animPhase * 4) * s * 0.4, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ['frog', 'turtle', 'boar', 'monkey', 'deer', 'jungleCat'].forEach(id => { HC.EntityDraw[id] = drawBlobAnimal; });
  HC.EntityDraw.snake = drawSnake;
  HC.EntityDraw.giantSnake = drawSnake;
})(window.HC = window.HC || {});
