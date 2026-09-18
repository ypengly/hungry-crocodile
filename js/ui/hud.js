/* ==========================================================================
   hud.js — Updates in-game HUD DOM elements each frame
   ========================================================================== */
(function (HC) {
  'use strict';

  function HUD() {
    this.healthFill = document.getElementById('hud-health-fill');
    this.xpFill = document.getElementById('hud-xp-fill');
    this.oxygenFill = document.getElementById('hud-oxygen-fill');
    this.oxygenRow = document.getElementById('hud-oxygen-row');
    this.levelLabel = document.getElementById('hud-level');
    this.coins = document.getElementById('hud-coins');
    this.gems = document.getElementById('hud-gems');
    this.missionDesc = document.getElementById('hud-mission-desc');
    this.missionFill = document.getElementById('hud-mission-fill');
    this.missionBox = document.getElementById('hud-mission-box');
    this.zoneLabel = document.getElementById('hud-zone-label');
    this.abilityRing = document.getElementById('hud-ability-ring');
    this.abilityName = document.getElementById('hud-ability-name');
    this.abilityIcon = document.getElementById('hud-ability-icon');
  }

  HUD.prototype.update = function (player, save, missionManager, zone) {
    const hpFrac = HC.utils.clamp(player.health / player.maxHealth, 0, 1);
    this.healthFill.style.width = (hpFrac * 100) + '%';

    const xpFrac = HC.Progression.xpProgressFraction(player.level, player.xp);
    this.xpFill.style.width = (xpFrac * 100) + '%';

    this.levelLabel.textContent = `LVL ${player.level}`;

    if (player.depth > 15) {
      this.oxygenRow.style.display = 'flex';
      this.oxygenFill.style.width = HC.utils.clamp(player.oxygen, 0, 100) + '%';
    } else {
      this.oxygenRow.style.display = 'none';
    }

    this.coins.textContent = HC.utils.formatNum(save.coins);
    this.gems.textContent = HC.utils.formatNum(save.gems);

    const missions = missionManager.progressList();
    if (missions.length > 0) {
      const m = missions[0];
      this.missionDesc.textContent = `${m.desc} (${m.progress}/${m.count})`;
      this.missionFill.style.width = (HC.utils.clamp(m.progress / m.count, 0, 1) * 100) + '%';
      this.missionBox.style.display = 'block';
    } else {
      this.missionBox.style.display = 'none';
    }

    this.zoneLabel.textContent = zone.name;

    const abDef = player.abilities.get();
    this.abilityName.textContent = abDef.name;
    this.abilityIcon.style.color = abDef.color;
    let pct;
    if (player.abilities.active) {
      pct = 100 * (1 - player.abilities.durationRemaining / abDef.duration);
      this.abilityRing.style.setProperty('--pct', '100%');
      this.abilityRing.style.opacity = '1';
      this.abilityRing.style.filter = `drop-shadow(0 0 6px ${abDef.color})`;
    } else {
      pct = 100 * (1 - player.abilities.cooldownRemaining / abDef.cooldown);
      this.abilityRing.style.setProperty('--pct', pct + '%');
      this.abilityRing.style.opacity = player.abilities.ready() ? '1' : '0.6';
      this.abilityRing.style.filter = 'none';
    }
  };

  HC.HUD = HUD;
})(window.HC = window.HC || {});
