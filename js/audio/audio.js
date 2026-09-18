/* ==========================================================================
   audio.js — Synthesized sound effects and ambient music via Web Audio API
   No external audio files are used; everything is generated procedurally.
   ========================================================================== */
(function (HC) {
  'use strict';

  function AudioManager() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.muted = false;
    this.musicOn = true;
    this.sfxOn = true;
    this._ambientNodes = [];
    this._started = false;
  }

  AudioManager.prototype.init = function () {
    if (this._started) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.18;
      this.musicGain.connect(this.master);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.master);

      this._started = true;
      this._startAmbient();
    } catch (e) {
      console.warn('Audio unavailable', e);
    }
  };

  AudioManager.prototype.resume = function () {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  };

  AudioManager.prototype.setMuted = function (m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 1;
  };

  AudioManager.prototype.setMusicOn = function (on) {
    this.musicOn = on;
    if (this.musicGain) this.musicGain.gain.value = on ? 0.18 : 0;
  };

  AudioManager.prototype.setSfxOn = function (on) {
    this.sfxOn = on;
  };

  // Generic oscillator-based blip with envelope
  AudioManager.prototype._blip = function (opts) {
    if (!this.ctx || !this.sfxOn) return;
    const { freq = 440, endFreq = null, type = 'sine', duration = 0.15, gain = 0.4, delay = 0 } = opts;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + duration);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  };

  AudioManager.prototype._noiseBurst = function (opts) {
    if (!this.ctx || !this.sfxOn) return;
    const { duration = 0.3, gain = 0.3, filterFreq = 1200, delay = 0 } = opts;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfxGain);
    src.start(this.ctx.currentTime + delay);
  };

  AudioManager.prototype.play = function (name) {
    if (!this.ctx) return;
    switch (name) {
      case 'swim': this._blip({ freq: 180, endFreq: 90, type: 'sine', duration: 0.18, gain: 0.08 }); break;
      case 'bite': this._noiseBurst({ duration: 0.12, gain: 0.5, filterFreq: 900 }); this._blip({ freq: 140, endFreq: 60, type: 'square', duration: 0.1, gain: 0.2 }); break;
      case 'eat': this._blip({ freq: 520, endFreq: 780, type: 'triangle', duration: 0.14, gain: 0.25 }); break;
      case 'coin': this._blip({ freq: 880, endFreq: 1200, type: 'sine', duration: 0.12, gain: 0.2 }); this._blip({ freq: 1200, type: 'sine', duration: 0.1, gain: 0.15, delay: 0.06 }); break;
      case 'treasure': this._blip({ freq: 500, endFreq: 1500, type: 'sine', duration: 0.4, gain: 0.25 }); break;
      case 'boost': this._noiseBurst({ duration: 0.4, gain: 0.25, filterFreq: 2200 }); break;
      case 'damage': this._noiseBurst({ duration: 0.2, gain: 0.4, filterFreq: 500 }); this._blip({ freq: 200, endFreq: 80, type: 'sawtooth', duration: 0.2, gain: 0.2 }); break;
      case 'levelup': [0, 0.12, 0.24].forEach((d, i) => this._blip({ freq: 440 + i * 220, type: 'triangle', duration: 0.2, gain: 0.25, delay: d })); break;
      case 'menu': this._blip({ freq: 300, endFreq: 500, type: 'sine', duration: 0.08, gain: 0.15 }); break;
      case 'gameover': this._blip({ freq: 300, endFreq: 80, type: 'sawtooth', duration: 0.8, gain: 0.25 }); break;
      case 'splash': this._noiseBurst({ duration: 0.25, gain: 0.3, filterFreq: 1800 }); break;
      case 'ability': this._blip({ freq: 600, endFreq: 1100, type: 'square', duration: 0.3, gain: 0.2 }); break;
      case 'mission': this._blip({ freq: 660, type: 'triangle', duration: 0.15, gain: 0.2 }); this._blip({ freq: 880, type: 'triangle', duration: 0.15, gain: 0.2, delay: 0.1 }); break;
    }
  };

  // Ambient river drone made of layered slow oscillators
  AudioManager.prototype._startAmbient = function () {
    if (!this.ctx) return;
    const freqs = [55, 82.5, 110];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.value = 0.0;
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.02;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      g.gain.value = 0.015;
      osc.connect(g);
      g.connect(this.musicGain);
      osc.start();
      lfo.start();
      this._ambientNodes.push(osc, lfo);
    });
  };

  HC.AudioManager = AudioManager;
})(window.HC = window.HC || {});
