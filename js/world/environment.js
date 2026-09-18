/* ==========================================================================
   environment.js — Procedural decorative props: banks, trees, docks, reeds
   ========================================================================== */
(function (HC) {
  'use strict';

  function Environment() {
    this.props = [];
    this._generate();
  }

  Environment.prototype._generate = function () {
    const zones = HC.CONFIG.ZONES;
    const H = HC.CONFIG.WORLD_HEIGHT;
    zones.forEach((zone) => {
      const width = zone.bounds.x1 - zone.bounds.x0;
      const count = Math.floor(width / 70);
      for (let i = 0; i < count; i++) {
        const x = zone.bounds.x0 + Math.random() * width;
        const nearTop = Math.random() < 0.5;
        const y = nearTop ? HC.utils.rand(20, 140) : HC.utils.rand(H - 140, H - 20);
        let type = 'reed';
        const r = Math.random();
        if (zone.id === 'village' && r < 0.18) type = 'dock';
        else if (zone.id === 'village' && r < 0.3) type = 'house';
        else if (zone.id === 'ancient' && r < 0.2) type = 'ruin';
        else if (r < 0.35) type = 'tree';
        else if (r < 0.5) type = 'rock';
        else if (r < 0.62) type = 'log';
        else if (r < 0.75) type = 'flower';
        this.props.push({
          x, y, type,
          scale: HC.utils.rand(0.7, 1.4),
          rot: HC.utils.rand(-0.15, 0.15),
          colorSeed: Math.random(),
          side: nearTop ? -1 : 1
        });
      }
    });
  };

  Environment.prototype.draw = function (ctx, camera) {
    const margin = 200;
    for (const p of this.props) {
      const sx = p.x - camera.x;
      const sy = p.y - camera.y;
      if (sx < -margin || sx > camera.width + margin || sy < -margin || sy > camera.height + margin) continue;
      this._drawProp(ctx, p, sx, sy);
    }
  };

  Environment.prototype._drawProp = function (ctx, p, sx, sy) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(p.rot);
    ctx.scale(p.scale, p.scale);
    switch (p.type) {
      case 'tree':
        ctx.fillStyle = '#5a3a24';
        ctx.fillRect(-4, -10, 8, 30);
        ctx.fillStyle = `hsl(${100 + p.colorSeed * 30},40%,${28 + p.colorSeed * 10}%)`;
        ctx.beginPath();
        ctx.arc(0, -30, 26, 0, Math.PI * 2);
        ctx.arc(-18, -18, 18, 0, Math.PI * 2);
        ctx.arc(18, -18, 18, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'rock':
        ctx.fillStyle = '#7c7c74';
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(-4, 3, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'reed':
        ctx.strokeStyle = '#4a7a3a';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const bx = (i - 2) * 5;
          ctx.moveTo(bx, 14);
          ctx.quadraticCurveTo(bx + 4, -6, bx + 2, -26 - i * 2);
          ctx.stroke();
        }
        break;
      case 'log':
        ctx.fillStyle = '#5a4028';
        ctx.fillRect(-26, -6, 52, 12);
        ctx.fillStyle = '#3a2a18';
        ctx.beginPath(); ctx.ellipse(-26, 0, 6, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(26, 0, 6, 6, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case 'flower':
        ctx.fillStyle = `hsl(${p.colorSeed * 360},70%,65%)`;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * 5, Math.sin(a) * 5, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#e8c23a';
        ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
        break;
      case 'dock':
        ctx.fillStyle = '#8a6a45';
        ctx.fillRect(-40, -8, 80, 16);
        for (let i = -35; i <= 35; i += 14) { ctx.fillRect(i, -6, 4, 20); }
        break;
      case 'house':
        ctx.fillStyle = '#c9a468';
        ctx.fillRect(-22, -20, 44, 24);
        ctx.fillStyle = '#8a3a2a';
        ctx.beginPath();
        ctx.moveTo(-26, -20); ctx.lineTo(0, -40); ctx.lineTo(26, -20); ctx.closePath();
        ctx.fill();
        break;
      case 'ruin':
        ctx.fillStyle = '#5a5468';
        ctx.fillRect(-8, -34, 16, 34);
        ctx.fillRect(-24, -10, 12, 10);
        ctx.fillRect(14, -18, 12, 18);
        break;
    }
    ctx.restore();
  };

  HC.Environment = Environment;
})(window.HC = window.HC || {});
