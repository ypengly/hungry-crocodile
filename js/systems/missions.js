/* ==========================================================================
   missions.js — Active mission tracking, progress and rewards
   ========================================================================== */
(function (HC) {
  'use strict';

  const ACTIVE_MISSION_COUNT = 3;

  function MissionManager(saveState) {
    this.save = saveState;
    if (!this.save.missions || this.save.missions.active.length === 0) {
      this.refill();
    }
  }

  MissionManager.prototype.refill = function () {
    if (!this.save.missions) this.save.missions = { active: [], completed: [] };
    const pool = HC.CONFIG.MISSIONS_POOL.filter(m =>
      !this.save.missions.completed.includes(m.id) &&
      !this.save.missions.active.some(a => a.id === m.id));
    while (this.save.missions.active.length < ACTIVE_MISSION_COUNT && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      const def = pool.splice(idx, 1)[0];
      this.save.missions.active.push({ id: def.id, progress: 0 });
    }
  };

  MissionManager.prototype.getDef = function (id) {
    return HC.CONFIG.MISSIONS_POOL.find(m => m.id === id);
  };

  MissionManager.prototype.notify = function (eventType, payload) {
    const completedThisTick = [];
    for (const m of this.save.missions.active) {
      const def = this.getDef(m.id);
      if (!def) continue;
      let matched = false;
      if (def.type === 'eatAny' && eventType === 'eat') matched = true;
      if (def.type === 'eatKind' && eventType === 'eat' && payload.kind === def.target) matched = true;
      if (def.type === 'treasure' && eventType === 'treasure') matched = true;
      if (def.type === 'destroyBoat' && eventType === 'eat' && payload.kind === 'boat') matched = true;
      if (def.type === 'defeatBoss' && eventType === 'defeatPredator' && payload.defId === def.target) matched = true;
      if (def.type === 'reachZone' && eventType === 'zone' && payload.zoneId === def.target) matched = true;
      if (def.type === 'level' && eventType === 'level') { m.progress = payload.level; }
      else if (def.type === 'survive' && eventType === 'survive') { m.progress = payload.seconds; }
      else if (matched) { m.progress += 1; }

      if (m.progress >= def.count && !completedThisTick.includes(m)) {
        completedThisTick.push(m);
      }
    }

    const rewards = [];
    for (const m of completedThisTick) {
      const def = this.getDef(m.id);
      this.save.missions.active = this.save.missions.active.filter(a => a.id !== m.id);
      this.save.missions.completed.push(m.id);
      rewards.push(def);
    }
    if (completedThisTick.length > 0) this.refill();
    return rewards;
  };

  MissionManager.prototype.progressList = function () {
    return this.save.missions.active.map(m => {
      const def = this.getDef(m.id);
      return { desc: def.desc, progress: Math.min(m.progress, def.count), count: def.count };
    });
  };

  HC.MissionManager = MissionManager;
})(window.HC = window.HC || {});
