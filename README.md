# ⚡ NEURAL SIEGE
### *Cyberpunk Tower Defense — Advanced Frontend Game*

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

**A production-grade, single-file tower defense game with levels, upgrades, boss waves, and a cinematic cyberpunk HUD — built with zero dependencies beyond Bootstrap 5.**

</div>

---

## 📖 Story

> *YEAR 2301. The HIVE — a collective AI consciousness — has gone rogue. It sends endless waves of Neural Drones to breach the last human stronghold. You command the city's defense grid. Build towers. Upgrade. Research. Survive.*

---

## 🎮 Live Demo

Open `index.html` directly in your browser — no server needed.

**GitHub Pages:** After pushing to a repo, enable GitHub Pages under *Settings → Pages → Deploy from branch* and the game runs instantly at `https://<you>.github.io/<repo>/`

---

## ✨ Features

### 🗺️ 4 Unlockable Levels (Sectors)
| Sector | Difficulty | Waves | Description |
|--------|-----------|-------|-------------|
| ALPHA  | Easy      | 8     | Training grounds. Learn the basics |
| BETA   | Medium    | 10    | Armored units & shields appear |
| GAMMA  | Hard      | 12    | Fast swarmers + regenerating hulks |
| OMEGA  | Extreme   | 15    | Multiple bosses. No mercy |

- **Star rating system** (★★★) — score-based, saved to `localStorage`
- Levels lock/unlock progressively

### 🏰 6 Tower Types
| Tower | Specialty | Key Stat |
|-------|-----------|---------|
| LASER NODE | Fast single-target | High fire rate |
| PLASMA CANNON | Explosive splash | AoE damage |
| CRYO MATRIX | Area slow | 45% speed reduction |
| VOID SNIPER | Extreme range, pierce | 7-cell range |
| TESLA ARC | Chain lightning | Hits 3-7 targets |
| NUKE SILO | Mega explosion | 300 base damage |

- **4 upgrade levels** per tower — cost scales with level
- **Sell system** — recover 60% of investment
- **Research tree** — 4 global upgrades (overclk, optics, salvage, shield)

### 👾 7 Enemy Types
- Nano Drone, Speed Runner, Armor Hulk, Ghost Unit (cloaking), Regen Core, Swarm Unit, Boss types
- Attributes: armor, regeneration, speed, cloaking
- **Boss waves** every 4 waves — massive HP pools

### 🎯 Game Systems
- **Real-time game loop** with `requestAnimationFrame` + delta time
- **Grid-based placement** with collision detection
- **Path generation** — unique winding path per level
- **1× / 2× / 3× speed control**
- **Player level system** — XP from kills, level-up bonuses
- **Particle system** — explosions, chain lightning, impact effects
- **Screen flash** — visual feedback on base damage
- **Floating damage numbers**
- **Boss HP bar** with real-time tracking

---

## 🏗️ Architecture

```
neural-siege/
└── index.html          ← Entire game (single file)
    ├── CSS Design System
    │   ├── Bootstrap 5 (grid utilities)
    │   ├── CSS Custom Properties (theme tokens)
    │   └── Cyberpunk HUD styling
    ├── Game Engine
    │   ├── Level system + path generation
    │   ├── Wave builder (dynamic wave composition)
    │   ├── Tower AI (target selection, upgrade tree)
    │   ├── Enemy AI (path following, armor, regen)
    │   ├── Bullet physics + splash detection
    │   ├── Particle system
    │   └── Research tree
    └── UI / Screens
        ├── Title screen with story
        ├── Level select (4 sectors)
        ├── In-game HUD (Bootstrap grid layout)
        ├── Game over / Victory screens
        └── localStorage progress saving
```

---

## 🎨 Tech Stack & Design

| Layer | Technology | Why |
|-------|-----------|-----|
| Layout | Bootstrap 5 | 3-column HUD grid, responsive |
| Fonts | Google Fonts — Exo 2 + Rajdhani + Share Tech Mono | Cyberpunk aesthetic |
| Rendering | HTML5 Canvas 2D | Game loop, particles, enemies |
| Styling | CSS Custom Properties | Theme consistency |
| State | Vanilla JS | No framework needed |
| Persistence | localStorage | Level progress + stars |

---

## 🎮 Controls

| Action | Control |
|--------|---------|
| Select tower | Click tower card (left panel) |
| Place tower | Click valid grid cell on map |
| Select placed tower | Click placed tower |
| Upgrade tower | Click UPGRADE in right panel |
| Sell tower | Click SELL in right panel |
| Cancel selection | Right-click |
| Start wave | Click ▶ START WAVE |
| Change speed | 1× / 2× / 3× buttons |
| Research | Click research items (right panel) |

---

## 🚀 How to Deploy

### GitHub Pages (Recommended)
```bash
# 1. Create repo on GitHub
# 2. Upload index.html
# 3. Settings → Pages → Branch: main, Folder: / (root)
# 4. Live at https://username.github.io/repo-name/
```

### Local
```bash
# Just open the file
open index.html   # macOS
start index.html  # Windows
```

### Any Static Host
Upload `index.html` to Netlify, Vercel, Cloudflare Pages — works instantly.

---

## 🧠 What This Demonstrates (for Developers)

This project showcases senior-level frontend engineering patterns:

- **Game loop architecture** — `requestAnimationFrame` with proper delta-time, variable speed multiplier
- **Entity-component pattern** — towers, enemies, bullets, particles all follow consistent object structures
- **Spatial collision** — circle-circle and circle-grid detection
- **Path interpolation** — enemies smoothly follow waypoint paths using parametric `t` values
- **DOM/Canvas hybrid** — overlay HUD in HTML, game world in Canvas
- **Data-driven design** — all levels, towers, enemies defined as config objects (easy to extend)
- **Procedural generation** — unique paths per level, dynamic wave scaling
- **State machine** — `prep → playing → over/win` with clean transitions
- **CSS design system** — consistent tokens, clip-path shapes, glow effects
- **Progressive unlock system** — localStorage-backed with star ratings

---

## 📊 Performance

- **Target:** 60 FPS at all speeds
- **Particles:** Object pool with splice-on-death
- **Canvas:** Full clear + redraw per frame (standard for this scale)
- **DOM updates:** Throttled HUD updates (only on state change)

---

## 🔮 Roadmap (Potential Extensions)

- [ ] Mobile touch support
- [ ] More enemy types (flying, splitting)
- [ ] Tower ability system (active skills)
- [ ] Endless mode after level 4
- [ ] Online leaderboard (Supabase/Firebase)
- [ ] Sound effects (Web Audio API)
- [ ] Animated intro cutscene

---

## 📝 License

MIT — free to use, modify, and deploy.

---

<div align="center">
<strong>Built with pure HTML/CSS/JS + Bootstrap 5 · Zero build step · Single file deployment</strong>
</div>
