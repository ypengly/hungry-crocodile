/* ==========================================================================
   config.js — Central configuration for Hungry Crocodile
   ========================================================================== */
(function (HC) {
  'use strict';

  HC.CONFIG = {
    WORLD_WIDTH: 8000,
    WORLD_HEIGHT: 4500,

    STORAGE_KEY: 'hungry_crocodile_save_v1',

    TARGET_FPS: 60,

    CAMERA_SMOOTH: 0.09,
    CAMERA_SHAKE_DECAY: 0.90,

    OXYGEN_MAX: 100,
    OXYGEN_DRAIN_PER_SEC: 4.2,
    OXYGEN_RECOVER_PER_SEC: 18,
    DIVE_DEPTH_MAX: 260,

    // XP required to reach level n = BASE * n^EXP
    XP_BASE: 22,
    XP_EXP: 1.28,
    MAX_LEVEL: 50,

    LEVEL_TITLES: [
      { level: 1, title: 'Hatchling Crocodile', scale: 0.55 },
      { level: 5, title: 'Young Crocodile', scale: 0.72 },
      { level: 10, title: 'Adult Crocodile', scale: 0.92 },
      { level: 20, title: 'Large Crocodile', scale: 1.18 },
      { level: 30, title: 'Giant Crocodile', scale: 1.45 },
      { level: 40, title: 'Apex Crocodile', scale: 1.7 },
      { level: 50, title: 'Ancient Crocodile', scale: 2.0 }
    ],

    ZONES: [
      {
        id: 'shallows', name: 'Shallow River', danger: 1,
        bounds: { x0: 0, x1: 1500, y0: 0, y1: 4500 },
        water: '#3aa7c4', deep: '#217b96',
        spawns: ['smallFish', 'frog', 'duck', 'smallBird']
      },
      {
        id: 'marsh', name: 'Marshlands', danger: 2,
        bounds: { x0: 1500, x1: 3000, y0: 0, y1: 4500 },
        water: '#3f9a72', deep: '#215d47',
        spawns: ['largeFish', 'turtle', 'boar', 'snake']
      },
      {
        id: 'jungle', name: 'Jungle River', danger: 3,
        bounds: { x0: 3000, x1: 4600, y0: 0, y1: 4500 },
        water: '#2f8f6a', deep: '#17513c',
        spawns: ['monkey', 'deer', 'largeFish', 'jungleCat']
      },
      {
        id: 'village', name: 'Fishing Village', danger: 3,
        bounds: { x0: 4600, x1: 6000, y0: 0, y1: 4500 },
        water: '#3a8fae', deep: '#1e5468',
        spawns: ['fisherman', 'smallBoat', 'speedBoat', 'largeFish']
      },
      {
        id: 'deep', name: 'Deep River', danger: 4,
        bounds: { x0: 6000, x1: 7200, y0: 0, y1: 4500 },
        water: '#1c5f86', deep: '#0c334b',
        spawns: ['giantFish', 'rivalCroc', 'cargoBoat', 'patrolBoat']
      },
      {
        id: 'ancient', name: 'Ancient Swamp', danger: 5,
        bounds: { x0: 7200, x1: 8000, y0: 0, y1: 4500 },
        water: '#3a2f52', deep: '#1c1730',
        spawns: ['giantSnake', 'ancientPredator', 'giantCatfishBoss']
      }
    ],

    CROCODILE_TYPES: [
      {
        id: 'swamp', name: 'Swamp Croc', cost: 0,
        color: '#4c7a3d', darkColor: '#33531f',
        speed: 1.0, health: 1.0, damage: 1.0, boost: 1.0,
        ability: 'biteFrenzy',
        desc: 'A balanced hunter, at home anywhere in the river.'
      },
      {
        id: 'river', name: 'River Croc', cost: 800,
        color: '#3f6f8c', darkColor: '#274a5e',
        speed: 1.25, health: 0.9, damage: 0.95, boost: 1.2,
        ability: 'riverDash',
        desc: 'Built for speed, weak in a prolonged fight.'
      },
      {
        id: 'armored', name: 'Armored Croc', cost: 1800,
        color: '#6b6b53', darkColor: '#454531',
        speed: 0.85, health: 1.45, damage: 1.0, boost: 0.9,
        ability: 'thickHide',
        desc: 'Thick plating lets it shrug off punishing attacks.'
      },
      {
        id: 'hunter', name: 'Hunter Croc', cost: 3200,
        color: '#8a4b30', darkColor: '#5c2f1c',
        speed: 1.05, health: 1.0, damage: 1.35, boost: 1.0,
        ability: 'megaBite',
        desc: 'Powerful jaws built to bring down big prey.'
      },
      {
        id: 'black', name: 'Black Croc', cost: 6000,
        color: '#2b2b30', darkColor: '#141416',
        speed: 1.2, health: 1.05, damage: 1.1, boost: 1.15,
        ability: 'ambush',
        desc: 'A shadow in the water — hard to detect until too late.'
      },
      {
        id: 'ancient', name: 'Ancient Croc', cost: 15000,
        color: '#caa23a', darkColor: '#8a6c1f',
        speed: 1.15, health: 1.6, damage: 1.5, boost: 1.2,
        ability: 'whirlpool',
        desc: 'A legendary apex predator feared across the river.'
      }
    ],

    ABILITIES: {
      biteFrenzy: { name: 'Bite Frenzy', cooldown: 18, duration: 5, color: '#ff5252', desc: 'Temporary attack speed increase.' },
      riverDash: { name: 'River Dash', cooldown: 12, duration: 2, color: '#42c8ff', desc: 'Extremely fast forward burst.' },
      thickHide: { name: 'Thick Hide', cooldown: 22, duration: 6, color: '#9ccf6b', desc: 'Reduces incoming damage temporarily.' },
      whirlpool: { name: 'Whirlpool', cooldown: 25, duration: 4, color: '#4fd1c5', desc: 'Pulls in nearby small prey.' },
      ambush: { name: 'Ambush', cooldown: 20, duration: 6, color: '#8e6bd6', desc: 'Harder for prey/enemies to detect you.' },
      megaBite: { name: 'Mega Bite', cooldown: 16, duration: 0.4, color: '#ff9142', desc: 'A devastating single strike.' }
    },

    PREY: {
      smallFish:  { size: 10, health: 5,  xp: 7,  coins: 1,  speed: 60,  minLevel: 0, tier: 'tiny',   color: '#d7e75b', kind: 'fish' },
      frog:       { size: 11, health: 6,  xp: 8,  coins: 1,  speed: 45,  minLevel: 0, tier: 'tiny',   color: '#6bcf5a', kind: 'animal' },
      duck:       { size: 14, health: 8,  xp: 11,  coins: 2,  speed: 55,  minLevel: 0, tier: 'small',  color: '#e8d24a', kind: 'bird' },
      smallBird:  { size: 12, health: 6,  xp: 10,  coins: 2,  speed: 90,  minLevel: 0, tier: 'small',  color: '#e8e8e8', kind: 'bird' },
      largeFish:  { size: 20, health: 18, xp: 20, coins: 4,  speed: 70,  minLevel: 3, tier: 'small',  color: '#4f9fd6', kind: 'fish' },
      turtle:     { size: 18, health: 22, xp: 18, coins: 3,  speed: 30,  minLevel: 3, tier: 'small',  color: '#4c8a52', kind: 'animal' },
      boar:       { size: 22, health: 30, xp: 20, coins: 6,  speed: 65,  minLevel: 5, tier: 'medium', color: '#7a5230', kind: 'animal' },
      snake:      { size: 16, health: 20, xp: 16, coins: 5,  speed: 75,  minLevel: 4, tier: 'small',  color: '#4f7a2a', kind: 'animal' },
      monkey:     { size: 17, health: 22, xp: 18, coins: 6,  speed: 85,  minLevel: 6, tier: 'medium', color: '#8a6244', kind: 'animal' },
      deer:       { size: 24, health: 34, xp: 26, coins: 8,  speed: 95,  minLevel: 7, tier: 'medium', color: '#b98a52', kind: 'animal' },
      jungleCat:  { size: 21, health: 32, xp: 28, coins: 8,  speed: 100, minLevel: 8, tier: 'medium', color: '#c9a13a', kind: 'animal' },
      fisherman:  { size: 18, health: 24, xp: 22, coins: 10, speed: 50,  minLevel: 6, tier: 'medium', color: '#d8b98a', kind: 'human' },
      smallBoat:  { size: 34, health: 45, xp: 35, coins: 20, speed: 55,  minLevel: 8, tier: 'large',  color: '#8a5a3a', kind: 'boat' },
      speedBoat:  { size: 30, health: 40, xp: 40, coins: 25, speed: 140, minLevel: 9, tier: 'large',  color: '#c94b3a', kind: 'boat' },
      giantFish:  { size: 40, health: 90, xp: 65, coins: 35, speed: 80,  minLevel: 12, tier: 'large', color: '#3a6ea5', kind: 'fish' },
      cargoBoat:  { size: 55, health: 140, xp: 90, coins: 55, speed: 40, minLevel: 15, tier: 'large', color: '#5a5a4a', kind: 'boat' },
      giantSnake: { size: 36, health: 120, xp: 100, coins: 60, speed: 90, minLevel: 18, tier: 'large', color: '#3a5a1f', kind: 'animal' }
    },

    PREDATORS: {
      rivalCroc:        { size: 32, health: 100, damage: 12, xp: 80, coins: 40, speed: 90,  minLevel: 10, threat: 3, color: '#5a3f2a' },
      patrolBoat:       { size: 46, health: 160, damage: 16, xp: 110, coins: 60, speed: 70, minLevel: 13, threat: 4, color: '#3a4a3a' },
      ancientPredator:  { size: 60, health: 260, damage: 22, xp: 220, coins: 120, speed: 85, minLevel: 22, threat: 5, color: '#2a2035' },
      giantCatfishBoss: { size: 90, health: 500, damage: 30, xp: 500, coins: 400, speed: 60, minLevel: 28, threat: 6, color: '#6b5a3a', boss: true }
    },

    MISSIONS_POOL: [
      { id: 'eat_fish_25', desc: 'Eat 25 fish', type: 'eatKind', target: 'fish', count: 25, reward: { coins: 100 } },
      { id: 'eat_any_50', desc: 'Eat 50 creatures', type: 'eatAny', count: 50, reward: { coins: 200 } },
      { id: 'collect_treasure_10', desc: 'Collect 10 treasure chests', type: 'treasure', count: 10, reward: { coins: 500 } },
      { id: 'survive_5min', desc: 'Survive 5 minutes in one life', type: 'survive', count: 300, reward: { coins: 250 } },
      { id: 'defeat_giant_catfish', desc: 'Defeat the Giant Catfish boss', type: 'defeatBoss', target: 'giantCatfishBoss', count: 1, reward: { coins: 1000 } },
      { id: 'reach_ancient', desc: 'Reach the Ancient Swamp', type: 'reachZone', target: 'ancient', count: 1, reward: { coins: 750 } },
      { id: 'destroy_boats_5', desc: 'Destroy 5 boats', type: 'destroyBoat', count: 5, reward: { coins: 300 } },
      { id: 'level_10', desc: 'Reach Level 10', type: 'level', count: 10, reward: { coins: 400 } }
    ],

    ACHIEVEMENTS: [
      { id: 'first_bite', name: 'First Bite', desc: 'Eat your first fish.', check: s => s.stats.animalsEaten >= 1 },
      { id: 'fishermans_nightmare', name: "Fisherman's Nightmare", desc: 'Attack your first fishing boat.', check: s => s.stats.boatsDestroyed >= 1 },
      { id: 'big_boy', name: 'Big Boy', desc: 'Reach Level 10.', check: s => s.level >= 10 },
      { id: 'apex_predator', name: 'Apex Predator', desc: 'Defeat a large predator.', check: s => s.stats.predatorsDefeated >= 1 },
      { id: 'treasure_hunter', name: 'Treasure Hunter', desc: 'Find 25 treasure chests.', check: s => s.stats.treasuresFound >= 25 },
      { id: 'river_king', name: 'River King', desc: 'Reach maximum crocodile level.', check: s => s.level >= 50 }
    ]
  };

  HC.utils = {
    clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
    lerp(a, b, t) { return a + (b - a) * t; },
    dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); },
    angleLerp(a, b, t) {
      let diff = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      return a + diff * t;
    },
    rand(min, max) { return min + Math.random() * (max - min); },
    randInt(min, max) { return Math.floor(HC.utils.rand(min, max + 1)); },
    choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    formatNum(n) {
      n = Math.floor(n);
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    xpForLevel(level) {
      return Math.round(HC.CONFIG.XP_BASE * Math.pow(level, HC.CONFIG.XP_EXP));
    },
    titleForLevel(level) {
      const titles = HC.CONFIG.LEVEL_TITLES;
      let t = titles[0];
      for (const entry of titles) { if (level >= entry.level) t = entry; }
      return t;
    },
    zoneAt(x) {
      const zones = HC.CONFIG.ZONES;
      for (const z of zones) { if (x >= z.bounds.x0 && x < z.bounds.x1) return z; }
      return zones[zones.length - 1];
    }
  };
})(window.HC = window.HC || {});
