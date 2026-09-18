/* ==========================================================================
   ai.js — Base Entity class + shared AI state machine behaviors
   ========================================================================== */
(function (HC) {
  'use strict';

  let ENTITY_ID = 1;

  /**
   * Base class for all non-player creatures/objects (fish, birds, animals,
   * predators, boats, humans). Handles generic state, health, wandering and
   * fleeing behaviors. Subclasses / factories customize draw() and specific AI.
   */
  function Entity(def, x, y) {
    this.id = ENTITY_ID++;
    this.defId = def.defId;
    this.category = def.category; // 'prey' | 'predator' | 'boat'
    this.kind = def.kind || 'animal';
    this.tier = def.tier || 'small';
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.heading = Math.random() * Math.PI * 2;
    this.size = def.size;
    this.maxHealth = def.health;
    this.health = def.health;
    this.speed = def.speed;
    this.damage = def.damage || 0;
    this.xpReward = def.xp;
    this.coinReward = def.coins;
    this.color = def.color;
    this.threat = def.threat || 0;
    this.isBoss = !!def.boss;
    this.state = 'idle';
    this.stateTimer = HC.utils.rand(0, 2);
    this.wanderTarget = { x: x + HC.utils.rand(-200, 200), y: y + HC.utils.rand(-200, 200) };
    this.alive = true;
    this.flashTimer = 0;
    this.animPhase = Math.random() * Math.PI * 2;
    this.scared = false;
    this.homeX = x; this.homeY = y;
    this.wanderRadius = def.wanderRadius || 260;
    this.detectionRange = def.detectionRange || (this.category === 'predator' ? 320 : 180);
    this.attackRange = def.attackRange || this.size + 18;
    this.landAnimal = def.kind === 'animal' && def.landAnimal;
    this.retreatHealthFrac = 0.25;
  }

  Entity.prototype.takeDamage = function (dmg) {
    this.health -= dmg;
    this.flashTimer = 0.15;
    if (this.health <= 0) { this.alive = false; }
  };

  Entity.prototype.distanceTo = function (ox, oy) {
    return HC.utils.dist(this.x, this.y, ox, oy);
  };

  // Generic wander behavior: pick a nearby point, move toward it
  Entity.prototype.wander = function (dt) {
    const d = HC.utils.dist(this.x, this.y, this.wanderTarget.x, this.wanderTarget.y);
    if (d < 20) {
      this.wanderTarget = {
        x: this.homeX + HC.utils.rand(-this.wanderRadius, this.wanderRadius),
        y: this.homeY + HC.utils.rand(-this.wanderRadius, this.wanderRadius)
      };
    }
    this._moveToward(this.wanderTarget.x, this.wanderTarget.y, this.speed * 0.5, dt);
  };

  Entity.prototype.fleeFrom = function (px, py, dt, speedMult) {
    const angle = Math.atan2(this.y - py, this.x - px);
    const tx = this.x + Math.cos(angle) * 300;
    const ty = this.y + Math.sin(angle) * 300;
    this._moveToward(tx, ty, this.speed * (speedMult || 1.6), dt);
  };

  Entity.prototype.chase = function (px, py, dt, speedMult) {
    this._moveToward(px, py, this.speed * (speedMult || 1.0), dt);
  };

  Entity.prototype._moveToward = function (tx, ty, speed, dt) {
    const angle = Math.atan2(ty - this.y, tx - this.x);
    this.heading = HC.utils.angleLerp(this.heading, angle, 0.08);
    this.vx = Math.cos(this.heading) * speed;
    this.vy = Math.sin(this.heading) * speed;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  };

  Entity.prototype.update = function (dt, player, world) {
    this.stateTimer -= dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
    this.animPhase += dt * (2 + this.speed / 40);

    const distToPlayer = this.distanceTo(player.x, player.y);
    const playerIsBigger = player.effectiveSize() > this.size * 1.15;
    const playerIsMuchBigger = player.effectiveSize() > this.size * 1.6;

    if (this.category === 'prey') {
      if (distToPlayer < this.detectionRange && playerIsBigger && !player.ambushActive) {
        this.state = 'flee';
      } else if (this.state === 'flee' && distToPlayer > this.detectionRange * 1.4) {
        this.state = 'idle';
      }
      if (this.state === 'flee') this.fleeFrom(player.x, player.y, dt);
      else this.wander(dt);
    } else if (this.category === 'predator') {
      const playerStronger = player.effectiveSize() > this.size * 1.1;
      if (this.health < this.maxHealth * this.retreatHealthFrac) {
        this.state = 'retreat';
      } else if (distToPlayer < this.detectionRange) {
        this.state = playerStronger && !player.ambushActive ? 'wary' : 'chase';
      } else if (this.state !== 'retreat') {
        this.state = 'patrol';
      }

      if (this.state === 'chase') this.chase(player.x, player.y, dt, 1.05);
      else if (this.state === 'retreat' || this.state === 'wary') this.fleeFrom(player.x, player.y, dt, 1.3);
      else this.wander(dt);
    } else {
      // boats follow simple patrol lanes
      this.wander(dt);
    }

    // keep within world bounds
    this.x = HC.utils.clamp(this.x, 40, HC.CONFIG.WORLD_WIDTH - 40);
    this.y = HC.utils.clamp(this.y, 40, HC.CONFIG.WORLD_HEIGHT - 40);
  };

  HC.Entity = Entity;
})(window.HC = window.HC || {});
