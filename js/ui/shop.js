/* ==========================================================================
   shop.js — Shop tabs: crocodiles, upgrades, abilities, skins
   ========================================================================== */
(function (HC) {
  'use strict';

  const UPGRADE_DEFS = [
    { id: 'health', name: 'Vitality', desc: 'Increases maximum health.', baseCost: 200, growth: 1.4, icon: '❤️' },
    { id: 'speed', name: 'Swiftness', desc: 'Increases swim speed.', baseCost: 200, growth: 1.4, icon: '💨' },
    { id: 'damage', name: 'Jaw Strength', desc: 'Increases bite damage.', baseCost: 200, growth: 1.4, icon: '🦷' }
  ];

  const SKIN_DEFS = [
    { id: 'default', name: 'Classic', cost: 0, colorOverride: null },
    { id: 'sunset', name: 'Sunset Scales', cost: 500, colorOverride: '#d97a3a' },
    { id: 'toxic', name: 'Toxic Bloom', cost: 900, colorOverride: '#7fd13a' },
    { id: 'royal', name: 'Royal Gold', cost: 2200, colorOverride: '#e0b83a' }
  ];

  function upgradeCost(level) {
    const def = level;
    return Math.round(200 * Math.pow(1.4, def));
  }

  const ShopUI = {
    UPGRADE_DEFS, SKIN_DEFS,

    renderCrocodiles(container, save, game) {
      container.innerHTML = '';
      HC.CrocTypes.all().forEach((t) => {
        const unlocked = save.unlockedCrocs.includes(t.id);
        const equipped = save.equippedCroc === t.id;
        const card = document.createElement('div');
        card.className = 'item-card' + (unlocked ? '' : ' locked') + (equipped ? ' equipped' : '');
        card.innerHTML = `
          <div class="croc-swatch" style="background:${t.color}"></div>
          <h4>${t.name}</h4>
          <p>${t.desc}</p>
          <div class="stat-line"><span>Speed</span><span>${'★'.repeat(Math.round(t.speed * 3))}</span></div>
          <div class="stat-line"><span>Health</span><span>${'★'.repeat(Math.round(t.health * 3))}</span></div>
          <div class="stat-line"><span>Damage</span><span>${'★'.repeat(Math.round(t.damage * 3))}</span></div>
          <div class="stat-line"><span>Ability</span><span>${HC.CONFIG.ABILITIES[t.ability].name}</span></div>
        `;
        const btn = document.createElement('button');
        btn.className = 'btn ' + (equipped ? 'btn-secondary' : 'btn-primary');
        btn.textContent = equipped ? 'Equipped' : unlocked ? 'Equip' : `Unlock 🪙 ${t.cost}`;
        btn.disabled = equipped;
        btn.addEventListener('click', () => {
          if (unlocked) {
            save.equippedCroc = t.id;
            game.onEquipCroc(t.id);
          } else if (save.coins >= t.cost) {
            save.coins -= t.cost;
            save.unlockedCrocs.push(t.id);
            save.equippedCroc = t.id;
            game.onEquipCroc(t.id);
            game.persist();
          } else {
            game.notifications.toast("Not enough coins!");
            return;
          }
          game.persist();
          ShopUI.renderCrocodiles(container, save, game);
          game.refreshMenuStats();
        });
        card.appendChild(btn);
        container.appendChild(card);
      });
    },

    renderUpgrades(container, save, game) {
      container.innerHTML = '';
      UPGRADE_DEFS.forEach((u) => {
        const level = save.upgrades[u.id] || 0;
        const cost = upgradeCost(level);
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <h4>${u.icon} ${u.name} (Lv ${level})</h4>
          <p>${u.desc}</p>
          <div class="stat-line"><span>Next Cost</span><span>🪙 ${cost}</span></div>
        `;
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = `Upgrade 🪙 ${cost}`;
        btn.addEventListener('click', () => {
          if (save.coins >= cost) {
            save.coins -= cost;
            save.upgrades[u.id] = level + 1;
            game.onUpgradeChanged();
            game.persist();
            ShopUI.renderUpgrades(container, save, game);
            game.refreshMenuStats();
          } else {
            game.notifications.toast('Not enough coins!');
          }
        });
        card.appendChild(btn);
        container.appendChild(card);
      });
    },

    renderAbilities(container, save, game) {
      container.innerHTML = '';
      Object.keys(HC.CONFIG.ABILITIES).forEach((key) => {
        const ab = HC.CONFIG.ABILITIES[key];
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <h4 style="color:${ab.color}">${ab.name}</h4>
          <p>${ab.desc}</p>
          <div class="stat-line"><span>Cooldown</span><span>${ab.cooldown}s</span></div>
          <div class="stat-line"><span>Duration</span><span>${ab.duration}s</span></div>
          <div class="stat-line"><span>Unlocked via</span><span>Matching crocodile</span></div>
        `;
        container.appendChild(card);
      });
    },

    renderSkins(container, save, game) {
      container.innerHTML = '';
      SKIN_DEFS.forEach((s) => {
        const owned = s.cost === 0 || (save.skins && save.skins[s.id]);
        const equipped = save.skins && save.skins.equipped === s.id;
        const card = document.createElement('div');
        card.className = 'item-card' + (owned ? '' : ' locked') + (equipped ? ' equipped' : '');
        card.innerHTML = `
          <div class="croc-swatch" style="background:${s.colorOverride || '#4c7a3d'}"></div>
          <h4>${s.name}</h4>
          <p>Cosmetic color skin.</p>
        `;
        const btn = document.createElement('button');
        btn.className = 'btn ' + (equipped ? 'btn-secondary' : 'btn-primary');
        btn.textContent = equipped ? 'Equipped' : owned ? 'Equip' : `Buy 🪙 ${s.cost}`;
        btn.disabled = equipped;
        btn.addEventListener('click', () => {
          save.skins = save.skins || {};
          if (owned) {
            save.skins.equipped = s.id;
          } else if (save.coins >= s.cost) {
            save.coins -= s.cost;
            save.skins[s.id] = true;
            save.skins.equipped = s.id;
          } else {
            game.notifications.toast('Not enough coins!');
            return;
          }
          game.persist();
          ShopUI.renderSkins(container, save, game);
          game.refreshMenuStats();
        });
        card.appendChild(btn);
        container.appendChild(card);
      });
    },

    upgradeCost
  };

  HC.ShopUI = ShopUI;
})(window.HC = window.HC || {});
