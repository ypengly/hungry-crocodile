/* ==========================================================================
   world.js — Owns entities, treasures, zones, environment and weather/time
   ========================================================================== */
(function (HC) {
  'use strict';

  function World() {
    this.entities = [];
    this.treasures = [];
    this.environment = new HC.Environment();
    this.river = new HC.River();
    this.spawner = new HC.SpawnManager();

    this.weather = 'clear';
    this.weatherTimer = HC.utils.rand(40, 80);
    this.dayNight = { time: 0.3, lightLevel: 1 }; // time 0..1 across a full day

    this.currentZone = HC.CONFIG.ZONES[0];
  }

  World.prototype.update = function (dt, player, particles, audio) {
    this.river.update(dt);
    this.spawner.update(dt, this, player);
    this.currentZone = HC.utils.zoneAt(player.x);

    // day/night cycle: full cycle every 6 minutes
    this.dayNight.time = (this.dayNight.time + dt / 360) % 1;
    const t = this.dayNight.time;
    // light level curve: bright at 0.25-0.55 (day), dark at 0.75-1 & 0-0.1 (night)
    this.dayNight.lightLevel = 0.25 + 0.75 * (0.5 + 0.5 * Math.cos((t - 0.4) * Math.PI * 2));

    // weather
    this.weatherTimer -= dt;
    if (this.weatherTimer <= 0) {
      this.weatherTimer = HC.utils.rand(50, 100);
      const roll = Math.random();
      this.weather = roll < 0.5 ? 'clear' : roll < 0.7 ? 'rain' : roll < 0.85 ? 'fog' : roll < 0.95 ? 'heavyRain' : 'storm';
    }

    for (const e of this.entities) {
      if (!e.alive) continue;
      e.update(dt, player, this);
    }

    for (const tr of this.treasures) { tr.bob += dt * 2; }
  };

  World.prototype.removeDeadEntities = function () {
    this.entities = this.entities.filter(e => e.alive);
  };

  HC.World = World;
})(window.HC = window.HC || {});
