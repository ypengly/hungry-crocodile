/* ==========================================================================
   notifications.js — Toast popups and full-screen banners (level up, zone, danger)
   ========================================================================== */
(function (HC) {
  'use strict';

  function NotificationUI() {
    this.container = document.getElementById('notifications');
    this.levelBanner = document.getElementById('level-up-banner');
    this.zoneBanner = document.getElementById('zone-banner');
    this.dangerBanner = document.getElementById('danger-banner');
    this._dangerTimeout = null;
    this._zoneTimeout = null;
    this._levelTimeout = null;
  }

  NotificationUI.prototype.toast = function (text) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    this.container.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  };

  NotificationUI.prototype.levelUp = function (level, title) {
    this.levelBanner.textContent = `LEVEL ${level}! ${title}`;
    this._pulse(this.levelBanner, '_levelTimeout');
  };

  NotificationUI.prototype.zoneEnter = function (name) {
    this.zoneBanner.textContent = name;
    this._pulse(this.zoneBanner, '_zoneTimeout');
  };

  NotificationUI.prototype.danger = function () {
    this._pulse(this.dangerBanner, '_dangerTimeout');
  };

  NotificationUI.prototype._pulse = function (el, timeoutKey) {
    el.classList.remove('show');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('show');
    if (this[timeoutKey]) clearTimeout(this[timeoutKey]);
    this[timeoutKey] = setTimeout(() => el.classList.remove('show'), 1600);
  };

  HC.NotificationUI = NotificationUI;
})(window.HC = window.HC || {});
