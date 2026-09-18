/* ==========================================================================
   predators.js — Rival crocodiles and dangerous end-game predators
   ========================================================================== */
(function (HC) {
  'use strict';
  HC.EntityFactories = HC.EntityFactories || {};
  HC.EntityDraw = HC.EntityDraw || {};

  const PRED_IDS = ['rivalCroc', 'ancientPredator', 'giantCatfishBoss'];

  PRED_IDS.forEach((id) => {
    HC.EntityFactories[id] = (x, y) => {
      const def = HC.CONFIG.PREDATORS[id];
      return new HC.Entity(Object.assign({ defId: id, category: 'predator', kind: 'predator' }, def), x, y);
    };
  });

  function drawRivalCroc(ctx, e, sx, sy) {
    const s = e.size;
    const swim = Math.sin(e.animPhase * 3) * 0.15;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(e.heading);
    if (e.flashTimer > 0) ctx.filter = 'brightness(2)';
    // tail
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.8, 0);
    ctx.quadraticCurveTo(-s * 1.6, swim * s, -s * 2.1, 0);
    ctx.quadraticCurveTo(-s * 1.6, -swim * s, -s * 0.8, 0);
    ctx.fill();
    // body
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // snout
    ctx.beginPath();
    ctx.moveTo(s * 0.7, -s * 0.22);
    ctx.lineTo(s * 1.5, -s * 0.1);
    ctx.lineTo(s * 1.5, s * 0.1);
    ctx.lineTo(s * 0.7, s * 0.22);
    ctx.closePath();
    ctx.fill();
    // eyes
    ctx.fillStyle = '#f2c744';
    ctx.beginPath();
    ctx.arc(s * 0.35, -s * 0.28, s * 0.1, 0, Math.PI * 2);
    ctx.arc(s * 0.35, s * 0.28, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawAncientPredator(ctx, e, sx, sy) {
    const s = e.size;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(e.heading);
    if (e.flashTimer > 0) ctx.filter = 'brightness(2)';
    const grad = ctx.createRadialGradient(0, 0, s * 0.1, 0, 0, s * 1.3);
    grad.addColorStop(0, e.color);
    grad.addColorStop(1, '#0c0916');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.1, s * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    // spines
    ctx.fillStyle = '#4a2f6b';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s * 0.25, -s * 0.5);
      ctx.lineTo(i * s * 0.25 + s * 0.08, -s * 0.85);
      ctx.lineTo(i * s * 0.25 + s * 0.16, -s * 0.5);
      ctx.closePath();
      ctx.fill();
    }
    // glowing eyes
    ctx.fillStyle = '#ff3b3b';
    ctx.beginPath();
    ctx.arc(s * 0.7, -s * 0.2, s * 0.12, 0, Math.PI * 2);
    ctx.arc(s * 0.7, s * 0.2, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBossCatfish(ctx, e, sx, sy) {
    const s = e.size;
    const wag = Math.sin(e.animPhase * 2) * 0.3;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(e.heading);
    if (e.flashTimer > 0) ctx.filter = 'brightness(2)';
    ctx.fillStyle = e.color;
    // tail
    ctx.beginPath();
    ctx.moveTo(-s * 0.9, 0);
    ctx.lineTo(-s * 1.6, -s * 0.6 + wag * s * 0.3);
    ctx.lineTo(-s * 1.6, s * 0.6 + wag * s * 0.3);
    ctx.closePath();
    ctx.fill();
    // body
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    // whiskers
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 3;
    for (const dy of [-0.35, 0.35]) {
      ctx.beginPath();
      ctx.moveTo(s * 0.9, s * dy * s * 0);
      ctx.moveTo(s * 0.9, dy * s * 0.4);
      ctx.quadraticCurveTo(s * 1.3, dy * s * 0.7 + Math.sin(e.animPhase * 3) * 6, s * 1.6, dy * s * 0.9);
      ctx.stroke();
    }
    // eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s * 0.55, -s * 0.15, s * 0.1, 0, Math.PI * 2);
    ctx.arc(s * 0.55, s * 0.15, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  HC.EntityDraw.rivalCroc = drawRivalCroc;
  HC.EntityDraw.ancientPredator = drawAncientPredator;
  HC.EntityDraw.giantCatfishBoss = drawBossCatfish;
})(window.HC = window.HC || {});
