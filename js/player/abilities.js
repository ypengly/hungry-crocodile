/* ==========================================================================
   abilities.js — Special ability cooldown/duration manager
   ========================================================================== */
(function (HC) {
  'use strict';

  function AbilityManager(player) {
    this.player = player;
    this.cooldownRemaining = 0;
    this.durationRemaining = 0;
    this.active = false;
  }

  AbilityManager.prototype.get = function () {
    const typeDef = HC.CrocTypes.get(this.player.typeId);
    return HC.CONFIG.ABILITIES[typeDef.ability];
  };

  AbilityManager.prototype.ready = function () {
    return this.cooldownRemaining <= 0;
  };

  AbilityManager.prototype.trigger = function () {
    if (!this.ready()) return false;
    const def = this.get();
    this.active = true;
    this.durationRemaining = def.duration;
    this.cooldownRemaining = def.cooldown;
    return true;
  };

  AbilityManager.prototype.update = function (dt) {
    if (this.cooldownRemaining > 0) this.cooldownRemaining -= dt;
    if (this.active) {
      this.durationRemaining -= dt;
      if (this.durationRemaining <= 0) { this.active = false; }
    }
  };

  HC.AbilityManager = AbilityManager;
})(window.HC = window.HC || {});
