/* ==========================================================================
   game.js — Core Game class: state machine, main loop, combat, rendering
   ========================================================================== */
(function (HC) {
  'use strict';

  const STATE = { MENU: 'menu', PLAYING: 'playing', PAUSED: 'paused', GAMEOVER: 'gameover' };

  function Game() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.state = STATE.MENU;

    this.save = HC.SaveSystem.load();
    this.input = new HC.InputManager();
    this.audio = new HC.AudioManager();
    this.particles = new HC.ParticleSystem();
    this.particles.enabled = this.save.settings.particles;
    this.notifications = new HC.NotificationUI();
    this.zoneTracker = new HC.ZoneTracker();
    this.hud = new HC.HUD();
    this.menuUI = new HC.MenuUI(this);

    this.world = null;
    this.player = null;
    this.missionManager = null;
    this.camera = new HC.Camera(window.innerWidth, window.innerHeight);

    this.lastTime = 0;
    this.runXpEarned = 0;
    this.runCoinsEarned = 0;
    this._dangerCooldown = 0;

    this._resize();
    window.addEventListener('resize', () => this._resize());

    this._bindAudioUnlock();
    this._detectMobile();

    this.menuUI.show('menu');
    this.refreshMenuStats();

    requestAnimationFrame((t) => this._loop(t));
  }

  Game.prototype._resize = function () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.camera) this.camera.resize(window.innerWidth, window.innerHeight);
  };

  Game.prototype._detectMobile = function () {
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) document.getElementById('mobile-controls').classList.add('active');
  };

  Game.prototype._bindAudioUnlock = function () {
    const overlay = document.getElementById('btn-audio-unlock');
    const unlock = () => {
      this.audio.init();
      this.audio.resume();
      this.audio.setMuted(!this.save.settings.sound && !this.save.settings.music);
      this.audio.setMusicOn(this.save.settings.music);
      this.audio.setSfxOn(this.save.settings.sound);
      overlay.classList.add('hidden');
      overlay.removeEventListener('click', unlock);
    };
    overlay.addEventListener('click', unlock);
  };

  Game.prototype.refreshMenuStats = function () {
    document.getElementById('menu-best-level').textContent = this.save.bestLevel;
    document.getElementById('menu-coins').textContent = HC.utils.formatNum(this.save.coins);
  };

  Game.prototype.persist = function () { HC.SaveSystem.save(this.save); };

  Game.prototype.resetProgress = function () {
    this.save = HC.SaveSystem.reset();
    this.refreshMenuStats();
    this.menuUI.show('menu');
    this.notifications.toast('Progress reset.');
  };

  Game.prototype.onEquipCroc = function (typeId) {
    if (this.player) this.player.setType(typeId);
  };

  Game.prototype.onUpgradeChanged = function () {
    if (this.player) this.player.applyUpgrades(this.save.upgrades);
  };

  /* ---------------------------- RUN LIFECYCLE ---------------------------- */

  Game.prototype.startRun = function () {
    this.world = new HC.World();
    this.player = new HC.Crocodile(this.save.equippedCroc, 400, HC.CONFIG.WORLD_HEIGHT / 2);
    this.player.applyUpgrades(this.save.upgrades);
    this.player.level = 1;
    this.player.xp = 0;
    this.player.recalcStats();
    this.player.health = this.player.maxHealth;

    this.world.spawner.prepopulate(this.world, this.player);
    this.camera.x = this.player.x - this.camera.width / 2;
    this.camera.y = this.player.y - this.camera.height / 2;

    this.missionManager = new HC.MissionManager(this.save);
    this.zoneTracker = new HC.ZoneTracker();
    this.runXpEarned = 0;
    this.runCoinsEarned = 0;
    this._runEatenCount = 0;
    this._runTreasureCount = 0;

    this.state = STATE.PLAYING;
    document.body.classList.add('game-active');
    this.menuUI.show('hud');
    this.audio.play('menu');
  };

  Game.prototype.pause = function () {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.PAUSED;
    this.menuUI.show('pause');
  };

  Game.prototype.resume = function () {
    if (this.state !== STATE.PAUSED) return;
    this.state = STATE.PLAYING;
    this.menuUI.show('hud');
  };

  Game.prototype.quitToMenu = function () {
    this.state = STATE.MENU;
    document.body.classList.remove('game-active');
    this.menuUI.show('menu');
  };

  Game.prototype.gameOver = function () {
    this.state = STATE.GAMEOVER;
    document.body.classList.remove('game-active');
    this.audio.play('gameover');
    this.camera.shake(18);

    this.save.bestLevel = Math.max(this.save.bestLevel, this.player.level);
    this.persist();

    const score = Math.round(this.player.stats.distanceTraveled / 4 + this.runXpEarned * 3 + this.runCoinsEarned * 2);
    document.getElementById('go-score').textContent = HC.utils.formatNum(score);
    document.getElementById('go-xp').textContent = HC.utils.formatNum(this.runXpEarned);
    document.getElementById('go-coins').textContent = HC.utils.formatNum(this.runCoinsEarned);
    document.getElementById('go-eaten').textContent = HC.utils.formatNum(this._runEatenCount);
    document.getElementById('go-treasure').textContent = HC.utils.formatNum(this._runTreasureCount);

    this.menuUI.show('gameover');
  };

  /* ------------------------------- LOOP ---------------------------------- */

  Game.prototype._loop = function (timestamp) {
    let dt = (timestamp - this.lastTime) / 1000;
    if (!isFinite(dt) || dt < 0) dt = 0;
    dt = Math.min(dt, 0.05);
    this.lastTime = timestamp;

    this.input.update();

    if (this.state === STATE.PLAYING) {
      this._update(dt);
    } else if (this.state === STATE.PAUSED) {
      if (this.input.state.pause) this.resume();
      if (this.input.state.restart) this.startRun();
    } else if (this.state === STATE.GAMEOVER) {
      if (this.input.state.restart) this.startRun();
    }
    this._render(dt);

    requestAnimationFrame((t) => this._loop(t));
  };

  Game.prototype._update = function (dt) {
    const { player, world, input } = this;

    if (input.state.pause) { this.pause(); return; }
    if (input.state.restart) { this.startRun(); return; }
    if (input.state.mute) {
      this.save.settings.sound = !this.save.settings.sound;
      this.audio.setSfxOn(this.save.settings.sound);
      this.persist();
    }

    player.update(dt, input.state, world);
    if (input.state.attack && player.canAttack()) this._tryAttack();
    if (input.state.ability) this._tryAbility();

    world.update(dt, player, this.particles, this.audio);
    this.particles.update(dt);

    this._applyWhirlpool(dt);
    this._handleCollisions(dt);
    this._handleZoneAndDanger(dt);
    this._handleMissionTicks(dt);

    this.camera.follow(player, dt, player.boosting);

    if (player.speedMag > 40 && Math.random() < dt * 6 && player.depth < 20) {
      this.particles.spawn({
        x: player.x - Math.cos(player.heading) * player.size,
        y: player.y - Math.sin(player.heading) * player.size,
        vx: HC.utils.rand(-10, 10), vy: HC.utils.rand(-10, 10),
        size: HC.utils.rand(2, 4), color: 'rgba(255,255,255,0.6)', maxLife: 0.6, type: 'dot'
      });
    }
    if (player.depth > 15 && Math.random() < dt * 3) {
      this.particles.spawn({
        x: player.x + HC.utils.rand(-10, 10), y: player.y + HC.utils.rand(-10, 10),
        vx: 0, vy: -20, size: HC.utils.rand(1.5, 3), color: 'rgba(255,255,255,0.5)', maxLife: 1.2, type: 'dot', gravity: -10
      });
    }

    if (!player.alive) this.gameOver();

    this.hud.update(player, this.save, this.missionManager, world.currentZone);
  };

  Game.prototype._tryAbility = function () {
    const { player } = this;
    if (!player.abilities.trigger()) {
      this.notifications.toast('Ability still recharging');
      return;
    }
    const def = player.abilities.get();
    this.audio.play('ability');
    this.camera.shake(this.save.settings.screenShake ? 5 : 0);
    this.particles.burst(player.x, player.y, 18, {
      color: def.color, maxLife: 0.7, size: 3.5, minSpeed: 60, maxSpeed: 200
    });
    this.notifications.toast(def.name + '!');
  };

  // Whirlpool drags nearby small prey toward the player while active
  Game.prototype._applyWhirlpool = function (dt) {
    const { player, world } = this;
    if (!player.abilities.active) return;
    if (player.typeDef().ability !== 'whirlpool') return;
    const radius = 320;
    for (const e of world.entities) {
      if (!e.alive || e.category !== 'prey') continue;
      if (e.tier !== 'tiny' && e.tier !== 'small') continue;
      const d = HC.utils.dist(e.x, e.y, player.x, player.y);
      if (d > radius || d < 1) continue;
      const pull = (1 - d / radius) * 260 * dt;
      e.x += (player.x - e.x) / d * pull;
      e.y += (player.y - e.y) / d * pull;
    }
    if (Math.random() < dt * 20) {
      const a = Math.random() * Math.PI * 2;
      this.particles.spawn({
        x: player.x + Math.cos(a) * radius * 0.7,
        y: player.y + Math.sin(a) * radius * 0.7,
        vx: -Math.cos(a) * 160, vy: -Math.sin(a) * 160,
        size: 2.5, color: '#4fd1c5', maxLife: 0.8, type: 'dot', drag: 1
      });
    }
  };

  Game.prototype._tryAttack = function () {
    const { player, world } = this;
    player.triggerAttack();
    this.audio.play('bite');
    const biteX = player.x + Math.cos(player.heading) * player.size * 1.3;
    const biteY = player.y + Math.sin(player.heading) * player.size * 1.3;
    this.particles.burst(biteX, biteY, 6, { color: 'rgba(255,255,255,0.7)', maxLife: 0.4, size: 2.5, minSpeed: 40, maxSpeed: 100 });

    let target = null, bestDist = player.size * 2.2 + 16;
    for (const e of world.entities) {
      if (!e.alive) continue;
      const d = HC.utils.dist(player.x, player.y, e.x, e.y);
      if (d < bestDist) { bestDist = d; target = e; }
    }
    if (!target) return;

    if (target.category === 'prey' && !HC.Collision.canEat(player.effectiveSize(), target.size * 1.6)) {
      // too big to bite effectively — small chip damage only
      target.takeDamage(player.currentBiteDamage() * 0.2);
      return;
    }

    target.takeDamage(player.currentBiteDamage());
    this.camera.shake(this.save.settings.screenShake ? 3 : 0);

    if (!target.alive) this._handleKill(target);
  };

  Game.prototype._handleKill = function (target) {
    const { player } = this;
    const xp = target.xpReward;
    const coins = target.coinReward;
    this.audio.play(target.category === 'predator' ? 'damage' : 'eat');
    this.particles.burst(target.x, target.y, 10, { color: target.color, maxLife: 0.5, size: 3, minSpeed: 30, maxSpeed: 120 });
    this.particles.floatingText(target.x, target.y - 20, `+${xp} XP`, '#4fd1c5');
    this.particles.floatingText(target.x, target.y - 40, `+${coins}`, '#ffd95e');
    this.audio.play('coin');

    this.runXpEarned += xp;
    this.runCoinsEarned += coins;
    this.save.coins += coins;
    this.save.stats.totalCoinsEarned = (this.save.stats.totalCoinsEarned || 0) + coins;
    this.save.stats.animalsEaten += 1;
    this._runEatenCount += 1;
    player.stats.animalsEaten += 1;

    if (target.kind === 'boat') {
      this.save.stats.boatsDestroyed += 1;
      player.stats.boatsDestroyed += 1;
    }
    if (target.category === 'predator') {
      this.save.stats.predatorsDefeated += 1;
      player.stats.predatorsDefeated += 1;
      this.missionManager.notify('defeatPredator', { defId: target.defId });
    }

    const leveled = player.addXP(xp);
    if (leveled) {
      this.audio.play('levelup');
      const titleInfo = HC.utils.titleForLevel(player.level);
      this.notifications.levelUp(player.level, titleInfo.title);
      const bonus = HC.Progression.levelUpCoinReward(player.level);
      this.save.coins += bonus;
      this.runCoinsEarned += bonus;
      this._applyMissionRewards(this.missionManager.notify('level', { level: player.level }));
    }

    this._applyMissionRewards(this.missionManager.notify('eat', { kind: target.kind }));
    this._checkAchievements();
    this.persist();
  };

  Game.prototype._applyMissionRewards = function (rewards) {
    if (!rewards || rewards.length === 0) return;
    rewards.forEach((def) => {
      if (def.reward.coins) {
        this.save.coins += def.reward.coins;
        this.runCoinsEarned += def.reward.coins;
      }
      this.audio.play('mission');
      this.notifications.toast(`Mission complete: ${def.desc} (+${def.reward.coins || 0} coins)`);
    });
    this.persist();
  };

  Game.prototype._handleCollisions = function (dt) {
    const { player, world } = this;

    // eat prey by simple proximity (auto-nibble small creatures on contact) — small tier only
    for (const e of world.entities) {
      if (!e.alive) continue;
      const hit = HC.Collision.circleHit(player.x, player.y, player.size * 0.9, e.x, e.y, e.size * 0.7);
      if (!hit) continue;

      if (e.category === 'prey' && e.tier === 'tiny' && HC.Collision.canEat(player.effectiveSize(), e.size)) {
        e.takeDamage(999);
        player.eatingAnimTimer = 0.3;
        this._handleKill(e);
        continue;
      }

      if (e.category === 'predator' || (e.category === 'prey' && e.threat > 0)) {
        if (e.state === 'chase' && player.invulnTimer <= 0) {
          player.takeDamage(e.damage || 8);
          this.audio.play('damage');
          this.camera.shake(this.save.settings.screenShake ? 8 : 0);
          this.particles.burst(player.x, player.y, 8, { color: '#ff5e5e', maxLife: 0.4, size: 3 });
        }
      }
    }

    // treasures
    for (const t of world.treasures) {
      if (t.collected) continue;
      if (HC.Collision.circleHit(player.x, player.y, player.size, t.x, t.y, t.size)) {
        t.collected = true;
        this.audio.play('treasure');
        this.particles.burst(t.x, t.y, 14, { color: '#ffd95e', maxLife: 0.7, size: 3, minSpeed: 40, maxSpeed: 160 });
        this.particles.floatingText(t.x, t.y - 20, `+${t.value}`, '#ffd95e');
        this.save.coins += t.value;
        this.runCoinsEarned += t.value;
        this.save.stats.treasuresFound += 1;
        this._runTreasureCount += 1;
        this._applyMissionRewards(this.missionManager.notify('treasure', {}));
        this._checkAchievements();
        this.persist();
      }
    }
    world.treasures = world.treasures.filter(t => !t.collected);
    world.removeDeadEntities();
  };

  Game.prototype._handleZoneAndDanger = function (dt) {
    const { player, world } = this;
    const zone = this.zoneTracker.check(player, (z) => {
      this.notifications.zoneEnter(z.name);
      this._applyMissionRewards(this.missionManager.notify('zone', { zoneId: z.id }));
    });

    this._dangerCooldown -= dt;
    if (this._dangerCooldown <= 0) {
      const nearbyThreat = world.entities.find(e =>
        e.alive && e.category === 'predator' &&
        e.size > player.effectiveSize() * 1.5 &&
        HC.utils.dist(e.x, e.y, player.x, player.y) < 260
      );
      if (nearbyThreat) {
        this.notifications.danger();
        this._dangerCooldown = 4;
      }
    }
  };

  Game.prototype._handleMissionTicks = function () {
    const { player } = this;
    this._applyMissionRewards(this.missionManager.notify('survive', { seconds: Math.floor(player.stats.survivalTime) }));
  };

  Game.prototype._checkAchievements = function () {
    const stateForCheck = { level: this.player.level, stats: this.save.stats, achievements: this.save.achievements };
    const unlocked = HC.Progression.checkAchievements(stateForCheck);
    unlocked.forEach((ach) => {
      this.notifications.toast(`🏆 Achievement: ${ach.name}`);
      this.audio.play('mission');
    });
  };

  /* ------------------------------- RENDER --------------------------------- */

  Game.prototype._render = function () {
    const ctx = this.ctx;
    const w = window.innerWidth, h = window.innerHeight;

    if (this.state === STATE.MENU || !this.world) {
      ctx.fillStyle = '#0a2733';
      ctx.fillRect(0, 0, w, h);
      return;
    }

    const { world, player, camera } = this;
    world.river.drawBackground(ctx, camera, world.currentZone, world.weather, world.dayNight);

    world.environment.draw(ctx, camera);

    // treasures
    for (const t of world.treasures) {
      const sx = t.x - camera.x, sy = t.y - camera.y + Math.sin(t.bob) * 4;
      if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) continue;
      this._drawTreasure(ctx, t, sx, sy);
    }

    // entities (sorted by y for pseudo-depth)
    const sorted = world.entities.slice().sort((a, b) => a.y - b.y);
    for (const e of sorted) {
      const sx = e.x - camera.x, sy = e.y - camera.y;
      if (sx < -80 || sx > w + 80 || sy < -80 || sy > h + 80) continue;
      const drawFn = HC.EntityDraw[e.defId];
      if (drawFn) drawFn(ctx, e, sx, sy);
    }

    player.drawWake(ctx, camera);
    player.draw(ctx, camera);

    this.particles.draw(ctx, camera);

    this._drawWeatherOverlay(ctx, world, w, h);
    this._drawNightOverlay(ctx, world, w, h);
    this._drawMinimap(ctx, w, h);
  };

  Game.prototype._drawTreasure = function (ctx, t, sx, sy) {
    const colors = { common: '#c9a468', rare: '#4fd1c5', epic: '#a86bd6', legendary: '#ffd95e' };
    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = colors[t.rarity] || '#c9a468';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-12, -8, 24, 16, 3) : ctx.rect(-12, -8, 24, 16);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(-12, -2, 24, 3);
    ctx.fillStyle = '#fff2c2';
    ctx.beginPath();
    ctx.arc(0, -8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  Game.prototype._drawWeatherOverlay = function (ctx, world, w, h) {
    if (world.weather === 'rain' || world.weather === 'heavyRain' || world.weather === 'storm') {
      const density = world.weather === 'storm' ? 90 : world.weather === 'heavyRain' ? 60 : 30;
      ctx.save();
      ctx.strokeStyle = 'rgba(200,220,255,0.35)';
      ctx.lineWidth = 1;
      const t = performance.now() / 1000;
      for (let i = 0; i < density; i++) {
        const x = (i * 97 + t * 400) % w;
        const y = (i * 53 + t * 900) % h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y + 14);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  Game.prototype._drawNightOverlay = function (ctx, world, w, h) {
    const light = world.dayNight.lightLevel;
    if (light < 0.9) {
      ctx.save();
      ctx.fillStyle = `rgba(5,10,30,${(1 - light) * 0.55})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  };

  Game.prototype._drawMinimap = function (ctx, w, h) {
    if (!this.player) return;
    const mapW = 130, mapH = 70;
    const mx = w - mapW - 16, my = h - mapH - 16;
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = 'rgba(4,18,26,0.6)';
    ctx.fillRect(mx, my, mapW, mapH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(mx, my, mapW, mapH);

    HC.CONFIG.ZONES.forEach((z) => {
      const zx = mx + (z.bounds.x0 / HC.CONFIG.WORLD_WIDTH) * mapW;
      const zw = ((z.bounds.x1 - z.bounds.x0) / HC.CONFIG.WORLD_WIDTH) * mapW;
      ctx.fillStyle = z.water;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(zx, my, zw, mapH);
    });

    ctx.globalAlpha = 1;
    const px = mx + (this.player.x / HC.CONFIG.WORLD_WIDTH) * mapW;
    const py = my + (this.player.y / HC.CONFIG.WORLD_HEIGHT) * mapH;
    ctx.fillStyle = '#ffd95e';
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  HC.Game = Game;
  HC.GAME_STATE = STATE;
})(window.HC = window.HC || {});
