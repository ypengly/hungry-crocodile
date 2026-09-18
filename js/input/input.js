/* ==========================================================================
   input.js — Keyboard, mouse and touch input handling
   ========================================================================== */
(function (HC) {
  'use strict';

  function InputManager() {
    this.keys = {};
    this.state = {
      turn: 0,      // -1..1 (left/right)
      forward: 0,   // 0..1
      dive: 0,      // -1..1 (dive/surface)
      boost: false,
      attack: false,
      ability: false,
      pause: false,
      mute: false,
      restart: false
    };
    this._attackLatch = false;
    this._abilityLatch = false;
    this._pauseLatch = false;
    this._muteLatch = false;
    this._restartLatch = false;

    this.joystick = { active: false, cx: 0, cy: 0, x: 0, y: 0, dx: 0, dy: 0, id: null };
    this.touchBoost = false;
    this.touchBite = false;
    this.touchAbility = false;

    this._bindKeyboard();
    this._bindTouch();
  }

  InputManager.prototype._bindKeyboard = function () {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
  };

  InputManager.prototype._bindTouch = function () {
    const zone = document.getElementById('joystick-zone');
    const stick = document.getElementById('joystick-stick');
    const base = document.getElementById('joystick-base');
    const boostBtn = document.getElementById('btn-boost');
    const biteBtn = document.getElementById('btn-bite');
    if (!zone) return;

    const maxRadius = 46;

    const start = (e) => {
      e.preventDefault();
      const t = e.changedTouches ? e.changedTouches[0] : e;
      const rect = base.getBoundingClientRect();
      this.joystick.active = true;
      this.joystick.id = t.identifier !== undefined ? t.identifier : 'mouse';
      this.joystick.cx = rect.left + rect.width / 2;
      this.joystick.cy = rect.top + rect.height / 2;
      move(e);
    };
    const move = (e) => {
      if (!this.joystick.active) return;
      e.preventDefault();
      let t = e.changedTouches ? Array.from(e.changedTouches).find(tt => tt.identifier === this.joystick.id) : e;
      if (!t) t = e.changedTouches ? e.changedTouches[0] : e;
      let dx = t.clientX - this.joystick.cx;
      let dy = t.clientY - this.joystick.cy;
      const len = Math.hypot(dx, dy);
      if (len > maxRadius) { dx = dx / len * maxRadius; dy = dy / len * maxRadius; }
      this.joystick.dx = dx / maxRadius;
      this.joystick.dy = dy / maxRadius;
      if (stick) stick.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const end = (e) => {
      if (e) e.preventDefault();
      this.joystick.active = false;
      this.joystick.dx = 0;
      this.joystick.dy = 0;
      if (stick) stick.style.transform = 'translate(0px, 0px)';
    };

    zone.addEventListener('touchstart', start, { passive: false });
    zone.addEventListener('touchmove', move, { passive: false });
    zone.addEventListener('touchend', end, { passive: false });
    zone.addEventListener('touchcancel', end, { passive: false });
    zone.addEventListener('mousedown', start);
    window.addEventListener('mousemove', (e) => { if (this.joystick.active) move(e); });
    window.addEventListener('mouseup', end);

    if (boostBtn) {
      const bStart = (e) => { e.preventDefault(); this.touchBoost = true; };
      const bEnd = (e) => { e.preventDefault(); this.touchBoost = false; };
      boostBtn.addEventListener('touchstart', bStart, { passive: false });
      boostBtn.addEventListener('touchend', bEnd, { passive: false });
      boostBtn.addEventListener('mousedown', bStart);
      boostBtn.addEventListener('mouseup', bEnd);
      boostBtn.addEventListener('mouseleave', bEnd);
    }
    const abilityBtn = document.getElementById('btn-ability');
    if (abilityBtn) {
      const abFire = (e) => { e.preventDefault(); this.touchAbility = true; };
      abilityBtn.addEventListener('touchstart', abFire, { passive: false });
      abilityBtn.addEventListener('mousedown', abFire);
    }

    if (biteBtn) {
      const biteFire = (e) => { e.preventDefault(); this.touchBite = true; };
      biteBtn.addEventListener('touchstart', biteFire, { passive: false });
      biteBtn.addEventListener('mousedown', biteFire);
    }

    // Prevent page scroll/bounce while playing on mobile
    document.addEventListener('touchmove', (e) => {
      if (document.body.classList.contains('game-active')) e.preventDefault();
    }, { passive: false });
  };

  InputManager.prototype.update = function () {
    const k = this.keys;
    let turn = 0, forward = 0, dive = 0;

    if (k['KeyA'] || k['ArrowLeft']) turn -= 1;
    if (k['KeyD'] || k['ArrowRight']) turn += 1;
    if (k['KeyW'] || k['ArrowUp']) forward = 1;
    if (k['KeyS'] || k['ArrowDown']) dive = 1;

    if (this.joystick.active) {
      turn = HC.utils.clamp(this.joystick.dx * 1.4, -1, 1);
      forward = HC.utils.clamp(-this.joystick.dy, 0, 1);
      dive = HC.utils.clamp(this.joystick.dy, 0, 1);
    }

    this.state.turn = turn;
    this.state.forward = forward;
    this.state.dive = dive;
    this.state.boost = !!(k['Space'] || this.touchBoost);

    this.state.attack = false;
    if ((k['KeyE'] && !this._attackLatch) || this.touchBite) {
      this.state.attack = true;
    }
    this._attackLatch = !!k['KeyE'];
    this.touchBite = false;

    this.state.ability = false;
    const abKey = !!(k['KeyQ'] || k['ShiftLeft'] || k['ShiftRight']);
    if ((abKey && !this._abilityLatch) || this.touchAbility) {
      this.state.ability = true;
    }
    this._abilityLatch = abKey;
    this.touchAbility = false;

    this.state.pause = false;
    if (k['KeyP'] && !this._pauseLatch) this.state.pause = true;
    this._pauseLatch = !!k['KeyP'];

    this.state.mute = false;
    if (k['KeyM'] && !this._muteLatch) this.state.mute = true;
    this._muteLatch = !!k['KeyM'];

    this.state.restart = false;
    if (k['KeyR'] && !this._restartLatch) this.state.restart = true;
    this._restartLatch = !!k['KeyR'];
  };

  HC.InputManager = InputManager;
})(window.HC = window.HC || {});
