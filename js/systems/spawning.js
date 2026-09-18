/* ==========================================================================
   spawning.js — Spawns creatures/boats/treasure near the player, culls far ones
   ========================================================================== */
(function (HC) {
  'use strict';

  const MAX_ENTITIES = 55;
  const SPAWN_RADIUS = 1200;
  const SPAWN_MIN_DIST = 340;
  const CULL_RADIUS = 2200;
  const SPAWN_INTERVAL = 0.35;

  function SpawnManager() {
    this.timer = 0;
    this.treasureTimer = 0;
  }

  /**
   * Fills the area around the player when a run begins so the river feels
   * alive immediately instead of trickling in one creature at a time.
   */
  SpawnManager.prototype.prepopulate = function (world, player, count) {
    count = count || 26;
    for (let i = 0; i < count; i++) {
      this._spawnNear(world, player, 180);
    }
    for (let i = 0; i < 6; i++) {
      this._spawnTreasure(world, player, 260);
    }
  };

  SpawnManager.prototype.update = function (dt, world, player) {
    this.timer -= dt;
    this.treasureTimer -= dt;

    // cull far entities
    world.entities = world.entities.filter(e => {
      if (!e.alive) return false;
      return HC.utils.dist(e.x, e.y, player.x, player.y) < CULL_RADIUS;
    });

    if (this.timer <= 0 && world.entities.length < MAX_ENTITIES) {
      this.timer = SPAWN_INTERVAL;
      this._spawnNear(world, player);
    }

    if (this.treasureTimer <= 0 && world.treasures.length < 14) {
      this.treasureTimer = HC.utils.rand(3, 6);
      this._spawnTreasure(world, player);
    }
  };

  SpawnManager.prototype._spawnNear = function (world, player, minDist) {
    const zone = HC.utils.zoneAt(player.x);
    const pool = zone.spawns.filter((id) => {
      const def = HC.CONFIG.PREY[id] || HC.CONFIG.PREDATORS[id];
      return def && def.minLevel <= player.level + 3;
    });
    if (pool.length === 0) return;
    const id = HC.utils.choice(pool);

    const angle = Math.random() * Math.PI * 2;
    const dist = HC.utils.rand(minDist || SPAWN_MIN_DIST, SPAWN_RADIUS);
    let x = player.x + Math.cos(angle) * dist;
    let y = player.y + Math.sin(angle) * dist;
    x = HC.utils.clamp(x, 60, HC.CONFIG.WORLD_WIDTH - 60);
    y = HC.utils.clamp(y, 60, HC.CONFIG.WORLD_HEIGHT - 60);

    const factory = HC.EntityFactories[id];
    if (!factory) return;
    const entity = factory(x, y);
    world.entities.push(entity);
  };

  SpawnManager.prototype._spawnTreasure = function (world, player, minDist) {
    const angle = Math.random() * Math.PI * 2;
    const dist = HC.utils.rand(minDist || 500, SPAWN_RADIUS);
    let x = HC.utils.clamp(player.x + Math.cos(angle) * dist, 60, HC.CONFIG.WORLD_WIDTH - 60);
    let y = HC.utils.clamp(player.y + Math.sin(angle) * dist, 60, HC.CONFIG.WORLD_HEIGHT - 60);
    const roll = Math.random();
    let rarity = 'common', value = HC.utils.randInt(15, 40);
    if (roll > 0.93) { rarity = 'legendary'; value = HC.utils.randInt(300, 600); }
    else if (roll > 0.75) { rarity = 'epic'; value = HC.utils.randInt(100, 250); }
    else if (roll > 0.5) { rarity = 'rare'; value = HC.utils.randInt(50, 90); }
    world.treasures.push({ x, y, rarity, value, collected: false, bob: Math.random() * Math.PI * 2, size: 16 });
  };

  HC.SpawnManager = SpawnManager;
})(window.HC = window.HC || {});
