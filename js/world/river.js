/* ==========================================================================
   river.js — Animated water surface, waves, ripples, foam banks
   ========================================================================== */
(function (HC) {
  'use strict';

  function River() {
    this.time = 0;
  }

  River.prototype.update = function (dt) { this.time += dt; };

  River.prototype.drawBackground = function (ctx, camera, zone, weather, dayNight) {
    const w = camera.width, h = camera.height;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    const lightMix = dayNight.lightLevel;
    const top = HC.RenderUtil.mixColor(zone.deep, '#03060d', 1 - lightMix);
    const bottom = HC.RenderUtil.mixColor(zone.water, '#03060d', 1 - lightMix);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // wave bands
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    const bandSpacing = 46;
    const offsetY = (camera.y * 0.4 + this.time * 26) % bandSpacing;
    for (let y = -offsetY; y < h; y += bandSpacing) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 24) {
        const wy = y + Math.sin((x + camera.x) * 0.01 + this.time * 1.4) * 6;
        if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }
    ctx.restore();

    if (weather === 'fog' || weather === 'storm') {
      ctx.save();
      ctx.fillStyle = weather === 'storm' ? 'rgba(20,25,35,0.35)' : 'rgba(200,210,220,0.28)';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  };

  HC.River = River;

  HC.RenderUtil = {
    mixColor(c1, c2, t) {
      const a = HC.RenderUtil._hex(c1), b = HC.RenderUtil._hex(c2);
      const r = Math.round(HC.utils.lerp(a[0], b[0], t));
      const g = Math.round(HC.utils.lerp(a[1], b[1], t));
      const bl = Math.round(HC.utils.lerp(a[2], b[2], t));
      return `rgb(${r},${g},${bl})`;
    },
    _hex(c) {
      const v = c.replace('#', '');
      return [parseInt(v.substr(0, 2), 16), parseInt(v.substr(2, 2), 16), parseInt(v.substr(4, 2), 16)];
    }
  };
})(window.HC = window.HC || {});
