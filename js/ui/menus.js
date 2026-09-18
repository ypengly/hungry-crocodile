/* ==========================================================================
   menus.js — Screen switching and menu button wiring
   ========================================================================== */
(function (HC) {
  'use strict';

  function MenuUI(game) {
    this.game = game;
    this.current = 'menu';
    this.shopTab = 'crocodiles';
    this._bindNavigation();
    this._bindMenuButtons();
    this._bindShopTabs();
    this._bindSettings();
  }

  MenuUI.prototype.show = function (name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.add('active');
    this.current = name;

    if (name === 'crocodiles') HC.ShopUI.renderCrocodiles(document.getElementById('croc-list'), this.game.save, this.game);
    if (name === 'shop') this.renderShopTab(this.shopTab);
    if (name === 'missions') this.renderMissions();
    if (name === 'achievements') this.renderAchievements();
    if (name === 'statistics') this.renderStatistics();
    if (name === 'settings') this.syncSettingsUI();
    if (name === 'menu') this.game.refreshMenuStats();
  };

  MenuUI.prototype._bindNavigation = function () {
    document.querySelectorAll('[data-screen]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.game.audio.play('menu');
        this.show(btn.getAttribute('data-screen'));
      });
    });
  };

  MenuUI.prototype._bindMenuButtons = function () {
    document.getElementById('btn-play').addEventListener('click', () => this.game.startRun());
    document.getElementById('btn-resume').addEventListener('click', () => this.game.resume());
    document.getElementById('btn-quit-to-menu').addEventListener('click', () => this.game.quitToMenu());
    document.getElementById('btn-play-again').addEventListener('click', () => this.game.startRun());
    document.getElementById('btn-gameover-menu').addEventListener('click', () => this.game.quitToMenu());
    document.getElementById('btn-pause').addEventListener('click', () => this.game.pause());
    document.getElementById('btn-reset-progress').addEventListener('click', () => {
      if (confirm('Reset ALL progress? This cannot be undone.')) this.game.resetProgress();
    });
  };

  MenuUI.prototype._bindShopTabs = function () {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.shopTab = btn.getAttribute('data-tab');
        this.renderShopTab(this.shopTab);
      });
    });
  };

  MenuUI.prototype.renderShopTab = function (tab) {
    document.getElementById('shop-coins').textContent = HC.utils.formatNum(this.game.save.coins);
    document.getElementById('shop-gems').textContent = HC.utils.formatNum(this.game.save.gems);
    const content = document.getElementById('shop-content');
    if (tab === 'crocodiles') HC.ShopUI.renderCrocodiles(content, this.game.save, this.game);
    else if (tab === 'upgrades') HC.ShopUI.renderUpgrades(content, this.game.save, this.game);
    else if (tab === 'abilities') HC.ShopUI.renderAbilities(content, this.game.save, this.game);
    else if (tab === 'skins') HC.ShopUI.renderSkins(content, this.game.save, this.game);
  };

  MenuUI.prototype.renderMissions = function () {
    const list = document.getElementById('missions-list');
    list.innerHTML = '';
    const missions = this.game.missionManager.progressList();
    if (missions.length === 0) {
      list.innerHTML = '<p>All caught up — new missions appear as you complete them in-game!</p>';
      return;
    }
    missions.forEach((m) => {
      const div = document.createElement('div');
      div.className = 'list-item';
      const pct = HC.utils.clamp(m.progress / m.count, 0, 1) * 100;
      div.innerHTML = `<h4>${m.desc}</h4><p>Progress: ${m.progress}/${m.count}</p>
        <div class="bar-track"><div class="bar-fill mission-fill" style="width:${pct}%"></div></div>`;
      list.appendChild(div);
    });
  };

  MenuUI.prototype.renderAchievements = function () {
    const list = document.getElementById('achievements-list');
    list.innerHTML = '';
    HC.CONFIG.ACHIEVEMENTS.forEach((ach) => {
      const done = this.game.save.achievements.includes(ach.id);
      const div = document.createElement('div');
      div.className = 'list-item' + (done ? ' done' : '');
      div.innerHTML = `<h4>${done ? '✅' : '🔒'} ${ach.name}</h4><p>${ach.desc}</p>`;
      list.appendChild(div);
    });
  };

  MenuUI.prototype.renderStatistics = function () {
    const list = document.getElementById('stats-list');
    const s = this.game.save.stats;
    const rows = [
      ['Best Level', this.game.save.bestLevel],
      ['Total Coins Earned', HC.utils.formatNum(s.totalCoinsEarned || 0)],
      ['Animals Eaten', HC.utils.formatNum(s.animalsEaten)],
      ['Boats Destroyed', HC.utils.formatNum(s.boatsDestroyed)],
      ['Predators Defeated', HC.utils.formatNum(s.predatorsDefeated)],
      ['Treasures Found', HC.utils.formatNum(s.treasuresFound)],
      ['Distance Traveled', HC.utils.formatNum(s.distanceTraveled) + ' m'],
      ['Total Survival Time', Math.round(s.survivalTime) + ' s']
    ];
    list.innerHTML = rows.map(([label, val]) => `
      <div class="list-item"><h4>${label}</h4><p>${val}</p></div>
    `).join('');
  };

  MenuUI.prototype.syncSettingsUI = function () {
    const st = this.game.save.settings;
    document.getElementById('opt-sound').checked = st.sound;
    document.getElementById('opt-music').checked = st.music;
    document.getElementById('opt-particles').checked = st.particles;
    document.getElementById('opt-shake').checked = st.screenShake;
    document.getElementById('opt-quality').value = st.quality;
  };

  MenuUI.prototype._bindSettings = function () {
    const g = this.game;
    document.getElementById('opt-sound').addEventListener('change', (e) => {
      g.save.settings.sound = e.target.checked;
      g.audio.setMuted(!e.target.checked && !g.save.settings.music);
      g.audio.setSfxOn(e.target.checked);
      g.persist();
    });
    document.getElementById('opt-music').addEventListener('change', (e) => {
      g.save.settings.music = e.target.checked;
      g.audio.setMusicOn(e.target.checked);
      g.persist();
    });
    document.getElementById('opt-particles').addEventListener('change', (e) => {
      g.save.settings.particles = e.target.checked;
      g.particles.enabled = e.target.checked;
      g.persist();
    });
    document.getElementById('opt-shake').addEventListener('change', (e) => {
      g.save.settings.screenShake = e.target.checked;
      g.persist();
    });
    document.getElementById('opt-quality').addEventListener('change', (e) => {
      g.save.settings.quality = e.target.value;
      g.persist();
    });
  };

  HC.MenuUI = MenuUI;
})(window.HC = window.HC || {});
