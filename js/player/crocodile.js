/* ==========================================================================
   crocodile.js — Player-controlled crocodile: movement, animation, combat
   ========================================================================== */
(function (HC) {
  'use strict';

  function Crocodile(typeId, x, y) {
    this.typeId = typeId || 'swamp';
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.heading = 0;
    this.speedMag = 0;

    this.level = 1;
    this.xp = 0;

    this.health = 100;
    this.maxHealth = 100;
    this.oxygen = HC.CONFIG.OXYGEN_MAX;
    this.depth = 0; // 0 = surface
    this.diving = false;

    this.alive = true;
    this.invulnTimer = 0;
    this.flashTimer = 0;

    this.animPhase = 0;
    this.jawOpen = 0;
    this.attackCooldown = 0;
    this.attackAnimTimer = 0;
    this.eatingAnimTimer = 0;

    this.boosting = false;
    this.boostFuel = 100;

    this.ambushActive = false;

    this.abilities = new HC.AbilityManager(this);

    this.stats = {
      animalsEaten: 0, boatsDestroyed: 0, predatorsDefeated: 0,
      treasuresFound: 0, distanceTraveled: 0, survivalTime: 0
    };

    this.wakePoints = [];
    this.upgradeMult = { health: 1, speed: 1, damage: 1 };
    this.recalcStats();
  }

  Crocodile.prototype.applyUpgrades = function (upgrades) {
    this.upgradeMult.health = 1 + (upgrades.health || 0) * 0.07;
    this.upgradeMult.speed = 1 + (upgrades.speed || 0) * 0.05;
    this.upgradeMult.damage = 1 + (upgrades.damage || 0) * 0.08;
    this.recalcStats();
  };

  Crocodile.prototype.typeDef = function () { return HC.CrocTypes.get(this.typeId); };

  Crocodile.prototype.recalcStats = function () {
    const t = this.typeDef();
    const levelFactor = 1 + (this.level - 1) * 0.045;
    const um = this.upgradeMult || { health: 1, speed: 1, damage: 1 };
    this.maxHealth = Math.round(90 * t.health * levelFactor * um.health);
    this.baseSpeed = 165 * t.speed * um.speed;
    this.boostSpeed = this.baseSpeed * 1.9 * t.boost;
    this.biteDamage = Math.round((14 + this.level * 1.6) * t.damage * um.damage);
    const titleInfo = HC.utils.titleForLevel(this.level);
    this.scale = titleInfo.scale * (1 + (this.level % 10) * 0.01);
    this.size = 26 * this.scale;
    this.title = titleInfo.title;
  };

  Crocodile.prototype.effectiveSize = function () { return this.size; };

  Crocodile.prototype.setType = function (typeId) {
    const prevFrac = this.health / this.maxHealth;
    this.typeId = typeId;
    this.recalcStats();
    this.health = this.maxHealth * prevFrac;
  };

  Crocodile.prototype.addXP = function (amount, particles) {
    this.xp += amount;
    let leveled = false;
    while (this.level < HC.CONFIG.MAX_LEVEL && this.xp >= HC.utils.xpForLevel(this.level + 1)) {
      this.level++;
      leveled = true;
    }
    this.recalcStats();
    return leveled;
  };

  Crocodile.prototype.takeDamage = function (dmg) {
    if (this.invulnTimer > 0 || !this.alive) return;
    let mult = 1;
    if (this.abilities.active && this.typeDef().ability === 'thickHide') mult = 0.45;
    this.health -= dmg * mult;
    this.flashTimer = 0.2;
    this.invulnTimer = 0.35;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  };

  Crocodile.prototype.heal = function (amount) {
    this.health = HC.utils.clamp(this.health + amount, 0, this.maxHealth);
  };

  Crocodile.prototype.update = function (dt, input, world) {
    if (!this.alive) return;

    this.animPhase += dt;
    if (this.invulnTimer > 0) this.invulnTimer -= dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.attackAnimTimer > 0) this.attackAnimTimer -= dt;
    if (this.eatingAnimTimer > 0) this.eatingAnimTimer -= dt;

    this.abilities.update(dt);
    this.ambushActive = this.abilities.active && this.typeDef().ability === 'ambush';

    // --- turning & heading ---
    this.heading += input.turn * dt * 3.2;

    // --- diving / depth ---
    this.diving = input.dive > 0.15;
    const diveRate = 90;
    if (this.diving) this.depth = HC.utils.clamp(this.depth + diveRate * dt, 0, HC.CONFIG.DIVE_DEPTH_MAX);
    else this.depth = HC.utils.clamp(this.depth - diveRate * 1.4 * dt, 0, HC.CONFIG.DIVE_DEPTH_MAX);

    // --- oxygen ---
    if (this.depth > 40) {
      this.oxygen -= HC.CONFIG.OXYGEN_DRAIN_PER_SEC * dt;
      if (this.oxygen <= 0) { this.oxygen = 0; this.takeDamage(6 * dt); }
    } else {
      this.oxygen = HC.utils.clamp(this.oxygen + HC.CONFIG.OXYGEN_RECOVER_PER_SEC * dt, 0, HC.CONFIG.OXYGEN_MAX);
    }

    // --- boosting ---
    let dashActive = this.abilities.active && this.typeDef().ability === 'riverDash';
    this.boosting = (input.boost && this.boostFuel > 0) || dashActive;
    if (this.boosting && !dashActive) this.boostFuel = Math.max(0, this.boostFuel - 32 * dt);
    else if (!this.boosting) this.boostFuel = Math.min(100, this.boostFuel + 14 * dt);

    // --- speed / acceleration ---
    let targetSpeed = input.forward > 0 ? this.baseSpeed : this.baseSpeed * 0.15;
    if (this.boosting) targetSpeed = this.boostSpeed;
    const accel = this.boosting ? 5.5 : 3.2;
    this.speedMag = HC.utils.lerp(this.speedMag, targetSpeed, Math.min(1, accel * dt));

    this.vx = Math.cos(this.heading) * this.speedMag;
    this.vy = Math.sin(this.heading) * this.speedMag;

    const prevX = this.x, prevY = this.y;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.x = HC.utils.clamp(this.x, 30, HC.CONFIG.WORLD_WIDTH - 30);
    this.y = HC.utils.clamp(this.y, 30, HC.CONFIG.WORLD_HEIGHT - 30);
    this.stats.distanceTraveled += HC.utils.dist(prevX, prevY, this.x, this.y);

    // wake trail
    if (this.speedMag > 20 && this.depth < 30) {
      this.wakePoints.unshift({ x: this.x, y: this.y, life: 1 });
      if (this.wakePoints.length > 18) this.wakePoints.pop();
    }
    this.wakePoints.forEach(p => { p.life -= dt * 1.4; });
    this.wakePoints = this.wakePoints.filter(p => p.life > 0);

    // jaw animation
    if (this.attackAnimTimer > 0) {
      this.jawOpen = Math.sin((0.25 - this.attackAnimTimer) / 0.25 * Math.PI);
    } else {
      this.jawOpen = 0;
    }

    this.stats.survivalTime += dt;
  };

  Crocodile.prototype.canAttack = function () { return this.attackCooldown <= 0 && this.alive; };

  Crocodile.prototype.triggerAttack = function () {
    let cd = 0.55;
    if (this.abilities.active && this.typeDef().ability === 'biteFrenzy') cd *= 0.45;
    this.attackCooldown = cd;
    this.attackAnimTimer = 0.25;
  };

  Crocodile.prototype.currentBiteDamage = function () {
    let dmg = this.biteDamage;
    if (this.abilities.active) {
      const ab = this.typeDef().ability;
      if (ab === 'megaBite') dmg *= 2.4;
      if (ab === 'biteFrenzy') dmg *= 1.15;
    }
    return dmg;
  };

  Crocodile.prototype.draw = function (ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const s = this.size;
    const t = this.typeDef();

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.heading);

    if (this.depth > 10) ctx.globalAlpha = HC.utils.clamp(1 - this.depth / (HC.CONFIG.DIVE_DEPTH_MAX * 1.6), 0.35, 1);
    if (this.flashTimer > 0) ctx.filter = 'brightness(2.2) saturate(1.4)';
    if (this.invulnTimer > 0 && Math.floor(this.invulnTimer * 20) % 2 === 0) ctx.globalAlpha *= 0.5;
    if (this.ambushActive) ctx.globalAlpha *= 0.55;

    const swimWag = Math.sin(this.animPhase * (4 + this.speedMag / 40)) * (this.speedMag > 5 ? 1 : 0.3);

    // shadow under croc (surface indicator)
    ctx.save();
    ctx.globalAlpha *= 0.25;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.15, s * 1.4, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // tail (3 segments for swimming motion)
    ctx.fillStyle = t.darkColor;
    for (let i = 0; i < 3; i++) {
      const segX = -s * (1.0 + i * 0.55);
      const segWag = Math.sin(this.animPhase * (4 + this.speedMag / 40) - i * 0.9) * s * 0.28;
      ctx.beginPath();
      ctx.ellipse(segX, segWag * 0.4, s * 0.5 - i * 0.08 * s, s * (0.32 - i * 0.06), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // tail fin tip
    ctx.beginPath();
    ctx.moveTo(-s * 2.5, 0);
    ctx.lineTo(-s * 2.9, -s * 0.35 + swimWag * s * 0.2);
    ctx.lineTo(-s * 2.9, s * 0.35 + swimWag * s * 0.2);
    ctx.closePath();
    ctx.fill();

    // body
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.15, s * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();

    // back ridges
    ctx.fillStyle = t.darkColor;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(i * s * 0.32, -s * 0.42, s * 0.14, s * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // legs (subtle, near body)
    ctx.fillStyle = t.darkColor;
    const legPhase = Math.sin(this.animPhase * 5) * s * 0.1;
    ctx.beginPath();
    ctx.ellipse(-s * 0.2, s * 0.55 + legPhase, s * 0.22, s * 0.15, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.35, s * 0.55 - legPhase, s * 0.22, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // upper jaw (head)
    ctx.fillStyle = t.color;
    ctx.save();
    ctx.beginPath();
    const jawLift = -this.jawOpen * 0.35;
    ctx.translate(s * 0.95, 0);
    ctx.rotate(jawLift);
    ctx.moveTo(0, -s * 0.32);
    ctx.lineTo(s * 1.35, -s * 0.12);
    ctx.lineTo(s * 1.35, 0);
    ctx.lineTo(0, s * 0.02);
    ctx.closePath();
    ctx.fill();
    // teeth on upper jaw
    ctx.fillStyle = '#f5f0dc';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(s * 0.3 + i * s * 0.28, -s * 0.05);
      ctx.lineTo(s * 0.36 + i * s * 0.28, s * 0.08);
      ctx.lineTo(s * 0.24 + i * s * 0.28, s * 0.08);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // lower jaw
    ctx.fillStyle = t.color;
    ctx.save();
    ctx.beginPath();
    const jawDrop = this.jawOpen * 0.4;
    ctx.translate(s * 0.95, 0);
    ctx.rotate(jawDrop);
    ctx.moveTo(0, s * 0.05);
    ctx.lineTo(s * 1.2, s * 0.05);
    ctx.lineTo(s * 1.2, s * 0.22);
    ctx.lineTo(0, s * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // eyes (on top of head, bulging)
    ctx.fillStyle = t.darkColor;
    ctx.beginPath();
    ctx.arc(s * 0.55, -s * 0.42, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c744';
    ctx.beginPath();
    ctx.arc(s * 0.58, -s * 0.42, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(s * 0.6, -s * 0.42, s * 0.035, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // ability glow ring
    if (this.abilities.active) {
      const abDef = this.abilities.get();
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = abDef.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx, sy, s * 1.7 + Math.sin(this.animPhase * 6) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  };

  Crocodile.prototype.drawWake = function (ctx, camera) {
    if (this.wakePoints.length < 2) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    this.wakePoints.forEach((p, i) => {
      const sx = p.x - camera.x, sy = p.y - camera.y;
      ctx.globalAlpha = p.life * 0.4;
      if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    });
    ctx.stroke();
    ctx.restore();
  };

  HC.Crocodile = Crocodile;
})(window.HC = window.HC || {});
