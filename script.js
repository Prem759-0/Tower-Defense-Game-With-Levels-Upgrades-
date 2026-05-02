// ═══════════════════════════════════════════════════════════
//  NEURAL SIEGE — Full Game Engine
//  Tower Defense | Levels | Upgrades | Bosses | Research
// ═══════════════════════════════════════════════════════════
 
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let CW, CH; // canvas dimensions — set on resize
 
// ──────────────────────────────────────────
//  GAME CONFIG
// ──────────────────────────────────────────
const CELL = 48; // grid cell size
 
const LEVEL_DEFS = [
  { id:1, name:'SECTOR ALPHA', diff:'EASY',    waves:8,  baseHp:20, startCredits:800,  enemyMult:1.0, bg:'#040a10', pathColor:'#1a2840', diffColor:'#00ff9f',  stars:0, locked:false, desc:'Training grounds. Standard HIVE drones. Learn the basics.' },
  { id:2, name:'SECTOR BETA',  diff:'MEDIUM',  waves:10, baseHp:18, startCredits:700,  enemyMult:1.3, bg:'#0a0610', pathColor:'#2a1a40', diffColor:'#ffe000',  stars:0, locked:true,  desc:'Armored units appear. Shields detected. Upgrade wisely.' },
  { id:3, name:'SECTOR GAMMA', diff:'HARD',    waves:12, baseHp:15, startCredits:650,  enemyMult:1.6, bg:'#0a0408', pathColor:'#401a1a', diffColor:'#ff7b00',  stars:0, locked:true,  desc:'Fast swarmers and regenerating hulks. Crowd control needed.' },
  { id:4, name:'SECTOR OMEGA', diff:'EXTREME', waves:15, baseHp:12, startCredits:600,  enemyMult:2.0, bg:'#020204', pathColor:'#200a30', diffColor:'#ff2d78',  stars:0, locked:true,  desc:'HIVE Overlord. Multiple bosses. No mercy. No retreat.' },
];
 
// Saved level progress
const progress = JSON.parse(localStorage.getItem('ns_progress') || '{}');
 
// ──────────────────────────────────────────
//  TOWER DEFINITIONS
// ──────────────────────────────────────────
const TOWER_DEFS = [
  {
    id:'laser', name:'LASER NODE',
    color:'#00d2ff', cost:100, sellMult:0.6,
    desc:'High-speed single target',
    damage:18, range:4, fireRate:35, bulletSpeed:7,
    bulletColor:'#00d2ff', bulletR:2,
    splashR:0, slowFactor:0, Pierce:false,
    upgradeKeys:['damage','range','fireRate'],
    levels:{ damage:[18,28,42,60], range:[4,4.5,5,5.5], fireRate:[35,25,18,12] },
    stats:'DMG:18 | RNG:4 | SPD:fast'
  },
  {
    id:'cannon', name:'PLASMA CANNON',
    color:'#ff7b00', cost:175, sellMult:0.6,
    desc:'Slow but explosive splash',
    damage:55, range:3.5, fireRate:80, bulletSpeed:5,
    bulletColor:'#ff7b00', bulletR:5,
    splashR:60, slowFactor:0, Pierce:false,
    upgradeKeys:['damage','range','splashR'],
    levels:{ damage:[55,85,130,200], range:[3.5,4,4.5,5], splashR:[60,80,100,130] },
    stats:'DMG:55 | SPLASH | SPD:slow'
  },
  {
    id:'cryo', name:'CRYO MATRIX',
    color:'#80cfff', cost:150, sellMult:0.6,
    desc:'Slows enemies in range',
    damage:10, range:3.5, fireRate:50, bulletSpeed:5.5,
    bulletColor:'#80cfff', bulletR:3,
    splashR:0, slowFactor:0.45, Pierce:false,
    upgradeKeys:['damage','range','slowFactor'],
    levels:{ damage:[10,16,24,35], range:[3.5,4,4.5,5.5], slowFactor:[0.45,0.35,0.25,0.15] },
    stats:'SLOW:45% | RNG:3.5 | SPD:med'
  },
  {
    id:'sniper', name:'VOID SNIPER',
    color:'#c500ff', cost:220, sellMult:0.6,
    desc:'Extreme range single target',
    damage:90, range:7, fireRate:100, bulletSpeed:14,
    bulletColor:'#c500ff', bulletR:2.5,
    splashR:0, slowFactor:0, Pierce:true,
    upgradeKeys:['damage','range','fireRate'],
    levels:{ damage:[90,140,200,300], range:[7,8,9,11], fireRate:[100,80,60,45] },
    stats:'DMG:90 | RNG:7 | PIERCE'
  },
  {
    id:'tesla', name:'TESLA ARC',
    color:'#ffe000', cost:280, sellMult:0.6,
    desc:'Chains lightning to nearby foes',
    damage:30, range:3.5, fireRate:45, bulletSpeed:0,
    bulletColor:'#ffe000', bulletR:0,
    splashR:0, slowFactor:0, Pierce:false, chain:3,
    upgradeKeys:['damage','range','chain'],
    levels:{ damage:[30,48,70,100], range:[3.5,4,4.5,5], chain:[3,4,5,7] },
    stats:'CHAIN:3 | DMG:30 | RNG:3.5'
  },
  {
    id:'nuke', name:'NUKE SILO',
    color:'#ff2d78', cost:400, sellMult:0.6,
    desc:'Massive explosion, very slow',
    damage:300, range:4, fireRate:200, bulletSpeed:3,
    bulletColor:'#ff2d78', bulletR:8,
    splashR:120, slowFactor:0, Pierce:false,
    upgradeKeys:['damage','range','fireRate'],
    levels:{ damage:[300,480,720,1000], range:[4,4.5,5,6], fireRate:[200,160,120,90] },
    stats:'DMG:300 | MEGA SPLASH'
  },
];
 
// Research tree
const RESEARCH = [
  { id:'r_speed',   name:'OVERCLK',  cost:200, desc:'+15% all tower fire rate', applied:false },
  { id:'r_range',   name:'OPTICS',   cost:200, desc:'+10% all tower range',     applied:false },
  { id:'r_income',  name:'SALVAGE',  cost:250, desc:'+20% enemy kill credits',  applied:false },
  { id:'r_armor',   name:'SHIELD',   cost:300, desc:'Base takes -30% damage',   applied:false },
];
 
// ──────────────────────────────────────────
//  ENEMY DEFINITIONS
// ──────────────────────────────────────────
const ENEMY_TYPES = [
  { id:'drone',   name:'NANO DRONE',   hp:60,   speed:1.4, reward:12, color:'#ff2d78', r:8,  armor:0,   regen:0,   boss:false, desc:'Basic unit' },
  { id:'runner',  name:'SPEED RUNNER', hp:40,   speed:2.8, reward:15, color:'#ff7b00', r:7,  armor:0,   regen:0,   boss:false, desc:'Fast but fragile' },
  { id:'hulk',    name:'ARMOR HULK',   hp:220,  speed:0.7, reward:30, color:'#00d2ff', r:14, armor:0.4, regen:0,   boss:false, desc:'High armor' },
  { id:'ghost',   name:'GHOST UNIT',   hp:80,   speed:2.0, reward:20, color:'#c500ff', r:8,  armor:0,   regen:0,   boss:false, desc:'Phase cloaking' },
  { id:'regen',   name:'REGEN CORE',   hp:160,  speed:1.0, reward:25, color:'#00ff9f', r:11, armor:0.2, regen:0.4, boss:false, desc:'Regenerates HP' },
  { id:'swarm',   name:'SWARM UNIT',   hp:25,   speed:2.2, reward:8,  color:'#ffe000', r:5,  armor:0,   regen:0,   boss:false, desc:'Tiny, comes in packs' },
  { id:'boss1',   name:'HIVE HERALD',  hp:2000, speed:0.7, reward:400,color:'#ff2d78', r:22, armor:0.3, regen:1.0, boss:true,  desc:'Wave boss — armored' },
  { id:'boss2',   name:'VOID TITAN',   hp:4000, speed:0.5, reward:700,color:'#c500ff', r:28, armor:0.5, regen:2.0, boss:true,  desc:'Ultimate boss' },
];
 
// ──────────────────────────────────────────
//  PATHS per level (grid coords, CELL-based)
// ──────────────────────────────────────────
function generatePath(levelId) {
  // Different paths per level
  const paths = {
    1: [{x:0,y:3},{x:4,y:3},{x:4,y:1},{x:9,y:1},{x:9,y:5},{x:14,y:5},{x:14,y:2},{x:17,y:2}],
    2: [{x:0,y:1},{x:3,y:1},{x:3,y:5},{x:7,y:5},{x:7,y:2},{x:11,y:2},{x:11,y:6},{x:15,y:6},{x:15,y:3},{x:17,y:3}],
    3: [{x:0,y:2},{x:2,y:2},{x:2,y:6},{x:5,y:6},{x:5,y:1},{x:9,y:1},{x:9,y:5},{x:13,y:5},{x:13,y:2},{x:16,y:2},{x:16,y:5},{x:17,y:5}],
    4: [{x:0,y:1},{x:2,y:1},{x:2,y:4},{x:4,y:4},{x:4,y:1},{x:7,y:1},{x:7,y:6},{x:10,y:6},{x:10,y:2},{x:13,y:2},{x:13,y:5},{x:16,y:5},{x:16,y:3},{x:17,y:3}],
  };
  return paths[levelId] || paths[1];
}
 
// ──────────────────────────────────────────
//  WAVE COMPOSITIONS per level
// ──────────────────────────────────────────
function buildWaves(levelId, totalWaves, enemyMult) {
  const waves = [];
  for(let w=1;w<=totalWaves;w++) {
    const isBossWave = w % 4 === 0;
    const wScale = 1 + (w-1)*0.12;
    const groups = [];
    if(isBossWave) {
      groups.push({ type: w>=12?'boss2':'boss1', count:1, interval:0, hp: Math.round(2000*enemyMult*(w>=12?2:1)) });
    } else {
      const types = getWaveTypes(levelId, w);
      types.forEach(t => {
        groups.push({ type:t.id, count: Math.round(t.count*wScale*enemyMult), interval:28, hp: Math.round(t.hp*wScale*enemyMult) });
      });
    }
    waves.push({ groups, label: isBossWave ? `BOSS WAVE ${w}` : `WAVE ${w} / ${totalWaves}`, isBoss: isBossWave });
  }
  return waves;
}
 
function getWaveTypes(levelId, wave) {
  if(levelId===1) {
    if(wave<3) return [{...ENEMY_TYPES[0], count:8}];
    if(wave<5) return [{...ENEMY_TYPES[0], count:10},{...ENEMY_TYPES[1], count:4}];
    return [{...ENEMY_TYPES[0], count:10},{...ENEMY_TYPES[1], count:6},{...ENEMY_TYPES[5], count:8}];
  }
  if(levelId===2) {
    if(wave<3) return [{...ENEMY_TYPES[0], count:12},{...ENEMY_TYPES[2], count:2}];
    if(wave<6) return [{...ENEMY_TYPES[2], count:4},{...ENEMY_TYPES[1], count:8}];
    return [{...ENEMY_TYPES[2], count:5},{...ENEMY_TYPES[3], count:6},{...ENEMY_TYPES[5], count:12}];
  }
  if(levelId===3) {
    if(wave<4) return [{...ENEMY_TYPES[4], count:6},{...ENEMY_TYPES[1], count:10}];
    return [{...ENEMY_TYPES[4], count:8},{...ENEMY_TYPES[2], count:6},{...ENEMY_TYPES[5], count:15}];
  }
  // Level 4
  return [{...ENEMY_TYPES[3], count:8},{...ENEMY_TYPES[4], count:8},{...ENEMY_TYPES[2], count:5},{...ENEMY_TYPES[5], count:20}];
}
 
// ──────────────────────────────────────────
//  GAME STATE
// ──────────────────────────────────────────
let G = {}; // game state
 
function initGame(levelId) {
  const lvl = LEVEL_DEFS.find(l=>l.id===levelId);
  const pathDef = generatePath(levelId);
  const waves = buildWaves(levelId, lvl.waves, lvl.enemyMult);
 
  G = {
    levelId, lvl,
    pathDef,
    pathPts: [], // pixel coords, computed after resize
    waves, waveIndex:0,
    waveActive:false, waveTimer:0,
    spawnQueue:[], spawnTimer:0,
    enemies:[], towers:[], bullets:[], particles:[],
    credits: lvl.startCredits,
    baseHp: lvl.baseHp, maxBaseHp: lvl.baseHp,
    score:0, kills:0,
    selectedTowerDef: null,
    selectedPlacedTower: null,
    state:'prep',
    gameSpeed:1,
    playerLevel:1, xp:0, xpNext:100,
    research: JSON.parse(JSON.stringify(RESEARCH)),
    frameCount:0,
    gridW:0, gridH:0,
    grid:null, // Set cells on path
  };
 
  resizeCanvas();
  buildGrid();
  buildPathPixels();
  renderTowerList();
  renderEnemyLegend();
  renderResearch();
  updateHUD();
  setBossBar(false);
}
 
// ──────────────────────────────────────────
//  CANVAS RESIZE
// ──────────────────────────────────────────
function resizeCanvas() {
  const wrap = document.getElementById('canvas-wrap');
  CW = wrap.clientWidth;
  CH = wrap.clientHeight;
  canvas.width = CW;
  canvas.height = CH;
  G.gridW = Math.floor(CW/CELL);
  G.gridH = Math.floor(CH/CELL);
  buildGrid();
  buildPathPixels();
}
 
function buildGrid() {
  if(!G.pathDef) return;
  G.grid = Array.from({length:G.gridH}, ()=>Array(G.gridW).fill('open'));
  G.pathDef.forEach((p,i)=>{
    if(i<G.pathDef.length-1) {
      const nx=G.pathDef[i+1], px=p;
      if(px.x===nx.x) {
        const minY=Math.min(px.y,nx.y), maxY=Math.max(px.y,nx.y);
        for(let y=minY;y<=maxY;y++) if(y<G.gridH&&px.x<G.gridW) G.grid[y][px.x]='path';
      } else {
        const minX=Math.min(px.x,nx.x), maxX=Math.max(px.x,nx.x);
        for(let x=minX;x<=maxX;x++) if(p.y<G.gridH&&x<G.gridW) G.grid[p.y][x]='path';
      }
    }
    if(p.x<G.gridW&&p.y<G.gridH) G.grid[p.y][p.x]='path';
  });
  // Mark placed towers
  if(G.towers) G.towers.forEach(t=>{ if(t.gy<G.gridH&&t.gx<G.gridW) G.grid[t.gy][t.gx]='tower'; });
}
 
function buildPathPixels() {
  if(!G.pathDef) return;
  G.pathPts = G.pathDef.map(p=>({ x:(p.x+0.5)*CELL, y:(p.y+0.5)*CELL }));
}
 
// ──────────────────────────────────────────
//  RENDERING
// ──────────────────────────────────────────
function drawBackground() {
  ctx.fillStyle = G.lvl.bg || '#040a10';
  ctx.fillRect(0,0,CW,CH);
 
  // Grid lines
  ctx.strokeStyle='rgba(0,210,255,0.04)';
  ctx.lineWidth=0.5;
  for(let x=0;x<CW;x+=CELL){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
  for(let y=0;y<CH;y+=CELL){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
}
 
function drawPath() {
  if(!G.pathPts||G.pathPts.length<2) return;
 
  // Path glow
  ctx.shadowColor=G.lvl.pathColor||'#1a2840';
  ctx.shadowBlur=0;
 
  for(let gy=0;gy<G.gridH;gy++) {
    for(let gx=0;gx<G.gridW;gx++) {
      if(!G.grid||G.grid[gy]?.[gx]!=='path') continue;
      ctx.fillStyle = G.lvl.pathColor || '#1a2840';
      ctx.fillRect(gx*CELL,gy*CELL,CELL,CELL);
      // Path texture
      ctx.strokeStyle='rgba(0,210,255,0.08)';
      ctx.lineWidth=1;
      ctx.strokeRect(gx*CELL+2,gy*CELL+2,CELL-4,CELL-4);
    }
  }
 
  // Arrow indicators on path
  ctx.fillStyle='rgba(0,210,255,0.15)';
  for(let i=0;i<G.pathPts.length-1;i++) {
    const a=G.pathPts[i], b=G.pathPts[i+1];
    const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
    const angle=Math.atan2(b.y-a.y,b.x-a.x);
    ctx.save();
    ctx.translate(mx,my);ctx.rotate(angle);
    ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.lineTo(2,4);ctx.moveTo(6,0);ctx.lineTo(2,-4);
    ctx.strokeStyle='rgba(0,210,255,0.2)';ctx.lineWidth=1;ctx.stroke();
    ctx.restore();
  }
}
 
function drawTowers() {
  G.towers.forEach(t=>{
    const px=t.gx*CELL+CELL/2, py=t.gy*CELL+CELL/2;
    const def=t.def;
 
    // Range circle (selected)
    if(G.selectedPlacedTower===t) {
      ctx.strokeStyle=def.color+'55';
      ctx.lineWidth=1;
      ctx.setLineDash([4,4]);
      ctx.beginPath();
      ctx.arc(px,py,t.range*CELL,0,Math.PI*2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
 
    // Base
    ctx.save();
    ctx.translate(px,py);
    ctx.shadowColor=def.color;
    ctx.shadowBlur=10+Math.sin(G.frameCount*0.05+t.id)*4;
 
    ctx.fillStyle=def.color+'33';
    ctx.strokeStyle=def.color;
    ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.rect(-CELL/2+4,-CELL/2+4,CELL-8,CELL-8);
    ctx.fill();ctx.stroke();
 
    // Tower icon shape
    ctx.fillStyle=def.color;
    if(def.id==='laser') {
      ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();
      // Beam direction indicator
      ctx.rotate(t.angle||0);
      ctx.fillRect(-1,-12,2,10);
    } else if(def.id==='cannon') {
      ctx.beginPath();
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.lineTo(Math.cos(a)*10,Math.sin(a)*10);}
      ctx.closePath();ctx.fill();
    } else if(def.id==='cryo') {
      // Snowflake
      for(let i=0;i<6;i++){ctx.save();ctx.rotate(i/6*Math.PI*2);ctx.fillRect(-1,-12,2,24);ctx.restore();}
    } else if(def.id==='sniper') {
      ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(7,8);ctx.lineTo(-7,8);ctx.closePath();ctx.fill();
    } else if(def.id==='tesla') {
      // Lightning bolt
      ctx.beginPath();ctx.moveTo(4,-12);ctx.lineTo(-2,0);ctx.lineTo(4,0);ctx.lineTo(-4,12);ctx.lineWidth=3;ctx.strokeStyle=def.color;ctx.stroke();
    } else if(def.id==='nuke') {
      ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.strokeStyle=def.color;ctx.lineWidth=2;ctx.stroke();
      ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();
    }
 
    // Level pips
    for(let i=0;i<t.level;i++) {
      ctx.fillStyle=def.color;
      ctx.beginPath();ctx.arc(-6+i*6,CELL/2-8,2.5,0,Math.PI*2);ctx.fill();
    }
 
    ctx.shadowBlur=0;
    ctx.restore();
  });
}
 
function drawEnemies() {
  G.enemies.forEach(e=>{
    const def=e.def;
 
    // Ghost flicker
    if(def.id==='ghost' && Math.floor(G.frameCount/8)%3===0) { return; }
 
    ctx.save();
    ctx.translate(e.x,e.y);
 
    // Shadow
    ctx.shadowColor=def.color;
    ctx.shadowBlur=12;
 
    const hpRatio=e.hp/e.maxHp;
 
    // Body
    if(def.boss) {
      // Boss ring
      ctx.strokeStyle=def.color+'99';
      ctx.lineWidth=2;
      for(let i=0;i<3;i++){
        ctx.save();ctx.rotate(G.frameCount*0.02*(i%2?1:-1));
        ctx.beginPath();ctx.arc(0,0,def.r+i*6,0,Math.PI*2);
        ctx.setLineDash([8,6]);ctx.stroke();ctx.setLineDash([]);
        ctx.restore();
      }
    }
 
    ctx.fillStyle=def.color;
    ctx.beginPath();ctx.arc(0,0,def.r,0,Math.PI*2);ctx.fill();
 
    // Core
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.beginPath();ctx.arc(0,0,def.r*0.5,0,Math.PI*2);ctx.fill();
 
    // Armor sheen
    if(def.armor>0) {
      ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(0,0,def.r,0,Math.PI*2);ctx.stroke();
    }
 
    // HP bar
    const bw=def.r*2+8;
    ctx.fillStyle='rgba(0,0,0,0.6)';
    ctx.fillRect(-bw/2,-def.r-10,bw,5);
    ctx.fillStyle=hpRatio>0.5?'#00ff9f':hpRatio>0.25?'#ffe000':'#ff2d78';
    ctx.fillRect(-bw/2,-def.r-10,bw*hpRatio,5);
 
    ctx.shadowBlur=0;
    ctx.restore();
  });
}
 
function drawBullets() {
  G.bullets.forEach(b=>{
    ctx.save();
    ctx.shadowColor=b.color;
    ctx.shadowBlur=8;
    ctx.fillStyle=b.color;
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    ctx.restore();
  });
}
 
function drawParticles() {
  G.particles.forEach(p=>{
    ctx.globalAlpha=(p.life/p.maxLife)*0.85;
    ctx.fillStyle=p.color;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
    const s=p.size*(p.life/p.maxLife);
    ctx.fillRect(-s/2,-s/2,s,s);
    ctx.restore();
  });
  ctx.globalAlpha=1;
}
 
function drawPlacementPreview(gx,gy) {
  if(!G.selectedTowerDef) return;
  const def=G.selectedTowerDef;
  const canPlace=G.grid[gy]?.[gx]==='open';
  const px=gx*CELL+CELL/2,py=gy*CELL+CELL/2;
  ctx.globalAlpha=0.5;
  ctx.fillStyle=canPlace?def.color+'44':'#ff2d7855';
  ctx.strokeStyle=canPlace?def.color:'#ff2d78';
  ctx.lineWidth=1.5;
  ctx.fillRect(gx*CELL,gy*CELL,CELL,CELL);
  ctx.strokeRect(gx*CELL,gy*CELL,CELL,CELL);
 
  // Range preview
  ctx.strokeStyle=def.color+'44';
  ctx.lineWidth=1;
  ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.arc(px,py,def.range*CELL,0,Math.PI*2);ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha=1;
}
 
// ──────────────────────────────────────────
//  DRAW FRAME
// ──────────────────────────────────────────
let mouseGX=0, mouseGY=0;
 
function render() {
  ctx.clearRect(0,0,CW,CH);
  drawBackground();
  drawPath();
  drawTowers();
  drawEnemies();
  drawBullets();
  drawParticles();
  if(G.selectedTowerDef) drawPlacementPreview(mouseGX,mouseGY);
}
 
// ──────────────────────────────────────────
//  UPDATE / GAME LOOP
// ──────────────────────────────────────────
let lastTS=0, rafId;
const TICK = 1/60;
 
function gameLoop(ts) {
  const raw=(ts-lastTS)/1000;
  lastTS=ts;
  const dt=Math.min(raw,0.1)*G.gameSpeed;
  G.frameCount++;
 
  if(G.state==='playing') {
    updateSpawning(dt);
    updateEnemies(dt);
    updateTowers(dt);
    updateBullets(dt);
    updateParticles(dt);
    checkWaveEnd();
    updateHUD();
  }
 
  render();
  rafId=requestAnimationFrame(gameLoop);
}
 
// ──────────────────────────────────────────
//  SPAWNING
// ──────────────────────────────────────────
function updateSpawning(dt) {
  if(!G.waveActive) return;
  if(G.spawnQueue.length===0) return;
 
  G.spawnTimer -= dt;
  if(G.spawnTimer>0) return;
 
  const entry = G.spawnQueue.shift();
  spawnEnemy(entry.type, entry.hp);
  G.spawnTimer = entry.interval/60;
}
 
function spawnEnemy(typeId, hpOverride) {
  const def = ENEMY_TYPES.find(e=>e.id===typeId) || ENEMY_TYPES[0];
  const start = G.pathPts[0];
  G.enemies.push({
    def, id: Math.random(),
    x:start.x, y:start.y,
    pathIdx:0, t:0,
    hp: hpOverride||def.hp,
    maxHp: hpOverride||def.hp,
    slowTimer:0, slowFactor:1,
    alive:true
  });
  if(def.boss) setBossBar(true, G.enemies[G.enemies.length-1]);
}
 
// ──────────────────────────────────────────
//  ENEMY UPDATE
// ──────────────────────────────────────────
function updateEnemies(dt) {
  const res = hasResearch('r_armor');
  G.enemies.forEach((e,i)=>{
    if(!e.alive){G.enemies.splice(i,1);return;}
 
    // Regen
    if(e.def.regen>0) e.hp=Math.min(e.maxHp,e.hp+e.def.regen*dt);
 
    // Slow
    if(e.slowTimer>0){e.slowTimer-=dt;}else{e.slowFactor=1;}
 
    // Move along path
    const spd = e.def.speed * e.slowFactor;
    e.t += spd * dt;
 
    const idxF = e.t;
    const segI = Math.floor(idxF);
    const segT = idxF-segI;
 
    if(segI >= G.pathPts.length-1) {
      // Reached base
      const dmg = res ? Math.ceil(e.def.boss?3:1*0.7) : (e.def.boss?3:1);
      G.baseHp = Math.max(0,G.baseHp-dmg);
      e.alive=false;
      flashBase();
      if(G.baseHp<=0) { triggerGameOver(); return; }
    } else {
      const a=G.pathPts[segI], b=G.pathPts[segI+1];
      e.x=a.x+(b.x-a.x)*segT;
      e.y=a.y+(b.y-a.y)*segT;
    }
  });
}
 
// ──────────────────────────────────────────
//  TOWER UPDATE
// ──────────────────────────────────────────
function updateTowers(dt) {
  const rSpeed=hasResearch('r_speed')?0.85:1;
  const rRange=hasResearch('r_range')?1.1:1;
 
  G.towers.forEach(t=>{
    t.cooldown -= dt;
    if(t.cooldown>0) return;
 
    const r=t.range*CELL*rRange;
    let target=null, closest=Infinity;
 
    G.enemies.forEach(e=>{
      if(!e.alive) return;
      const d=dist(t.px,t.py,e.x,e.y);
      if(d<r) {
        // Pick first in path progress
        if(e.t>closest){closest=e.t;target=e;}
      }
    });
 
    // Recalculate closest as path-furthest
    closest=0;
    G.enemies.forEach(e=>{
      if(!e.alive)return;
      if(dist(t.px,t.py,e.x,e.y)<r && e.t>closest){closest=e.t;target=e;}
    });
 
    if(!target) return;
 
    t.angle=Math.atan2(target.y-t.py,target.x-t.px);
    t.cooldown=t.def.fireRate/60*rSpeed;
 
    if(t.def.id==='tesla') {
      // Chain lightning
      let chainTargets=[target];
      let last=target;
      for(let i=1;i<t.chain;i++) {
        let next=null,nd=Infinity;
        G.enemies.forEach(e=>{
          if(!e.alive||chainTargets.includes(e))return;
          const d=dist(last.x,last.y,e.x,e.y);
          if(d<80&&d<nd){nd=d;next=e;}
        });
        if(next)chainTargets.push(next);
        last=next||last;
      }
      chainTargets.forEach(e=>dealDamage(e,t.damage,t.px,t.py,t.def.color));
      spawnLightning(t.px,t.py,chainTargets,t.def.color);
      return;
    }
 
    // Fire bullet
    const dx=target.x-t.px, dy=target.y-t.py;
    const d2=Math.sqrt(dx*dx+dy*dy);
    G.bullets.push({
      x:t.px,y:t.py,
      vx:dx/d2*t.def.bulletSpeed,
      vy:dy/d2*t.def.bulletSpeed,
      damage:t.damage,
      color:t.def.bulletColor,
      r:t.def.bulletR,
      splashR:t.splashR,
      slow:t.def.slowFactor||0,
      pierce:t.def.Pierce,
      alive:true
    });
  });
}
 
// ──────────────────────────────────────────
//  BULLET UPDATE
// ──────────────────────────────────────────
function updateBullets(dt) {
  G.bullets.forEach((b,i)=>{
    if(!b.alive){G.bullets.splice(i,1);return;}
    b.x+=b.vx;b.y+=b.vy;
 
    if(b.x<-20||b.x>CW+20||b.y<-20||b.y>CH+20){G.bullets.splice(i,1);return;}
 
    G.enemies.forEach(e=>{
      if(!e.alive||!b.alive) return;
      if(dist(b.x,b.y,e.x,e.y)<e.def.r+b.r) {
        if(b.splashR>0) {
          G.enemies.forEach(e2=>{
            if(dist(b.x,b.y,e2.x,e2.y)<b.splashR) dealDamage(e2,b.damage,b.x,b.y,b.color);
          });
          spawnExplosion(b.x,b.y,b.color,b.splashR);
        } else {
          dealDamage(e,b.damage,b.x,b.y,b.color);
        }
        if(b.slow>0){e.slowTimer=1.5;e.slowFactor=b.slow;}
        if(!b.pierce) b.alive=false;
      }
    });
  });
}
 
function dealDamage(e,dmg,bx,by,color) {
  if(!e.alive) return;
  const eff = dmg*(1-e.def.armor);
  e.hp -= eff;
  showDmg(bx,by,Math.round(eff),color);
  if(e.hp<=0) killEnemy(e);
}
 
function killEnemy(e) {
  e.alive=false;
  const mult=hasResearch('r_income')?1.2:1;
  G.credits+=Math.round(e.def.reward*mult);
  G.score+=Math.round(e.def.reward*10);
  G.kills++;
  G.xp+=e.def.boss?50:10;
  spawnExplosion(e.x,e.y,e.def.color,e.def.r*2);
  checkLevelUp();
  if(e.def.boss) setBossBar(false);
}
 
// ──────────────────────────────────────────
//  PARTICLES
// ──────────────────────────────────────────
function updateParticles(dt) {
  G.particles.forEach((p,i)=>{
    p.x+=p.vx;p.y+=p.vy;p.vx*=0.94;p.vy*=0.94;
    p.rot+=p.rotV;p.life-=dt*60;
    if(p.life<=0)G.particles.splice(i,1);
  });
}
 
function spawnExplosion(x,y,color,size=20) {
  const n=Math.round(size*0.4+6);
  for(let i=0;i<n;i++) {
    const a=Math.random()*Math.PI*2,s=(Math.random()*0.5+0.5)*(size/10);
    G.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,
      color,size:size*0.2*(0.5+Math.random()),
      life:30+Math.random()*30,maxLife:60,rot:0,rotV:(Math.random()-0.5)*0.2});
  }
}
 
function spawnLightning(sx,sy,targets,color) {
  let lx=sx,ly=sy;
  targets.forEach(t=>{
    G.particles.push({x:(lx+t.x)/2,y:(ly+t.y)/2,vx:0,vy:0,
      color,size:3,life:8,maxLife:8,rot:0,rotV:0});
    lx=t.x;ly=t.y;
  });
}
 
// ──────────────────────────────────────────
//  FLOAT DAMAGE TEXT
// ──────────────────────────────────────────
function showDmg(x,y,val,color) {
  const el=document.createElement('div');
  el.className='float-dmg';
  el.textContent=val;
  el.style.cssText=`color:${color};font-size:${val>100?'14px':'11px'};left:${x+document.getElementById('panel-left').offsetWidth}px;top:${y+52}px;`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),900);
}
 
// ──────────────────────────────────────────
//  WAVE MANAGEMENT
// ──────────────────────────────────────────
function startWave() {
  if(G.waveIndex>=G.waves.length) return;
  if(G.waveActive) return;
  const wave=G.waves[G.waveIndex];
  G.waveActive=true;
  G.state='playing';
 
  // Build spawn queue
  G.spawnQueue=[];
  wave.groups.forEach(g=>{
    for(let i=0;i<g.count;i++) {
      G.spawnQueue.push({type:g.type,hp:g.hp,interval:g.interval||30});
    }
  });
  G.spawnTimer=0;
  document.getElementById('wave-badge').textContent=wave.label;
  document.getElementById('btn-wave').disabled=true;
  notify(wave.isBoss?'⚠ BOSS INCOMING ⚠':'WAVE INCOMING');
}
 
function checkWaveEnd() {
  if(!G.waveActive) return;
  if(G.spawnQueue.length===0 && G.enemies.filter(e=>e.alive).length===0) {
    G.waveActive=false;
    G.waveIndex++;
    const bonus=80+G.waveIndex*20;
    G.credits+=bonus;
    G.score+=500;
    showDmg(CW/2,CH/2,`+${bonus} CREDITS`,'#ffe000');
    if(G.waveIndex>=G.waves.length) {
      setTimeout(triggerVictory,1200);
    } else {
      document.getElementById('btn-wave').disabled=false;
      document.getElementById('wave-badge').textContent='PREPARE';
      notify(`WAVE CLEARED — +${bonus} CREDITS`);
    }
  }
}
 
// ──────────────────────────────────────────
//  TOWER PLACEMENT
// ──────────────────────────────────────────
function placeTower(gx,gy) {
  const def=G.selectedTowerDef;
  if(!def) return;
  if(!G.grid||G.grid[gy]?.[gx]!=='open') return;
  if(G.credits<def.cost) { notify('NOT ENOUGH CREDITS'); return; }
  G.credits-=def.cost;
  const t={
    id:G.towers.length,
    def,gx,gy,
    px:gx*CELL+CELL/2,py:gy*CELL+CELL/2,
    level:1,
    angle:0,
    cooldown:0,
    damage:def.damage,
    range:def.range,
    splashR:def.splashR,
    chain:def.chain||0,
    kills:0
  };
  G.towers.push(t);
  G.grid[gy][gx]='tower';
  updateHUD();
}
 
function upgradeTower(t) {
  if(t.level>=4) return;
  const upgradeCost=t.def.cost*(t.level)*0.8;
  if(G.credits<upgradeCost) { notify('NOT ENOUGH CREDITS'); return; }
  G.credits-=upgradeCost;
  t.level++;
  const k=t.def.upgradeKeys;
  k.forEach(key=>{
    if(t.def.levels[key]) t[key]=t.def.levels[key][t.level-1];
  });
  notify(`${t.def.name} UPGRADED TO LV${t.level}`);
  renderSelectedInfo(t);
  updateHUD();
}
 
function sellTower(t) {
  const val=Math.round(t.def.cost*t.def.sellMult*t.level);
  G.credits+=val;
  G.grid[t.gy][t.gx]='open';
  G.towers=G.towers.filter(x=>x!==t);
  G.selectedPlacedTower=null;
  document.getElementById('selected-info').innerHTML='<div style="font-family:var(--f-mono);font-size:10px;color:rgba(200,228,240,0.3);letter-spacing:2px;">CLICK TOWER TO SELECT</div>';
  notify(`SOLD FOR ${val} CREDITS`);
  updateHUD();
}
 
// ──────────────────────────────────────────
//  RESEARCH
// ──────────────────────────────────────────
function applyResearch(id) {
  const r=G.research.find(x=>x.id===id);
  if(!r||r.applied) return;
  if(G.credits<r.cost){notify('NOT ENOUGH CREDITS');return;}
  G.credits-=r.cost;
  r.applied=true;
  notify(`RESEARCH APPLIED: ${r.name}`);
  renderResearch();
  updateHUD();
}
function hasResearch(id){return G.research?.find(x=>x.id===id)?.applied||false;}
 
// ──────────────────────────────────────────
//  PLAYER LEVEL UP
// ──────────────────────────────────────────
function checkLevelUp() {
  if(G.xp>=G.xpNext) {
    G.xp-=G.xpNext;
    G.playerLevel++;
    G.xpNext=Math.round(G.xpNext*1.5);
    G.credits+=150;
    notify(`LEVEL UP — ${G.playerLevel} — +150 CREDITS`);
    spawnExplosion(CW/2,CH/2,'#ffe000',80);
  }
  document.getElementById('xp-fill').style.width=(G.xp/G.xpNext*100)+'%';
}
 
// ──────────────────────────────────────────
//  GAME OVER / WIN
// ──────────────────────────────────────────
function triggerGameOver() {
  G.state='over';
  document.getElementById('result-score').textContent='SCORE: '+G.score.toLocaleString();
  document.getElementById('result-wave').textContent=`WAVE ${G.waveIndex} / ${G.waves.length} REACHED`;
  document.getElementById('result-kills').textContent=`${G.kills} UNITS DESTROYED`;
  document.getElementById('result-towers').textContent=`${G.towers.length} TOWERS BUILT`;
  document.getElementById('screen-over').style.display='flex';
}
 
function triggerVictory() {
  G.state='over';
  const stars = G.baseHp>=G.maxBaseHp*0.8?3:G.baseHp>=G.maxBaseHp*0.4?2:1;
  const grade = stars===3?'★★★ PERFECT DEFENSE':stars===2?'★★☆ SOLID DEFENSE':'★☆☆ BARELY SURVIVED';
  if(!progress[G.levelId]||progress[G.levelId]<stars){
    progress[G.levelId]=stars;
    localStorage.setItem('ns_progress',JSON.stringify(progress));
    // Unlock next level
    const nextId=G.levelId+1;
    const lvlDef=LEVEL_DEFS.find(l=>l.id===nextId);
    if(lvlDef) lvlDef.locked=false;
  }
  document.getElementById('win-score').textContent='SCORE: '+G.score.toLocaleString();
  document.getElementById('win-grade').textContent=grade;
  document.getElementById('win-waves').textContent=`ALL ${G.waves.length} WAVES SURVIVED`;
  document.getElementById('screen-win').style.display='flex';
}
 
// ──────────────────────────────────────────
//  HUD HELPERS
// ──────────────────────────────────────────
function updateHUD() {
  if(!G.lvl) return;
  document.getElementById('h-credits').textContent=G.credits;
  document.getElementById('h-score').textContent=G.score.toLocaleString();
  document.getElementById('h-lives').textContent=G.baseHp;
  document.getElementById('h-level').textContent=G.playerLevel;
  const pct=G.baseHp/G.maxBaseHp*100;
  document.getElementById('base-fill').style.width=pct+'%';
  document.getElementById('hp-text').textContent=`${G.baseHp} / ${G.maxBaseHp}`;
}
 
function setBossBar(show, enemy) {
  const el=document.getElementById('boss-hp-bar');
  el.style.display=show?'flex':'none';
  if(show&&enemy) {
    const update=()=>{
      if(!enemy.alive){setBossBar(false);return;}
      document.getElementById('boss-bar-fill').style.width=(enemy.hp/enemy.maxHp*100)+'%';
      requestAnimationFrame(update);
    };
    update();
  }
}
 
function flashBase() {
  const el=document.getElementById('flash');
  el.style.background='rgba(255,45,120,0.18)';
  el.style.opacity='1';
  setTimeout(()=>{el.style.transition='opacity 0.4s';el.style.opacity='0';},80);
}
 
function notify(msg) {
  const el=document.getElementById('notif');
  el.textContent=msg;el.style.opacity='1';
  clearTimeout(el._t);
  el._t=setTimeout(()=>el.style.opacity='0',2200);
}
 
// ──────────────────────────────────────────
//  UI BUILDERS
// ──────────────────────────────────────────
function renderTowerList() {
  const cont=document.getElementById('tower-list');
  cont.innerHTML='';
  TOWER_DEFS.forEach(def=>{
    const card=document.createElement('div');
    card.className='tower-card';
    card.style.setProperty('--tc',def.color);
    card.innerHTML=`<div class="tower-name" style="color:${def.color}">${def.name}</div>
      <div class="tower-cost">◆ ${def.cost} CREDITS</div>
      <div class="tower-desc">${def.desc}</div>
      <div class="tower-stats-row">
        ${def.stats.split('|').map(s=>`<span class="tstat">${s.trim()}</span>`).join('')}
      </div>`;
    card.addEventListener('click',()=>{
      document.querySelectorAll('.tower-card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected');
      G.selectedTowerDef=def;
      G.selectedPlacedTower=null;
      canvas.style.cursor='crosshair';
    });
    cont.appendChild(card);
  });
}
 
function renderEnemyLegend() {
  const cont=document.getElementById('enemy-legend');
  cont.innerHTML='';
  ENEMY_TYPES.filter(e=>!e.boss).forEach(e=>{
    const div=document.createElement('div');
    div.className='enemy-entry';
    div.innerHTML=`<div class="enemy-dot" style="background:${e.color};box-shadow:0 0 6px ${e.color}"></div>
      <div><div style="font-family:var(--f-hud);font-size:11px;color:${e.color}">${e.name}</div>
      <div style="font-family:var(--f-mono);font-size:9px;color:rgba(200,228,240,0.4)">${e.desc}</div></div>`;
    cont.appendChild(div);
  });
}
 
function renderResearch() {
  const cont=document.getElementById('research-panel');
  cont.innerHTML='';
  G.research.forEach(r=>{
    const div=document.createElement('div');
    div.style.cssText='margin-bottom:6px;padding:8px;background:rgba(0,0,0,0.4);border:1px solid rgba(0,210,255,0.15);border-radius:3px;cursor:pointer;transition:all 0.18s';
    div.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-family:var(--f-hud);font-size:12px;color:${r.applied?'#ffe000':'var(--c-cyan)'};">${r.name}</span>
      <span style="font-family:var(--f-mono);font-size:9px;color:${r.applied?'#00ff9f':'var(--c-gold)'};">${r.applied?'ACTIVE':'◆ '+r.cost}</span>
    </div>
    <div style="font-family:var(--f-mono);font-size:9px;color:rgba(200,228,240,0.4);margin-top:3px">${r.desc}</div>`;
    if(!r.applied) div.addEventListener('click',()=>applyResearch(r.id));
    cont.appendChild(div);
  });
}
 
function renderSelectedInfo(t) {
  const upgCost=t.level<4?Math.round(t.def.cost*t.level*0.8):null;
  const sellVal=Math.round(t.def.cost*t.def.sellMult*t.level);
  document.getElementById('selected-info').innerHTML=`
    <div class="sel-name" style="color:${t.def.color}">${t.def.name}</div>
    <div class="sel-stat">LEVEL ${t.level} / 4</div>
    <div class="sel-stat">DAMAGE: ${Math.round(t.damage)}</div>
    <div class="sel-stat">RANGE: ${t.range.toFixed(1)}</div>
    ${t.def.slowFactor?`<div class="sel-stat">SLOW: ${Math.round((1-t.def.slowFactor)*100)}%</div>`:''}
    ${t.def.id==='tesla'?`<div class="sel-stat">CHAIN: ${t.chain}</div>`:''}
    <button class="btn-upgrade" ${t.level>=4?'disabled':''} id="btn-up">
      ${t.level<4?`UPGRADE ◆ ${upgCost}`:'MAX LEVEL'}
    </button>
    <button class="btn-sell">SELL ◆ ${sellVal}</button>
  `;
  document.getElementById('btn-up')?.addEventListener('click',()=>upgradeTower(t));
  document.querySelector('.btn-sell')?.addEventListener('click',()=>sellTower(t));
}
 
function renderLevelSelect() {
  const grid=document.getElementById('level-grid');
  grid.innerHTML='';
  // Apply saved progress
  LEVEL_DEFS.forEach(l=>{
    if(progress[l.id]) l.locked=false;
    if(l.id>1&&!progress[l.id-1]) l.locked=true;
  });
  // Always unlock level 1
  LEVEL_DEFS[0].locked=false;
 
  let chosen=null;
  LEVEL_DEFS.forEach(l=>{
    const card=document.createElement('div');
    card.className='level-card'+(l.locked?' locked':'');
    const stars=progress[l.id]||0;
    card.innerHTML=`<div class="level-num">${String(l.id).padStart(2,'0')}</div>
      <div class="level-name">${l.name}</div>
      <div class="level-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
      <div class="level-diff" style="color:${l.diffColor}">${l.diff}</div>`;
    if(!l.locked) {
      card.addEventListener('click',()=>{
        document.querySelectorAll('.level-card').forEach(c=>c.classList.remove('active'));
        card.classList.add('active');
        chosen=l;
        document.getElementById('level-desc-text').textContent=l.desc;
        document.getElementById('btn-start-level').disabled=false;
        document.getElementById('btn-start-level').onclick=()=>{
          document.getElementById('screen-levels').style.display='none';
          startLevel(l.id);
        };
      });
    }
    grid.appendChild(card);
  });
}
 
// ──────────────────────────────────────────
//  LEVEL LAUNCH
// ──────────────────────────────────────────
function startLevel(id) {
  initGame(id);
  cancelAnimationFrame(rafId);
  lastTS=performance.now();
  rafId=requestAnimationFrame(gameLoop);
  document.getElementById('btn-wave').disabled=false;
}
 
// ──────────────────────────────────────────
//  INPUT HANDLING
// ──────────────────────────────────────────
canvas.addEventListener('mousemove',e=>{
  const r=canvas.getBoundingClientRect();
  const x=e.clientX-r.left, y=e.clientY-r.top;
  mouseGX=Math.floor(x/CELL);
  mouseGY=Math.floor(y/CELL);
});
 
canvas.addEventListener('click',e=>{
  if(!G.grid) return;
  const r=canvas.getBoundingClientRect();
  const x=e.clientX-r.left, y=e.clientY-r.top;
  const gx=Math.floor(x/CELL), gy=Math.floor(y/CELL);
 
  // Check if clicking placed tower
  const clicked=G.towers.find(t=>t.gx===gx&&t.gy===gy);
  if(clicked) {
    G.selectedPlacedTower=clicked;
    G.selectedTowerDef=null;
    canvas.style.cursor='default';
    document.querySelectorAll('.tower-card').forEach(c=>c.classList.remove('selected'));
    renderSelectedInfo(clicked);
    return;
  }
 
  if(G.selectedTowerDef) {
    placeTower(gx,gy);
  } else {
    G.selectedPlacedTower=null;
    document.getElementById('selected-info').innerHTML='<div style="font-family:var(--f-mono);font-size:10px;color:rgba(200,228,240,0.3);letter-spacing:2px;">CLICK TOWER TO SELECT</div>';
  }
});
 
canvas.addEventListener('contextmenu',e=>{
  e.preventDefault();
  G.selectedTowerDef=null;
  canvas.style.cursor='default';
  document.querySelectorAll('.tower-card').forEach(c=>c.classList.remove('selected'));
});
 
// Speed buttons
document.querySelectorAll('.btn-speed').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.btn-speed').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    G.gameSpeed=parseInt(btn.dataset.spd);
  });
});
 
// Wave button
document.getElementById('btn-wave').addEventListener('click',()=>{
  if(G.waveActive||G.state==='over') return;
  startWave();
});
 
// Menu button
document.getElementById('btn-menu').addEventListener('click',()=>{
  cancelAnimationFrame(rafId);
  showLevelSelect();
});
 
// Screen buttons
document.getElementById('btn-title-play').addEventListener('click',()=>{
  document.getElementById('screen-title').style.display='none';
  showLevelSelect();
});
document.getElementById('btn-retry').addEventListener('click',()=>{
  document.getElementById('screen-over').style.display='none';
  startLevel(G.levelId);
});
document.getElementById('btn-menu2').addEventListener('click',()=>{
  document.getElementById('screen-over').style.display='none';
  showLevelSelect();
});
document.getElementById('btn-menu3').addEventListener('click',()=>{
  document.getElementById('screen-win').style.display='none';
  showLevelSelect();
});
document.getElementById('btn-next-level').addEventListener('click',()=>{
  document.getElementById('screen-win').style.display='none';
  const nextId=G.levelId+1;
  if(nextId<=LEVEL_DEFS.length){startLevel(nextId);}else{showLevelSelect();}
});
 
function showLevelSelect() {
  renderLevelSelect();
  document.getElementById('screen-levels').style.display='flex';
}
 
// Resize
window.addEventListener('resize',()=>{
  if(G.grid) resizeCanvas();
});
 
// ──────────────────────────────────────────
//  UTILS
// ──────────────────────────────────────────
function dist(x1,y1,x2,y2){return Math.sqrt((x2-x1)**2+(y2-y1)**2);}
