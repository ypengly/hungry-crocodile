/* ==========================================================================
   zones.js — Zone transition detection and helper utilities
   ========================================================================== */
(function (HC) {
  'use strict';

  function ZoneTracker() {
    this.lastZoneId = null;
  }

  ZoneTracker.prototype.check = function (player, onEnterZone) {
    const zone = HC.utils.zoneAt(player.x);
    if (zone.id !== this.lastZoneId) {
      this.lastZoneId = zone.id;
      if (onEnterZone) onEnterZone(zone);
    }
    return zone;
  };

  HC.ZoneTracker = ZoneTracker;
})(window.HC = window.HC || {});
