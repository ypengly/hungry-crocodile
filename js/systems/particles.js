/* ==========================================================================
   particles.js — Lightweight pooled particle system
   ========================================================================== */
(function (HC) {
  'use strict';

  const POOL_SIZE = 400;

  function ParticleSystem() {
    this.pool = new Array(POOL_SIZE);
    for (let i = 0; i < POOL_SIZE; i++) this.pool[i] = this._blank();
    this.cursor = 0;
    this.enabled = true;
  }

  ParticleSystem.prototype._blank = function () {
    return { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 2, color: '#fff', type: 'dot', text: '', gravity: 0, alpha: 1 };
  };

  ParticleSystem.prototype.spawn = function (opts) {
    if (!this.enabled) return;
    const p = this.pool[this.cursor];
    this.cursor = (this.cursor + 1) % POOL_SIZE;
    p.active = true;
    p.x = opts.x || 0;
    p.y = opts.y || 0;
    p.vx = opts.vx || 0;
    p.vy = opts.vy || 0;
    p.life = 0;
    p.maxLife = opts.maxLife || 0.8;
    p.size = opts.size || 3;
    p.color = opts.color || '#ffffff';
    p.type = opts.type || 'dot';
    p.text = opts.text || '';
    p.gravity = opts.gravity !== undefined ? opts.gravity : 0;
    p.drag = opts.drag !== undefined ? opts.drag : 0.98;
    p.alpha = 1;
  };

  ParticleSystem.prototype.burst = function (x, y, count, opts) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = HC.utils.rand(opts.minSpeed || 20, opts.maxSpeed || 80);
      this.spawn(Object.assign({}, opts, {
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
      }));
    }
  };

  ParticleSystem.prototype.floatingText = function (x, y, text, color) {
    this.spawn({ x, y, vx: HC.utils.rand(-8, 8), vy: -40, maxLife: 1.1, size: 14, color: color || '#fff', type: 'text', text, gravity: 20, drag: 0.99 });
  };

  ParticleSystem.prototype.update = function (dt) {
    for (let i = 0; i < POOL_SIZE; i++) {
      const p = this.pool[i];
      if (!p.active) continue;
      p.life += dt;
      if (p.life >= p.maxLife) { p.active = false; continue; }
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = 1 - (p.life / p.maxLife);
    }
  };

  ParticleSystem.prototype.draw = function (ctx, camera) {
    for (let i = 0; i < POOL_SIZE; i++) {
      const p = this.pool[i];
      if (!p.active) continue;
      const sx = p.x - camera.x;
      const sy = p.y - camera.y;
      if (sx < -50 || sx > camera.width + 50 || sy < -50 || sy > camera.height + 50) continue;
      ctx.save();
      ctx.globalAlpha = HC.utils.clamp(p.alpha, 0, 1);
      if (p.type === 'text') {
        ctx.font = `bold ${p.size}px 'Baloo 2', sans-serif`;
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 3;
        ctx.strokeText(p.text, sx, sy);
        ctx.fillText(p.text, sx, sy);
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * (1 + p.life * 3), 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  HC.ParticleSystem = ParticleSystem;
})(window.HC = window.HC || {});
