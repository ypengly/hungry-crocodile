# 🐊 Hungry Crocodile

An open-world river survival game built with plain HTML5, CSS3 and vanilla JavaScript. Hunt prey, grow from a hatchling into an ancient apex predator, collect treasure, complete missions and unlock new crocodiles — all running entirely in the browser with no build step, no frameworks and no backend.

---

## Overview

You play a crocodile in a large, living river ecosystem. The world spans six distinct zones that get progressively more dangerous as you travel east. Everything is rendered procedurally on an HTML5 Canvas — there are no image or audio asset files to download, which keeps the whole game tiny and instantly deployable as static files.

The core loop:

```text
Explore → Hunt → Eat → Gain XP → Grow → Earn Coins →
Upgrade → Explore deeper → Fight stronger creatures →
Complete missions → Unlock new crocodiles
```

---

## Features

- Large scrolling world (8000 × 4500) with a smooth follow camera
- Six hand-tuned zones with their own water colors, creatures and danger levels
- Six playable crocodiles, each with unique stats and a special ability
- Living AI ecosystem: fish school and scatter, birds flee, predators patrol/chase/retreat
- Size-based food chain — you cannot eat everything immediately
- 50-level size progression that visibly scales your crocodile
- Diving with an oxygen meter
- Dynamic weather (clear, rain, heavy rain, fog, storm) and a full day/night cycle
- Treasure in four rarities, missions, achievements and persistent statistics
- Shop with crocodiles, stat upgrades, ability info and cosmetic skins
- Procedurally synthesized audio via the Web Audio API (no audio files)
- LocalStorage save system with a safe in-memory fallback
- Full desktop and mobile support, including a virtual joystick

---

## Gameplay

Start in the **Shallow River**, where small fish, frogs and ducks are easy prey. Eating grants XP and coins. As your level rises your crocodile physically grows, gaining health, bite damage and a little speed — which unlocks larger prey and lets you survive tougher zones.

Travel east and the river turns hostile. Rival crocodiles, patrol boats and ancient predators will chase you if you are small enough to be worth attacking. When something far larger is nearby you'll see a **⚠️ TOO DANGEROUS** warning — treat it as a cue to leave.

Health regenerates only through eating, so staying fed is staying alive. Diving reveals deeper areas and treasure but drains oxygen; surface before it runs out or you start taking damage.

---

## Controls

### Desktop

| Key | Action |
| --- | --- |
| `W` / `↑` | Swim forward |
| `S` / `↓` | Dive |
| `A` / `←` | Turn left |
| `D` / `→` | Turn right |
| `SPACE` | Boost |
| `E` | Bite / attack |
| `Q` or `Shift` | Special ability |
| `P` | Pause / resume |
| `M` | Mute sound effects |
| `R` | Restart run |

### Mobile

A virtual joystick sits on the left (push up to swim, down to dive, left/right to turn). On the right are three buttons: **POWER** (special ability), **BOOST** and **BITE**. Page scrolling and rubber-banding are suppressed while a run is active.

---

## Crocodile System

| Crocodile | Cost | Profile | Ability |
| --- | --- | --- | --- |
| Swamp Croc | Free | Balanced all-rounder | Bite Frenzy |
| River Croc | 800 | Fast, fragile | River Dash |
| Armored Croc | 1,800 | Tanky, slower | Thick Hide |
| Hunter Croc | 3,200 | High bite damage | Mega Bite |
| Black Croc | 6,000 | Fast and stealthy | Ambush |
| Ancient Croc | 15,000 | Legendary end-game | Whirlpool |

Every ability has a cooldown, a duration, a visual effect, a sound and a HUD ring indicator.

- **Bite Frenzy** — attack speed increase
- **River Dash** — extreme forward burst
- **Thick Hide** — reduces incoming damage
- **Mega Bite** — a single devastating strike
- **Ambush** — prey and predators struggle to detect you
- **Whirlpool** — drags nearby small prey toward you

---

## Ecosystem

Creatures run real behavior state machines rather than moving randomly.

- **Fish** — drift in loose schools, flee when you are large enough to threaten them
- **Birds / ducks** — bob near the surface and scatter as you approach
- **Land animals** (boars, deer, monkeys, jungle cats) — wander near the banks and flee when threatened
- **Snakes** — sinuous swimming motion, quick to escape
- **Humans** — fishermen work the docks and panic-run when attacked (cartoon-safe, no graphic content)
- **Boats** — fishing boats, speedboats, cargo ships and dangerous patrol boats
- **Predators** — patrol territory, detect you, chase if they outmatch you, and retreat when badly hurt

---

## World Zones

| # | Zone | Danger | Highlights |
| --- | --- | --- | --- |
| 1 | Shallow River | ★ | Small fish, frogs, ducks, small birds |
| 2 | Marshlands | ★★ | Large fish, turtles, boars, snakes |
| 3 | Jungle River | ★★★ | Monkeys, deer, jungle cats |
| 4 | Fishing Village | ★★★ | Fishermen, docks, boats, treasure |
| 5 | Deep River | ★★★★ | Giant fish, rival crocs, patrol boats |
| 6 | Ancient Swamp | ★★★★★ | Giant snakes, ancient predators, the Giant Catfish boss |

---

## Combat

Bites are range-checked against the nearest entity. Damage scales with level, crocodile type, the Jaw Strength upgrade and any active ability. Creatures far larger than you only take chip damage — you need to grow before they become edible.

Enemies follow a state machine:

```text
IDLE / PATROL → DETECT → CHASE → ATTACK → RETREAT or DEATH
```

Tiny prey are eaten automatically on contact, which keeps the early game fast and satisfying.

---

## Missions

Three missions are active at a time and refill automatically as you complete them. Progress is tracked live in the HUD and persists between sessions. Examples include eating 25 fish, collecting 10 treasure chests, surviving five minutes, destroying five boats, reaching the Ancient Swamp and defeating the Giant Catfish.

---

## Achievements

Six achievements, saved permanently: First Bite, Fisherman's Nightmare, Big Boy (level 10), Apex Predator, Treasure Hunter (25 chests) and River King (max level).

---

## Economy

- 🪙 **Coins** — earned from every kill, treasure chest, level-up and mission
- 💎 **Gems** — a premium counter tracked and displayed in the HUD and shop
- 📦 **Treasure** — common, rare, epic and legendary chests scattered across the map

Spend coins in the shop on new crocodiles, stat upgrades (Vitality, Swiftness, Jaw Strength) and cosmetic skins. Purchases are blocked with a clear message when you can't afford them.

---

## Save System

Progress is written to LocalStorage under the key `hungry_crocodile_save_v1` after every meaningful event. Saved data includes level, XP, coins, gems, unlocked and equipped crocodiles, upgrades, skins, missions, achievements, lifetime statistics and settings.

If LocalStorage is unavailable (private browsing, blocked cookies, `file://` restrictions in some browsers) the game detects it at startup, logs a warning and transparently falls back to in-memory storage so play is never interrupted. Saves are merged against defaults on load, so older saves keep working after updates.

**Reset Progress** lives in Settings and asks for confirmation.

---

## Technology

- HTML5 + CSS3
- Vanilla JavaScript (ES5-compatible syntax, no modules, no transpiler)
- HTML5 Canvas 2D for all rendering
- Web Audio API for fully synthesized sound
- LocalStorage for persistence

No frameworks, no game engine, no bundler, no backend, no external assets.

---

## Project Structure

```text
hungry-crocodile/
├── index.html
├── README.md
├── LICENSE
├── .gitignore
├── css/
│   ├── style.css          Base layout, menus, buttons
│   ├── game.css           HUD, joystick, banners
│   └── responsive.css     Mobile/tablet/landscape adaptations
├── js/
│   ├── main.js            Bootstrap
│   ├── game.js            Core Game class, loop, combat, rendering
│   ├── config.js          All tunable game data
│   ├── player/            crocodile.js, crocodileTypes.js, abilities.js
│   ├── world/             world.js, river.js, zones.js, camera.js, environment.js
│   ├── entities/          fish, birds, animals, predators, boats, humans
│   ├── systems/           ai, collision, spawning, particles, progression, missions, saveSystem
│   ├── ui/                hud, menus, shop, notifications
│   ├── audio/             audio.js
│   └── input/             input.js
├── assets/
│   ├── images/            (empty — all art is procedural)
│   └── audio/             (empty — all audio is synthesized)
└── screenshots/
```

---

## Installation

No installation or build step is required. Download or clone the repository:

```bash
git clone https://github.com/your-username/hungry-crocodile.git
cd hungry-crocodile
```

---

## Running Locally

Because the game loads several `.js` files, some browsers restrict `file://` access. Opening `index.html` directly usually works, but serving it over HTTP is the reliable option.

**Python 3** (already installed on most systems):

```bash
python3 -m http.server 8000
```

**Node.js:**

```bash
npx serve .
```

**VS Code:** install the *Live Server* extension, right-click `index.html`, choose *Open with Live Server*.

Then open <http://localhost:8000> and click **Tap to start 🐊** to enable audio (browsers require a user gesture before sound can play).

---

## Deployment

The game is a fully static site — upload the folder as-is.

### GitHub Pages

1. Push the project to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under *Source*, choose the `main` branch and the `/ (root)` folder.
4. Save. Your game will be live at `https://your-username.github.io/hungry-crocodile/`.

### Vercel

```bash
npm i -g vercel
vercel
```

Accept the defaults. When asked for a build command, leave it empty; set the output directory to the project root.

### Netlify

Drag the project folder onto <https://app.netlify.com/drop>, or:

```bash
npm i -g netlify-cli
netlify deploy --prod --dir .
```

---

## Mobile Support

The HUD, menus and controls adapt via media queries in `responsive.css`. Touch controls appear automatically on devices matching `(hover: none) and (pointer: coarse)` and are hidden on mouse-driven devices.

- Canvas scales to `devicePixelRatio` (capped at 2) for crisp rendering on high-DPI screens
- Portrait and landscape layouts both supported, with a compact HUD in short landscape viewports
- Page scrolling and pull-to-refresh are blocked during gameplay
- Buttons are sized for comfortable thumb reach

---

## Performance

- `requestAnimationFrame` with delta-time movement, clamped to 50 ms to survive tab switches
- Particles use a fixed pool of 400 objects — no allocation during play
- Entities are culled beyond 2200 px from the player and capped at 55 active
- Spawning is distance-limited and rate-limited
- Off-screen entities, props, treasures and particles skip drawing entirely
- Entities are depth-sorted only once per frame

The game targets 60 FPS and remains playable on lower-end hardware. Dropping **Quality** to Low in Settings, or turning particles off, reclaims additional headroom.

---

## Customization

Nearly all tuning lives in `js/config.js`:

| What to change | Where |
| --- | --- |
| World size | `WORLD_WIDTH`, `WORLD_HEIGHT` |
| Level pacing | `XP_BASE`, `XP_EXP`, `MAX_LEVEL` |
| Crocodile sizes per tier | `LEVEL_TITLES` |
| Zones, colors, spawn tables | `ZONES` |
| Crocodile stats and abilities | `CROCODILE_TYPES`, `ABILITIES` |
| Creature stats | `PREY`, `PREDATORS` |
| Missions and achievements | `MISSIONS_POOL`, `ACHIEVEMENTS` |
| Oxygen and diving | `OXYGEN_*`, `DIVE_DEPTH_MAX` |

Adding a new creature takes three steps: add a stat block to `PREY`, register a factory and a draw function in the relevant `js/entities/*.js` file, then list its id in a zone's `spawns` array.

---

## Configuration

Runtime options are in Settings and persist automatically:

| Setting | Effect |
| --- | --- |
| Sound | Toggles sound effects |
| Music | Toggles the ambient river drone |
| Particles | Disables the particle system entirely |
| Screen Shake | Removes camera shake on impacts |
| Quality | Low / Medium / High rendering profile |

---

## Troubleshooting

**No sound.** Browsers block audio until you interact with the page — click the *Tap to start* overlay. Also check Sound/Music in Settings and that `M` hasn't muted effects.

**Progress isn't saving.** LocalStorage may be blocked by private browsing or cookie settings. The game falls back to memory and logs a warning to the console; progress will then last only for the session.

**Blank screen or scripts not loading.** Serve the folder over HTTP rather than opening `index.html` from the filesystem. Check the browser console for the failing path.

**Touch controls missing on a touchscreen laptop.** Controls key off `(hover: none) and (pointer: coarse)`. Hybrid devices reporting a fine pointer will show the desktop scheme; keyboard controls still work.

**Low frame rate.** Turn particles off, set Quality to Low, and close other heavy tabs.

**Fonts look generic offline.** The stylesheet pulls Baloo 2 and Nunito from Google Fonts; without a connection the browser falls back to system sans-serif. Gameplay is unaffected.

---

## Future Improvements

- Additional boss encounters per zone
- Persistent world treasure locations rather than proximity spawning
- Pack AI so predators coordinate
- Underwater cave interiors as separate sub-areas
- Gem-based premium purchases and daily challenges
- Gamepad support
- Replay/highlight capture

---

## License

Released under the MIT License. See [LICENSE](LICENSE).

All artwork, animation and audio are generated procedurally in code and are original to this project. No assets, characters, logos or sounds from any commercial game are used.
