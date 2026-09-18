/* ==========================================================================
   camera.js — Smooth-follow camera with screen shake
   ========================================================================== */
(function (HC) {
  'use strict';

  function Camera(width, height) {
    this.x = 0; this.y = 0;
    this.width = width; this.height = height;
    this.shakeMag = 0;
    this.zoom = 1;
    this.targetZoom = 1;
  }

  Camera.prototype.resize = function (w, h) { this.width = w; this.height = h; };

  Camera.prototype.follow = function (target, dt, boosting) {
    const desiredX = target.x - this.width / 2;
    const desiredY = target.y - this.height / 2;
    this.x = HC.utils.lerp(this.x, desiredX, HC.CONFIG.CAMERA_SMOOTH);
    this.y = HC.utils.lerp(this.y, desiredY, HC.CONFIG.CAMERA_SMOOTH);

    this.targetZoom = boosting ? 0.94 : 1;
    this.zoom = HC.utils.lerp(this.zoom, this.targetZoom, 0.05);

    this.x = HC.utils.clamp(this.x, 0, HC.CONFIG.WORLD_WIDTH - this.width);
    this.y = HC.utils.clamp(this.y, 0, HC.CONFIG.WORLD_HEIGHT - this.height);

    if (this.shakeMag > 0.05) {
      this.x += HC.utils.rand(-this.shakeMag, this.shakeMag);
      this.y += HC.utils.rand(-this.shakeMag, this.shakeMag);
      this.shakeMag *= HC.CONFIG.CAMERA_SHAKE_DECAY;
    } else {
      this.shakeMag = 0;
    }
  };

  Camera.prototype.shake = function (amount) {
    this.shakeMag = Math.max(this.shakeMag, amount);
  };

  HC.Camera = Camera;
})(window.HC = window.HC || {});
