/* =========================================================
   CHAPTER 2 FİNALİ: Tebeşir, Kel Porno, Vural & Şükrü Hoca
   ========================================================= */
'use strict';

// ---------------- script helpers ----------------
const waiters = [], movers = [];
function wait(f) { return new Promise(r => waiters.push({ t: f, r })); }
function talk(lines) { return new Promise(r => runDialog(lines, r)); }
function walkTo(e, tx, sp = 2) { return new Promise(r => movers.push({ e, tx, sp, r })); }
function tickScript() {
  for (let i = waiters.length - 1; i >= 0; i--) { if (--waiters[i].t <= 0) { const w = waiters.splice(i, 1)[0]; w.r(); } }
  for (let i = movers.length - 1; i >= 0; i--) {
    const m = movers[i], d = m.tx - m.e.x;
    if (Math.abs(d) <= m.sp) { m.e.x = m.tx; m.e.moving = false; movers.splice(i, 1); m.r(); }
    else { m.e.x += Math.sign(d) * m.sp; m.e.facing = Math.sign(d); m.e.moving = true; m.e.phase = (m.e.phase || 0) + 0.28 * Math.min(1, m.sp / 2); }
  }
}

// ---------------- state ----------------
let SK = null;              // Şükrü Hoca (tembel hayvan)
let board = '';             // tahtadaki yazı
let cases = [], tools = [];  // evrak çantası, geometri aletleri
let smirkT = 0, rageT = 0;
const DOOR_X = 20;

// =========================================================
//                     SINIF: ARA SAHNE
// =========================================================
function startClass() {
  G.mode = 'boss'; G.arena = 'class'; G.camX = 0; parts = []; projs = []; waves = []; cases = []; tools = [];
  boss = null; SK = null; board = ''; smirkT = 0; rageT = 0; slipper = null; doorOpen = false;
  P.x = 300; P.y = AGY - P.h; P.vx = P.vy = 0; P.facing = -1; P.hp = 3; P.blink = 0; P.dizzy = 0;
  B.active = true; B.x = 230; B.y = AGY - B.h; B.facing = 1; B.moving = false; B.bubble = null; B.hop = 0; B.noMentos = false;
  arenaPhase = 'cut';
  (async () => {
    await wait(50);
    await talk([say('dgc', "Aga sen Vural'ın odadan tebeşir alıp gelsene bi")]);
    await walkTo(B, DOOR_X + 10, 2.2);
    fadeTo(startOffice);
  })();
}

function backToClass() {
  G.mode = 'boss'; G.arena = 'class'; arenaPhase = 'cut'; parts = [];
  P.x = 300; P.y = AGY - P.h; P.facing = -1; P.vx = P.vy = 0;
  B.x = DOOR_X + 10; B.y = AGY - B.h; B.facing = 1; B.moving = false; B.bubble = null;
  (async () => {
    await wait(30);
    await walkTo(B, 200, 2.2);
    B.facing = 1;
    botSay('Al bakalım.', 80); SFX.pick();
    await wait(70);
    await walkTo(P, 455, 2.4); P.facing = 1;
    const txt = 'KEL PORNO';
    for (const ch of txt) {
      board += ch;
      if (ch !== ' ') { sfx(1600 + Math.random() * 400, 0.08, 'sawtooth', 0.02); burst(330 + board.length * 34, 220, 3, { colors: ['#fff'], max: 1.5, g: 0.1, world: false, life: 25 }); }
      await wait(ch === ' ' ? 18 : 14);
    }
    await wait(30);
    P.facing = -1;
    // Şükrü Hoca çok yavaş giriyor
    SK = { x: -70, y: AGY - 92, w: 70, h: 92, facing: 1, moving: true, phase: 0, angry: 0, hang: false, t: 0, flash: 0 };
    const entering = walkTo(SK, 85, 0.55);
    await wait(110);
    await talk([say('bot', 'Görmedim geldiğini, al bismillah')]);
    await entering;
    SK.facing = 1; await wait(30);
    SK.angry = 1; G.shake = 8; SFX.boom();
    burst(SK.x + 35, SK.y - 10, 10, { colors: ['rgba(255,255,255,.8)'], max: 2, g: -0.05, size: 8, world: false, life: 40 });
    await talk([say('sukru', 'Bu... ne... böyle...', 'slow'), say('sukru', 'VURAL BEEEEY...', 'slow')]);
    // Vural ışınlanarak geliyor
    makeVural(); boss.x = 640; boss.vis = 0; boss.state = 'intro';
    for (let k = 0; k < 20; k++) { boss.vis = k / 19; await wait(1); }
    burst(boss.x + 30, AGY - 70, 30, { colors: ['#9ec7ff', '#fff'], max: 5, world: false });
    SFX.boom();
    await wait(40);
    await talk([say('vural', 'Oğlum hoş mu?')]);
    await wait(80);
    await talk([say('vural', '...Peki ya porno?')]);
    smirkT = 150; SFX.blip();
    await wait(150);
    rageT = 100; G.shake = 26; SFX.boom(); setTimeout(() => SFX.boom(), 250);
    await wait(100);
    // Şükrü tavana tırmanıyor (yavaşça, tabii)
    SK.hang = true; SK.x = 300; SK.y = 96; SK.moving = false; SK.dir = 1;
    startVuralFight();
  })();
}

// =========================================================
//                 MÜDÜR YRD. ODASI: GİZLİLİK
// =========================================================
let OF = null;
function startOffice() {
  G.mode = 'office'; parts = [];
  B.x = DOOR_X + 10; B.y = AGY - B.h; B.facing = 1; B.moving = false; B.hop = 0; B.bubble = null;
  OF = { vs: 'read', vt: 160, chalk: false, intro: true, done: false, caughtT: 0, vbubble: null, firstLook: true };
  (async () => { await wait(40); await talk([say('bot', 'İşte şimdi sıçtık amk')]); OF.intro = false; })();
}
function updOffice() {
  tickDialog();
  if (B.bubble) { B.bubble.t--; if (B.bubble.t <= 0) B.bubble = null; }
  if (OF.vbubble) { OF.vbubble.t--; if (OF.vbubble.t <= 0) OF.vbubble = null; }
  if (OF.intro || OF.done) { B.moving = false; return; }
  if (OF.caughtT > 0) {
    OF.caughtT--; B.moving = false;
    if (OF.caughtT === 0) { B.x = DOOR_X + 10; B.facing = 1; OF.chalk = false; OF.vs = 'read'; OF.vt = 150; }
    return;
  }
  // Bot Ömer'i oyuncu yönetiyor (sessiz adımlar)
  let dir = 0;
  if (held('arrowleft', 'a')) dir -= 1;
  if (held('arrowright', 'd')) dir += 1;
  B.x = clamp(B.x + dir * 2.6, 0, W - B.w - 10);
  B.moving = dir !== 0; if (dir) { B.facing = dir; B.phase += 0.2; }
  // Vural döngüsü: gazete okuyor -> şüpheleniyor -> bakıyor
  OF.vt--;
  if (OF.vs === 'read' && OF.vt <= 0) { OF.vs = 'warn'; OF.vt = 50; OF.vbubble = { text: '...?', t: 50 }; SFX.blip(); }
  else if (OF.vs === 'warn' && OF.vt <= 0) { OF.vs = 'look'; OF.vt = 110; }
  else if (OF.vs === 'look' && OF.vt <= 0) { OF.vs = 'read'; OF.vt = rand(130, 230) | 0; }
  if (OF.vs === 'look' && B.moving) {
    OF.caughtT = 90; SFX.hurt(); G.shake = 8;
    OF.vbubble = { text: OF.chalk ? 'O TEBEŞİRİ BIRAK OĞLUM!' : 'Oğlum ne arıyorsun burada?', t: 90, type: 'shout' };
  }
  // tebeşir
  if (!OF.chalk && Math.abs(B.x + B.w / 2 - 850) < 26) { OF.chalk = true; SFX.pick(); burst(850, AGY - 100, 16, { colors: ['#fff', '#ffe36a'], max: 4, world: false }); }
  if (OF.chalk && B.x <= DOOR_X + 12) { OF.done = true; fadeTo(backToClass); }
}

function drawOffice() {
  ctx.save();
  if (G.shake > 0) { ctx.translate(rand(-G.shake, G.shake), rand(-G.shake, G.shake)); G.shake *= 0.86; if (G.shake < 0.5) G.shake = 0; }
  // wallpaper
  ctx.fillStyle = '#4a0910'; ctx.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 40) { ctx.fillStyle = x % 80 ? '#560b13' : '#3e070d'; ctx.fillRect(x, 0, 40, AGY); }
  ctx.fillStyle = '#d9ae4a'; ctx.fillRect(0, 300, W, 5);
  ctx.fillStyle = '#2b0508'; ctx.fillRect(0, 305, W, AGY - 305);
  // window with moon behind desk
  ctx.fillStyle = '#0b1230'; ctx.fillRect(420, 70, 220, 170);
  ctx.fillStyle = 'rgba(255,240,210,.9)'; ctx.beginPath(); ctx.arc(590, 115, 22, 0, 7); ctx.fill();
  ctx.strokeStyle = '#d9ae4a'; ctx.lineWidth = 6; ctx.strokeRect(420, 70, 220, 170);
  ctx.beginPath(); ctx.moveTo(530, 70); ctx.lineTo(530, 240); ctx.stroke();
  ctx.fillStyle = '#7d0b14'; ctx.fillRect(395, 60, 34, 200); ctx.fillRect(631, 60, 34, 200);
  // bookshelf
  ctx.fillStyle = '#5a3d22'; ctx.fillRect(130, 150, 150, 320);
  for (let r = 0; r < 4; r++) { ctx.fillStyle = '#3a2715'; ctx.fillRect(138, 168 + r * 75, 134, 6); for (let b = 0; b < 8; b++) { ctx.fillStyle = ['#b5452f', '#2f5e8a', '#d1a53a', '#3e7a46'][(b + r) % 4]; ctx.fillRect(142 + b * 16, 120 + r * 75 + 50 - (b % 3) * 4, 13, 46 + (b % 3) * 4); } }
  // Vural behind desk
  drawVuralOffice();
  // desk
  ctx.fillStyle = '#6b4a2e'; ctx.fillRect(410, 370, 240, 100); ctx.fillStyle = '#8a6440'; ctx.fillRect(400, 362, 260, 14);
  ctx.fillStyle = '#d9ae4a'; ctx.fillRect(475, 395, 110, 24); ctx.fillStyle = '#2b1a0c'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center'; ctx.fillText('MÜDÜR YRD.', 530, 411);
  // cabinet + chalk box
  ctx.fillStyle = '#7a5532'; ctx.fillRect(800, 380, 100, 90); ctx.strokeStyle = '#4a3220'; ctx.lineWidth = 2; ctx.strokeRect(806, 388, 88, 36); ctx.strokeRect(806, 428, 88, 36);
  if (!OF.chalk) {
    const gl = ctx.createRadialGradient(850, 365, 2, 850, 365, 40); gl.addColorStop(0, 'rgba(255,255,200,.6)'); gl.addColorStop(1, 'rgba(255,255,200,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(850, 365, 40, 0, 7); ctx.fill();
    ctx.fillStyle = '#f4f4f4'; ctx.fillRect(828, 352, 44, 28); ctx.fillStyle = '#1e5bd8'; ctx.fillRect(828, 362, 44, 7); ctx.fillStyle = '#222'; ctx.font = 'bold 8px Inter'; ctx.fillText('TEBEŞİR', 850, 377);
  }
  // door
  ctx.fillStyle = '#3a2715'; ctx.fillRect(0, 280, 62, 190); ctx.fillStyle = '#d9ae4a'; ctx.fillRect(50, 375, 6, 6);
  // floor
  ctx.fillStyle = '#3a1a10'; ctx.fillRect(0, AGY, W, H - AGY);
  for (let i = 0; i < 24; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.1)'; ctx.fillRect(i * 40, AGY, 40, H - AGY); }
  // Bot Ömer, chalk in hand if taken
  drawBot(B, 0);
  if (OF.chalk) { ctx.fillStyle = '#fff'; ctx.fillRect(B.x + B.w / 2 + B.facing * 18 - 2, B.y + 26, 4, 14); }
  if (OF.caughtT > 0) { ctx.font = '40px Bangers, Impact'; ctx.fillStyle = '#ff3b3b'; ctx.textAlign = 'center'; ctx.fillText('!', B.x + B.w / 2, B.y - 50); }
  drawParts(0, false); drawParts(0, true);
  ctx.restore();
  // vignette
  const v = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 620); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // HUD
  ctx.fillStyle = 'rgba(0,0,0,.55)'; rr(W / 2 - 250, 12, 500, 52, 14); ctx.fill();
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '600 15px Inter';
  ctx.fillText(OF.chalk ? '← Tebeşir sende. Şimdi kapıya dön.' : 'Tebeşiri al →   (← → ile yürü)', W / 2, 33);
  ctx.fillStyle = OF.vs === 'look' ? '#ff5a5a' : (OF.vs === 'warn' ? '#ffd36a' : '#9ef0a0');
  ctx.font = '16px Bangers, Impact';
  ctx.fillText(OF.vs === 'look' ? 'BAKIYOR! KIPIRDAMA!' : (OF.vs === 'warn' ? 'DİKKAT...' : 'GAZETE OKUYOR, İLERLE'), W / 2, 55);
  // bubbles
  if (OF.vbubble) bubble(530, 150, OF.vbubble.text, OF.vbubble.type || 'say');
  drawBubbles();
}

function drawVuralOffice() {
  const cx = 530, top = 230;
  // torso
  ctx.fillStyle = '#1f3557'; rr(cx - 50, top + 70, 100, 90, 20); ctx.fill();
  ctx.fillStyle = '#e9eef5'; ctx.beginPath(); ctx.moveTo(cx - 14, top + 70); ctx.lineTo(cx + 14, top + 70); ctx.lineTo(cx, top + 110); ctx.fill();
  ctx.fillStyle = '#7a1420'; ctx.beginPath(); ctx.moveTo(cx - 5, top + 76); ctx.lineTo(cx + 5, top + 76); ctx.lineTo(cx + 3, top + 112); ctx.lineTo(cx - 3, top + 112); ctx.fill();
  // head
  drawVuralHead(cx, top + 40, 1, OF.vs === 'look');
  // newspaper
  if (OF.vs !== 'look') {
    const lift = OF.vs === 'warn' ? 22 : 0;
    ctx.fillStyle = '#efe9d8'; rr(cx - 70, top + 4 + lift, 140, 96, 4); ctx.fill();
    ctx.fillStyle = '#333'; ctx.font = 'bold 14px "DM Serif Display", serif'; ctx.textAlign = 'center'; ctx.fillText('GAZETE', cx, top + 26 + lift);
    ctx.fillStyle = '#999'; for (let l = 0; l < 6; l++) { ctx.fillRect(cx - 60, top + 36 + lift + l * 9, 55, 3); ctx.fillRect(cx + 5, top + 36 + lift + l * 9, 55, 3); }
  } else {
    ctx.fillStyle = 'rgba(255,60,60,.25)'; ctx.beginPath(); ctx.moveTo(cx, top + 40); ctx.lineTo(0, AGY); ctx.lineTo(W, AGY); ctx.closePath(); ctx.fill();
  }
}

// =========================================================
//                VURAL HOCA (G-MAN HAVASINDA)
// =========================================================
function drawVuralHead(cx, cy, s, stare) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = '#e8c8a8'; ctx.beginPath(); ctx.ellipse(0, 0, 25, 31, 0, 0, 7); ctx.fill();
  // slicked-back grey hair
  ctx.fillStyle = '#4a4a50'; ctx.beginPath(); ctx.ellipse(0, -22, 26, 14, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(-26, -24, 6, 18); ctx.fillRect(20, -24, 6, 18);
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 8, -33); ctx.quadraticCurveTo(k * 8 + 6, -26, k * 9 + 10, -18); ctx.stroke(); }
  // sunken cheeks
  ctx.strokeStyle = 'rgba(120,80,60,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-16, 6); ctx.quadraticCurveTo(-13, 16, -10, 20); ctx.moveTo(16, 6); ctx.quadraticCurveTo(13, 16, 10, 20); ctx.stroke();
  // eyes (narrow, suspicious)
  ctx.fillStyle = stare ? '#ffefa0' : '#fff'; ctx.fillRect(-15, -6, 11, 5); ctx.fillRect(4, -6, 11, 5);
  ctx.fillStyle = '#1a3a2a'; ctx.fillRect(-11, -6, 4, 5); ctx.fillRect(8, -6, 4, 5);
  ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-17, -11); ctx.lineTo(-3, -9); ctx.moveTo(17, -13); ctx.lineTo(3, -9); ctx.stroke();
  // nose + thin mouth
  ctx.strokeStyle = '#b08870'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(-3, 8); ctx.lineTo(2, 9); ctx.stroke();
  ctx.strokeStyle = '#6a3a30'; ctx.beginPath(); ctx.moveTo(-8, 17); ctx.quadraticCurveTo(0, 15, 9, 18); ctx.stroke();
  // stubble
  ctx.fillStyle = 'rgba(60,60,60,.18)'; ctx.beginPath(); ctx.ellipse(0, 16, 18, 13, 0, 0, Math.PI); ctx.fill();
  ctx.restore();
}

function makeVural() {
  boss = { type: 'vural', x: 640, y: AGY - 122, w: 60, h: 122, hp: 3, state: 'intro', t: 0, facing: -1, vis: 1, cycle: 0, flash: 0, bubble: null, hasCase: true };
}
function startVuralFight() {
  if (!boss || boss.type !== 'vural') makeVural();
  boss.state = 'idle'; boss.t = 110; boss.vis = 1;
  arenaPhase = 'vural';
  bossTitleT = 120;
}
let bossTitleT = 0;
function startVuralFightDirect() {
  board = 'KEL PORNO'; SK = { x: 300, y: 96, w: 70, h: 92, facing: 1, moving: false, phase: 0, angry: 1, hang: true, dir: 1, t: 0, flash: 0 };
  makeVural(); startVuralFight();
}
function resetVuralFight() {
  cases = []; tools = [];
  makeVural(); boss.x = 680; startVuralFight(); bossTitleT = 0;
  if (SK) { SK.x = 300; SK.t = 0; }
}

function updVural() {
  const v = boss;
  if (v.flash > 0) v.flash--;
  if (v.bubble) { v.bubble.t--; if (v.bubble.t <= 0) v.bubble = null; }
  if (v.state === 'intro') return;
  v.t--;
  const px = P.x + P.w / 2, vx = v.x + v.w / 2;
  const seq = ['throw', 'teleport', 'throw', 'teleport', 'tie'];
  switch (v.state) {
    case 'idle':
      v.facing = px < vx ? -1 : 1;
      if (v.t <= 0) {
        const nx = seq[v.cycle % seq.length]; v.cycle++;
        if (nx === 'throw') { v.state = 'windup'; v.t = 32; }
        if (nx === 'teleport') { v.state = 'out'; v.t = 22; SFX.blip(); }
        if (nx === 'tie') { v.state = 'tie'; v.t = 170 - (3 - v.hp) * 25; }
      }
      break;
    case 'windup':
      if (v.t <= 0) {
        v.hasCase = false; v.state = 'waitCase';
        cases.push({ x: vx + v.facing * 30, y: AGY - 34, vx: v.facing * (7 + (3 - v.hp)), dir: v.facing, back: false, rot: 0 });
        v.bubble = { text: ['Hoş mu?', 'Oğlum!', 'Porno ha?'][(v.cycle / 2 | 0) % 3], t: 50, type: 'say' };
      }
      break;
    case 'waitCase':
      if (!cases.length) { v.hasCase = true; v.state = 'idle'; v.t = 30; }
      break;
    case 'out':
      v.vis = Math.max(0, v.t / 22);
      if (v.t <= 0) {
        let nx; do { nx = rand(110, W - 120); } while (Math.abs(nx - px) < 220);
        v.x = nx; v.state = 'in'; v.t = 22;
      }
      break;
    case 'in':
      v.vis = 1 - Math.max(0, v.t / 22);
      if (v.t <= 0) { v.vis = 1; v.state = 'idle'; v.t = 45; burst(v.x + 30, AGY - 70, 14, { colors: ['#9ec7ff', '#fff'], max: 3, world: false }); }
      break;
    case 'tie':
      if (v.t <= 0) { v.state = 'idle'; v.t = 30; }
      break;
    case 'down':
      break;
  }
  // collisions
  if (v.state === 'tie') {
    const headTop = AGY - 146;
    const head = { x: vx - 30, y: headTop - 8, w: 60, h: 34 };
    if (P.vy > 0 && overlap(P, head) && P.y + P.h < headTop + 22) {
      P.vy = -12; v.hp--; v.flash = 30; SFX.stomp(); G.shake = 10;
      burst(vx, headTop, 18, { colors: ['#9ec7ff', '#fff'], max: 6, world: false });
      if (v.hp <= 0) { vuralDefeated(); return; }
      v.bubble = { text: ['', 'HOŞ MU LAN?!', 'OĞLUUUM!'][v.hp], t: 60, type: 'shout' };
      v.state = 'out'; v.t = 22;
    }
  } else if (v.vis > 0.6 && !['down'].includes(v.state) && overlap(P, { x: v.x + 8, y: v.y + 10, w: v.w - 16, h: v.h - 10 })) hurtPlayer();
}

function updClassExtras() {
  if (bossTitleT > 0) bossTitleT--;
  if (smirkT > 0) smirkT--;
  if (rageT > 0) rageT--;
  if (SK) { SK.t++; if (SK.flash > 0) SK.flash--; }
  if (arenaPhase !== 'vural') return;
  // evrak çantası (bumerang)
  for (const c of cases) {
    c.rot += 0.3;
    if (!c.back) { c.x += c.vx; c.vx -= c.dir * 0.14; if (Math.sign(c.vx) !== c.dir || c.x < 20 || c.x > W - 20) c.back = true; }
    else { const tx = boss.x + boss.w / 2, d = tx - c.x; c.x += clamp(d * 0.08, -9, 9) + Math.sign(d) * 2; if (Math.abs(d) < 12) c.dead = true; }
    if (overlap(P, { x: c.x - 18, y: c.y - 14, w: 36, h: 28 })) hurtPlayer();
  }
  cases = cases.filter(c => !c.dead);
  // Şükrü tavanda yavaşça geziyor ve geometri aletleri bırakıyor
  if (SK && SK.hang) {
    SK.x += SK.dir * 0.45; if (SK.x < 120 || SK.x > W - 190) SK.dir *= -1;
    const every = 150 - (3 - boss.hp) * 25;
    if (SK.t % every === 0) tools.push({ x: SK.x + 35, y: 150, vy: 0, kind: ['pergel', 'gonye', 'iletki'][(Math.random() * 3) | 0], rot: 0 });
  }
  for (const t of tools) {
    t.vy = Math.min(t.vy + 0.28, 9); t.y += t.vy; t.rot += 0.12;
    if (overlap(P, { x: t.x - 16, y: t.y - 16, w: 32, h: 32 })) { t.dead = true; hurtPlayer(); }
    if (t.y > AGY - 10) { t.dead = true; SFX.glass(); burst(t.x, AGY - 6, 10, { colors: ['#e8e8e8', '#ffd36a'], max: 3, up: 2, world: false }); }
  }
  tools = tools.filter(t => !t.dead);
}

function vuralDefeated() {
  const v = boss; v.state = 'down'; v.bubble = null; cases = []; tools = []; arenaPhase = 'vdown';
  setMusicVol(20);
  (async () => {
    await wait(60);
    await talk([say('vural', 'Hepiniz birer oğlumsunuz, gidin ve mezun olun.')]);
    for (let k = 0; k < 30; k++) { v.vis = 1 - k / 29; await wait(1); }
    burst(v.x + 30, AGY - 70, 30, { colors: ['#9ec7ff', '#fff'], max: 5, world: false }); SFX.boom();
    boss = null;
    await wait(60);
    setMusicVol(45);
    G.classDone = true; G.level = LEVELS.ch2;
    nextLevel();
  })();
}

// =========================================================
//                       DRAWING
// =========================================================
function drawClassroom() {
  ctx.fillStyle = '#3a060c'; ctx.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 48) { ctx.fillStyle = (x / 48) % 2 ? '#47080f' : '#3a060c'; ctx.fillRect(x, 0, 48, AGY); }
  ctx.fillStyle = '#d9ae4a'; ctx.fillRect(0, 300, W, 4); ctx.fillStyle = '#240406'; ctx.fillRect(0, 304, W, AGY - 304);
  // ceiling pipe for the sloth
  ctx.fillStyle = '#b8892c'; ctx.fillRect(0, 92, W, 8); ctx.fillStyle = '#e0b955'; ctx.fillRect(0, 92, W, 2);
  for (let x = 40; x < W; x += 160) { ctx.fillStyle = '#8a6420'; ctx.fillRect(x, 0, 6, 92); }
  // chalkboard
  ctx.fillStyle = '#b8892c'; ctx.fillRect(312, 140, 336, 170); ctx.fillStyle = '#1f3328'; ctx.fillRect(322, 150, 316, 150);
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(330, 160, 120, 40);
  if (board) {
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = '48px "Special Elite", monospace'; ctx.textAlign = 'left';
    ctx.translate(352, 245); ctx.rotate(-0.03); ctx.fillText(board, 0, 0); ctx.restore();
  }
  ctx.fillStyle = '#8a6420'; ctx.fillRect(330, 306, 300, 8);
  // window with curtains
  ctx.fillStyle = '#0b1230'; ctx.fillRect(740, 120, 150, 150); ctx.strokeStyle = '#d9ae4a'; ctx.lineWidth = 5; ctx.strokeRect(740, 120, 150, 150);
  ctx.fillStyle = '#7d0b14'; ctx.fillRect(722, 110, 30, 180); ctx.fillRect(878, 110, 30, 180);
  // door (left)
  ctx.fillStyle = '#2a1708'; ctx.fillRect(0, 290, 70, 180); ctx.fillStyle = '#d9ae4a'; ctx.fillRect(56, 380, 6, 6);
  ctx.fillStyle = '#e8d9be'; ctx.fillRect(8, 262, 54, 20); ctx.fillStyle = '#2a1708'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center'; ctx.fillText('9-A', 35, 276);
  // back-row desks (decor)
  for (let i = 0; i < 4; i++) { const x = 110 + i * 200; if (x > 280 && x < 640) continue; ctx.fillStyle = '#5a3d22'; ctx.fillRect(x, 408, 110, 10); ctx.fillRect(x + 8, 418, 8, 52); ctx.fillRect(x + 94, 418, 8, 52); }
  // floor
  ctx.fillStyle = '#2b140a'; ctx.fillRect(0, AGY, W, H - AGY);
  for (let i = 0; i < 20; i++) { ctx.fillStyle = 'rgba(255,200,120,.05)'; ctx.fillRect(i * 50, AGY, 2, H - AGY); }
  ctx.fillStyle = '#d9ae4a'; ctx.fillRect(0, AGY, W, 3);
}

function drawSloth(e) {
  const cx = e.x + e.w / 2;
  ctx.save();
  if (e.flash && Math.floor(e.flash / 3) % 2) ctx.filter = 'brightness(2)';
  if (e.hang) {
    // hanging from pipe: arms up
    const sw = Math.sin(G.t / 30) * 0.08;
    ctx.translate(cx, 96); ctx.rotate(sw);
    ctx.strokeStyle = '#7a6650'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-14, 40); ctx.lineTo(-18, 0); ctx.moveTo(14, 40); ctx.lineTo(18, 0); ctx.stroke();
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-22, 2); ctx.quadraticCurveTo(-18, -8, -12, 2); ctx.moveTo(14, 2); ctx.quadraticCurveTo(18, -8, 24, 2); ctx.stroke();
    ctx.fillStyle = '#8a7660'; ctx.beginPath(); ctx.ellipse(0, 72, 30, 38, 0, 0, 7); ctx.fill();
    slothFace(0, 46, e.angry);
    // legs dangling
    ctx.strokeStyle = '#7a6650'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-12, 104); ctx.lineTo(-16, 124); ctx.moveTo(12, 104); ctx.lineTo(16, 124); ctx.stroke();
  } else {
    const fy = e.y + e.h, ph = e.phase || 0, mv = e.moving ? 1 : 0;
    ctx.translate(cx, fy);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 2, 30, 5, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#7a6650'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-12, -24); ctx.lineTo(-14 + Math.sin(ph) * 5 * mv, -2); ctx.moveTo(12, -24); ctx.lineTo(14 - Math.sin(ph) * 5 * mv, -2); ctx.stroke();
    ctx.fillStyle = '#8a7660'; ctx.beginPath(); ctx.ellipse(0, -48, 30, 34, 0, 0, 7); ctx.fill();
    // long arms with claws, holding a ruler
    ctx.strokeStyle = '#7a6650'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(-24, -60); ctx.quadraticCurveTo(-40, -40, -34, -20); ctx.moveTo(24, -60); ctx.quadraticCurveTo(40, -40, 34, -20); ctx.stroke();
    ctx.fillStyle = '#e6c35a'; ctx.save(); ctx.translate(36 * e.facing, -24); ctx.rotate(-0.5 * e.facing); ctx.fillRect(-3, -30, 6, 50); ctx.restore();
    slothFace(0, -80, e.angry);
  }
  ctx.restore();
  if (e.angry && !e.hang && G.t % 12 === 0) burst(cx + rand(-10, 10), e.y - 30, 2, { colors: ['rgba(255,255,255,.7)'], max: 1.2, g: -0.05, size: 7, life: 30, world: false });
}
function slothFace(x, y, angry) {
  ctx.fillStyle = '#e8d6b8'; ctx.beginPath(); ctx.ellipse(x, y, 24, 20, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#5a4430'; ctx.beginPath(); ctx.ellipse(x - 10, y - 2, 9, 6, -0.4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 10, y - 2, 9, 6, 0.4, 0, 7); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x - 9, y - 2, 2.6, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x + 9, y - 2, 2.6, 0, 7); ctx.fill();
  // glasses
  ctx.strokeStyle = '#222'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(x - 9, y - 2, 7, 0, 7); ctx.moveTo(x + 16, y - 2); ctx.arc(x + 9, y - 2, 7, 0, 7); ctx.moveTo(x - 2, y - 2); ctx.lineTo(x + 2, y - 2); ctx.stroke();
  ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.ellipse(x, y + 6, 4, 3, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 1.8; ctx.beginPath();
  if (angry) { ctx.moveTo(x - 6, y + 13); ctx.quadraticCurveTo(x, y + 9, x + 6, y + 13); ctx.moveTo(x - 17, y - 12); ctx.lineTo(x - 4, y - 8); ctx.moveTo(x + 17, y - 12); ctx.lineTo(x + 4, y - 8); }
  else { ctx.moveTo(x - 6, y + 10); ctx.quadraticCurveTo(x, y + 14, x + 6, y + 10); }
  ctx.stroke();
}

function drawVural(v) {
  if (!v || v.vis <= 0.01) return;
  const cx = v.x + v.w / 2, fy = AGY;
  ctx.save(); ctx.globalAlpha = v.vis;
  if (v.flash && Math.floor(v.flash / 3) % 2) ctx.filter = 'brightness(2.2)';
  if (v.state === 'out' || v.state === 'in') { ctx.translate(cx, fy); ctx.scale(1 + (1 - v.vis) * 0.3, 1); ctx.translate(-cx, -fy); }
  ctx.translate(cx, fy); ctx.scale(0.85, 0.85); ctx.translate(-cx, -fy);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(cx, fy + 2, 30, 6, 0, 0, 7); ctx.fill();
  // legs
  ctx.fillStyle = '#1a2d4a'; rr(cx - 16, fy - 60, 13, 58, 4); ctx.fill(); rr(cx + 3, fy - 60, 13, 58, 4); ctx.fill();
  ctx.fillStyle = '#111'; rr(cx - 19, fy - 6, 18, 7, 3); ctx.fill(); rr(cx + 1, fy - 6, 18, 7, 3); ctx.fill();
  // suit
  ctx.fillStyle = '#1f3557'; rr(cx - 24, fy - 112, 48, 58, 10); ctx.fill();
  ctx.fillStyle = '#e9eef5'; ctx.beginPath(); ctx.moveTo(cx - 9, fy - 112); ctx.lineTo(cx + 9, fy - 112); ctx.lineTo(cx, fy - 84); ctx.fill();
  const tie = v.state === 'tie';
  ctx.fillStyle = '#7a1420'; ctx.save(); ctx.translate(cx, fy - 108); if (tie) ctx.rotate(Math.sin(G.t / 4) * 0.3);
  ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.lineTo(3, 30); ctx.lineTo(0, 34); ctx.lineTo(-3, 30); ctx.fill(); ctx.restore();
  // arms
  ctx.fillStyle = '#1f3557';
  if (tie) { rr(cx - 30, fy - 110, 10, 30, 5); ctx.fill(); rr(cx + 20, fy - 110, 10, 30, 5); ctx.fill(); ctx.fillStyle = '#e8c8a8'; ctx.beginPath(); ctx.arc(cx - 8, fy - 104, 5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 8, fy - 104, 5, 0, 7); ctx.fill(); }
  else { rr(cx - 32, fy - 108, 10, 50, 5); ctx.fill(); rr(cx + 22, fy - 108, 10, 50, 5); ctx.fill(); }
  // briefcase
  if (v.hasCase && !tie) drawCase(cx + v.facing * 30, fy - 46, 0);
  // head
  if (tie) { const gl = ctx.createRadialGradient(cx, fy - 140, 6, cx, fy - 140, 55); gl.addColorStop(0, `rgba(160,210,255,${0.5 + Math.sin(G.t / 4) * 0.3})`); gl.addColorStop(1, 'rgba(160,210,255,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, fy - 140, 55, 0, 7); ctx.fill(); }
  drawVuralHead(cx, fy - 140, 1, false);
  ctx.restore();
  if (!['intro', 'down'].includes(v.state) && arenaPhase === 'vural') drawBossBar('VURAL HOCA', v.hp, 3);
}
function drawCase(x, y, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#3a2412'; rr(-17, -12, 34, 24, 3); ctx.fill();
  ctx.strokeStyle = '#1a1008'; ctx.lineWidth = 2; ctx.strokeRect(-17, -12, 34, 24);
  ctx.strokeStyle = '#3a2412'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, -12); ctx.lineTo(-6, -17); ctx.lineTo(6, -17); ctx.lineTo(6, -12); ctx.stroke();
  ctx.fillStyle = '#d9ae4a'; ctx.fillRect(-12, -3, 4, 5); ctx.fillRect(8, -3, 4, 5);
  ctx.restore();
}
function drawTool(t) {
  ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.rot);
  ctx.strokeStyle = '#cfd6e0'; ctx.fillStyle = 'rgba(200,230,255,.55)'; ctx.lineWidth = 3;
  if (t.kind === 'pergel') { ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(-10, 16); ctx.moveTo(0, -18); ctx.lineTo(10, 16); ctx.stroke(); ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.arc(0, -18, 4, 0, 7); ctx.fill(); }
  else if (t.kind === 'gonye') { ctx.beginPath(); ctx.moveTo(-16, 14); ctx.lineTo(16, 14); ctx.lineTo(-16, -16); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0, 8, 18, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.restore();
  // falling shadow marker
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(t.x, AGY + 2, 14 + (t.y / AGY) * 6, 4, 0, 0, 7); ctx.fill();
}

function drawClassActors() {
  if (SK) drawSloth(SK);
  drawVural(boss && boss.type === 'vural' ? boss : null);
  for (const c of cases) drawCase(c.x, c.y, c.rot);
  for (const t of tools) drawTool(t);
}
function drawClassFront() {}
function drawClassOverlay() {
  if (rageT > 0) { ctx.fillStyle = `rgba(200,0,0,${0.35 * rageT / 100})`; ctx.fillRect(0, 0, W, H); }
  if (smirkT > 0) {
    const k = clamp((150 - smirkT) / 20, 0, 1);
    ctx.fillStyle = `rgba(0,0,0,${0.75 * k})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = k; ctx.translate(W / 2, H / 2 - 20); const s = 0.9 + k * 0.1 + (150 - smirkT) * 0.0008; ctx.scale(s, s);
    drawFace('dgc', 0, 0, 110);
    ctx.restore();
    ctx.globalAlpha = k; ctx.fillStyle = '#fff'; ctx.font = 'italic 26px "DM Serif Display", serif'; ctx.textAlign = 'center';
    ctx.fillText('* hafif sırıtır *', W / 2, H / 2 + 135); ctx.globalAlpha = 1;
  }
  if (bossTitleT > 0) {
    const a = clamp(bossTitleT / 30, 0, 1);
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, H / 2 - 60, W, 120);
    ctx.fillStyle = '#ffe14a'; ctx.font = '64px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('BOSS: VURAL HOCA', W / 2, H / 2 + 10);
    ctx.fillStyle = '#fff'; ctx.font = '600 15px Inter'; ctx.fillText('Kravatını düzeltirken kafasına zıpla. Çantaya ve tavandan düşenlere dikkat!', W / 2, H / 2 + 42);
    ctx.globalAlpha = 1;
  }
  if (boss && boss.type === 'vural' && boss.state === 'tie' && boss.hp === 3) { ctx.fillStyle = '#fff'; ctx.font = '20px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('KRAVATINI DÜZELTİYOR → KAFASINA ZIPLA!', W / 2, 90); }
}
