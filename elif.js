/* =========================================================
   MBDTF 2. BOSS: Elif Hoca (fizik) — matador + rodeo
   ========================================================= */
'use strict';

let apples = [], oles = [], cape = null, elifTitleT = 0, RODEO = null, dropPhoto = null;
const ELIF_MEMORY = { photo: 'ch2b', lines: [] };   // fotoğraf gelince doldurulacak

function makeElif() {
  boss = { type: 'elif', x: W + 40, y: AGY - 92, w: 58, h: 92, hp: 3, state: 'intro', t: 0, facing: -1, vx: 0, flash: 0, bubble: null, cycle: 0, moving: false, phase: 0, buck: 0, passed: false };
}

function startElifFight() {
  G.mode = 'boss'; G.arena = 'plaza'; G.camX = 0; parts = []; projs = []; waves = []; apples = []; oles = []; RODEO = null; dropPhoto = null;
  if (typeof cases !== 'undefined') { cases = []; tools = []; SK = null; }
  if (typeof YU !== 'undefined') YU = null;
  slipper = null; doorOpen = false; elifTitleT = 0; cape = null;
  P.x = 230; P.y = AGY - P.h; P.vx = P.vy = 0; P.facing = 1; P.hp = 3; P.blink = 0; P.dizzy = 0;
  B.active = true; B.x = 24; B.y = AGY - B.h; B.facing = 1; B.moving = false; B.bubble = null; B.hop = 0; B.noMentos = false;
  makeElif(); arenaPhase = 'ecut';
  (async () => {
    await wait(60);
    await walkTo(boss, 720, 2.2); boss.facing = -1; boss.moving = false;
    boss.state = 'paw'; boss.t = 9999;
    await wait(40);
    await talk([say('bot', 'SMASH.', 'shout')]);
    await talk([say('dgc', 'ARRİBAAA!', 'shout')]);
    // bot pelerini fırlatıyor
    B.hop = -14; setTimeout(() => B.hop = 0, 300);
    cape = { x: B.x + 20, y: B.y + 10, t: 0, held: false };
    B.bubble = { text: 'Pelerin!', t: 80, type: 'say' };
    await wait(45);
    cape.held = true; SFX.pick();
    await wait(30);
    boss.state = 'idle'; boss.t = 70; arenaPhase = 'elif'; elifTitleT = 140;
  })();
}
function resetElifFight() {
  apples = []; oles = []; RODEO = null;
  makeElif(); boss.x = 720; boss.state = 'idle'; boss.t = 70; arenaPhase = 'elif';
  if (cape) cape.held = true;
}

function updElif() {
  const e = boss;
  if (e.flash > 0) e.flash--;
  if (e.bubble) { e.bubble.t--; if (e.bubble.t <= 0) e.bubble = null; }
  if (e.state === 'intro' || e.state === 'down') return;
  if (e.state === 'rodeo') { updRodeo(); return; }
  e.t--;
  const px = P.x + P.w / 2, ex = e.x + e.w / 2, hurt = 3 - e.hp;
  switch (e.state) {
    case 'idle':
      e.facing = px < ex ? -1 : 1; e.buck = 0;
      if (e.t <= 0) {
        const nx = ['paw', 'paw', 'apples'][e.cycle++ % 3];
        if (nx === 'paw') { e.state = 'paw'; e.t = 60 - hurt * 8; e.bubble = { text: 'Hıııı!', t: 45, type: 'say' }; }
        else { e.state = 'apples'; e.n = 5 + hurt * 2; e.t = 30; e.bubble = { text: 'YERÇEKİMİ!', t: 70, type: 'shout' }; SFX.boom(); }
      }
      break;
    case 'paw':
      if (arenaPhase !== 'elif') break;
      e.facing = px < ex ? -1 : 1;
      if (G.t % 6 === 0) burst(ex - e.facing * 14, AGY - 4, 3, { colors: ['#e2c08a', '#c9a06a'], max: 3, up: 2, world: false });
      if (G.t % 10 === 0) steam(e);
      if (e.t <= 0) { e.state = 'charge'; e.vx = e.facing * (8.5 + hurt * 1.3); e.passed = false; e.startSide = Math.sign(px - ex); SFX.boom(); }
      break;
    case 'charge': {
      e.x += e.vx;
      if (G.t % 3 === 0) burst(ex, AGY - 4, 3, { colors: ['#e2c08a'], max: 3, up: 2, world: false });
      if (G.t % 8 === 0) steam(e);
      if (!e.passed && Math.sign(px - ex) !== e.startSide) { e.passed = true; oles.push({ text: 'OLÉ!', x: px, y: P.y - 30, t: 60 }); SFX.pick(); }
      if (e.x <= 100 || e.x + e.w >= W - 22) {
        const wx = e.vx < 0 ? 100 : W - 22;
        e.x = clamp(e.x, 100, W - 22 - e.w); e.vx = 0;
        e.state = 'stun'; e.t = 170 - hurt * 20; G.shake = 14; SFX.sap();
        burst(wx, AGY - 60, 24, { colors: ['#fff', '#ffd36a'], max: 6, world: false });
        e.bubble = { text: 'AH!', t: 40, type: 'shout' };
      } else if (overlap(P, { x: e.x + 6, y: e.y + 10, w: e.w - 12, h: e.h - 10 })) hurtPlayer();
      break;
    }
    case 'apples':
      if (e.t <= 0 && e.n > 0) {
        e.n--; e.t = Math.max(14, 24 - hurt * 3);
        apples.push({ x: clamp(px + rand(-150, 150), 40, W - 40), y: -30, vy: 0, rot: rand(0, 6) });
      } else if (e.t <= 0) { e.state = 'idle'; e.t = 50; }
      break;
    case 'stun':
      if (P.vy > 0 && overlap(P, { x: e.x - 8, y: e.y - 16, w: e.w + 16, h: 34 }) && P.y + P.h < e.y + 22) { startRodeo(); break; }
      if (e.t <= 0) { e.state = 'idle'; e.t = 40; }
      break;
  }
}
function steam(e) {
  const nx = e.x + e.w / 2 + e.facing * 16, ny = e.y + 18;
  for (let k = 0; k < 3; k++) parts.push({ x: nx, y: ny, vx: e.facing * rand(0.5, 1.6) + rand(-.3, .3), vy: -rand(0.3, 1), life: 34, max: 34, c: 'rgba(255,255,255,.75)', s: rand(4, 7), g: -0.01, world: false });
}

function startRodeo() {
  const e = boss, hurt = 3 - e.hp;
  e.state = 'rodeo'; arenaPhase = 'rodeo';
  RODEO = { t: 0, dur: 230 + hurt * 25, bal: 0, bv: 0, kick: 30 };
  SFX.boom(); G.shake = 8;
  oles.push({ text: 'ARRİBA ARRİBA!', x: W / 2, y: 150, t: 9999, big: true });
}
function updRodeo() {
  const e = boss, R = RODEO, hurt = 3 - e.hp;
  R.t++;
  e.vx = Math.sin(R.t / 22) * (3 + hurt * 0.6);
  e.x = clamp(e.x + e.vx, 110, W - 40 - e.w); e.facing = e.vx >= 0 ? 1 : -1;
  e.buck = Math.abs(Math.sin(R.t / 6)) * 10;
  if (--R.kick <= 0) { R.kick = (rand(28, 48) - hurt * 4) | 0; R.bv += (Math.random() < 0.5 ? -1 : 1) * rand(0.018, 0.028 + hurt * 0.006); if (G.t % 2) steam(e); }
  if (held('arrowleft', 'a')) R.bv -= 0.0028;
  if (held('arrowright', 'd')) R.bv += 0.0028;
  R.bv += R.bal * 0.0012; R.bv *= 0.97; R.bal += R.bv;
  P.x = e.x + e.w / 2 - P.w / 2 + R.bal * 16; P.y = e.y - P.h + 30 - e.buck; P.vx = P.vy = 0; P.facing = e.facing; P.moving = false;
  if (G.t % 40 === 0) oles.push({ text: ['ARRİBA!', 'OLÉ!', 'YİHAA!'][(G.t / 40 | 0) % 3], x: rand(200, W - 200), y: rand(110, 200), t: 50 });
  if (Math.abs(R.bal) >= 1) {
    // düştü
    const dir = Math.sign(R.bal);
    endRodeo(); e.state = 'idle'; e.t = 60;
    P.x = clamp(P.x + dir * 60, 0, W - P.w); P.vy = -9; P.blink = 0; hurtPlayer();
    B.bubble = { text: 'Sıkı tutun lan!', t: 90, type: 'say' };
    return;
  }
  if (R.t >= R.dur) {
    endRodeo();
    e.hp--; e.flash = 30; SFX.stomp(); G.shake = 10;
    burst(e.x + e.w / 2, e.y, 24, { colors: ['#ffe36a', '#fff'], max: 6, world: false });
    P.vy = -11; P.x = clamp(e.x - 70 * e.facing, 0, W - P.w);
    if (e.hp <= 0) { elifDefeated(); return; }
    e.state = 'idle'; e.t = 80;
    e.bubble = { text: ['', 'İNİN ÜSTÜMDEN!', 'Ömer, derste de yapmıştın bunu!'][e.hp], t: 90, type: 'shout' };
  }
}
function endRodeo() { RODEO = null; arenaPhase = 'elif'; boss.buck = 0; oles = oles.filter(o => !o.big); }

function updPlazaExtras() {
  if (elifTitleT > 0) elifTitleT--;
  for (const o of oles) { o.t--; o.y -= o.big ? 0 : 0.6; }
  oles = oles.filter(o => o.t > 0);
  if (dropPhoto && !dropPhoto.landed) { dropPhoto.vy += 0.3; dropPhoto.y += dropPhoto.vy; dropPhoto.rot += 0.08; if (dropPhoto.y >= AGY - 6) { dropPhoto.y = AGY - 6; dropPhoto.landed = true; dropPhoto.rot = 0.2; SFX.pick(); } }
  if (G.modal) { if (advancePressed() && G.memKey) G.memKey(); return; }
  if (arenaPhase !== 'elif') return;
  for (const a of apples) {
    a.vy += 0.32; a.y += a.vy; a.rot += 0.1;
    if (overlap(P, { x: a.x - 12, y: a.y - 12, w: 24, h: 24 })) { a.dead = true; hurtPlayer(); burst(a.x, a.y, 10, { colors: ['#d62b2b', '#fff'], max: 4, world: false }); }
    if (a.y > AGY - 10) { a.dead = true; burst(a.x, AGY - 6, 10, { colors: ['#d62b2b', '#f6e6a0'], max: 4, up: 2, world: false }); SFX.stomp(); }
  }
  apples = apples.filter(a => !a.dead);
}

function elifDefeated() {
  const e = boss; e.state = 'down'; e.bubble = null; apples = []; RODEO = null; arenaPhase = 'edown';
  oles = [{ text: 'OLÉ!!!', x: W / 2, y: 160, t: 140, big: true }];
  setMusicVol(20);
  (async () => {
    await wait(60);
    await talk([say('elif', 'Bu... bu fizik kurallarına aykırı...', 'slow')]);
    if (PHOTOS[ELIF_MEMORY.photo]) {
      dropPhoto = { x: e.x + e.w / 2, y: e.y + 10, vy: -7, rot: 0, landed: false };
      await new Promise(r => { (function chk() { if (dropPhoto.landed) r(); else wait(2).then(chk); })(); });
      await wait(40);
      await talk([say('bot', 'Üstünden bi şey düştü...')]);
      openMemory(ELIF_MEMORY);
      await new Promise(r => { (function chk() { if (!G.modal) r(); else wait(5).then(chk); })(); });
      dropPhoto = null;
    }
    await wait(40);
    setMusicVol(45);
    G.elifDone = true; G.level = LEVELS.ch2;
    nextLevel();
  })();
}

// ---------- speaker ----------
const _speakerPosE = speakerPos;
speakerPos = function (who) {
  if (who === 'elif' && boss && boss.type === 'elif') return { x: boss.x + boss.w / 2, y: boss.y - 42 - (boss.buck || 0) };
  return _speakerPosE(who);
};

// ---------- drawing ----------
function drawPlaza() {
  // gökyüzü
  const g = ctx.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, '#f08a3c'); g.addColorStop(1, '#ffd08a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 260);
  // tribünler
  for (let r = 0; r < 6; r++) {
    const y = 130 + r * 28;
    ctx.fillStyle = r % 2 ? '#8e1b1b' : '#a52323'; ctx.fillRect(0, y, W, 28);
    for (let x = 8 + (r % 2) * 12; x < W; x += 24) {
      const bob = Math.sin(G.t / 8 + x * 0.3 + r) * (arenaPhase === 'rodeo' || oles.length ? 3 : 1);
      ctx.fillStyle = ['#2b1d16', '#4a3020', '#f2c9a0', '#1d1d24'][(x * 7 + r * 3) % 4]; ctx.beginPath(); ctx.arc(x, y + 10 + bob, 7, 0, 7); ctx.fill();
      ctx.fillStyle = ['#ffd36a', '#fff', '#3a6fd8', '#e94f4f'][(x + r) % 4]; ctx.fillRect(x - 7, y + 16 + bob, 14, 10);
    }
  }
  // bayraklar
  for (let i = 0; i < 12; i++) { const x = 40 + i * 80; ctx.fillStyle = i % 2 ? '#ffd23a' : '#d61f1f'; ctx.beginPath(); ctx.moveTo(x, 118); ctx.lineTo(x + 40, 118); ctx.lineTo(x + 20, 134); ctx.fill(); }
  ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 118); ctx.lineTo(W, 118); ctx.stroke();
  // bariyer
  ctx.fillStyle = '#b3201f'; ctx.fillRect(0, 300, W, AGY - 300);
  ctx.fillStyle = '#f2c230'; ctx.fillRect(0, 300, W, 8); ctx.fillRect(0, 380, W, 6);
  for (let x = 0; x < W; x += 120) { ctx.fillStyle = '#8a1716'; ctx.fillRect(x, 308, 4, AGY - 308); }
  // fizik tahtası
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(386, 316, 188, 58); ctx.fillStyle = '#1f3b2c'; ctx.fillRect(392, 322, 176, 46);
  ctx.fillStyle = '#e8f0e8'; ctx.font = '22px "Special Elite", monospace'; ctx.textAlign = 'center'; ctx.fillText('F = m · a', 480, 352);
  // kum
  ctx.fillStyle = '#e2c08a'; ctx.fillRect(0, AGY, W, H - AGY);
  ctx.fillStyle = '#d2ad74'; for (let k = 0; k < 40; k++) ctx.fillRect((k * 97) % W, AGY + 8 + (k * 37) % (H - AGY - 10), 6, 2);
}

function drawPlazaActors() {
  if (dropPhoto) {
    ctx.save(); ctx.translate(dropPhoto.x, dropPhoto.y - 12); ctx.rotate(dropPhoto.rot);
    ctx.fillStyle = '#fbf8f1'; ctx.fillRect(-16, -18, 32, 38); ctx.fillStyle = '#556'; ctx.fillRect(-12, -14, 24, 24);
    ctx.restore();
    if (dropPhoto.landed) { ctx.globalAlpha = 0.5 + Math.sin(G.t / 6) * 0.3; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(dropPhoto.x, dropPhoto.y - 12, 30, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  }
  if (boss && boss.type === 'elif') drawElif(boss);
  for (const a of apples) drawApple(a);
}

function drawPlazaOverlay() {
  // burladero (bot'un saklandığı siper)
  ctx.fillStyle = '#8a5a2a'; ctx.fillRect(14, AGY - 58, 86, 58);
  ctx.fillStyle = '#6e4520'; for (let k = 0; k < 4; k++) ctx.fillRect(14, AGY - 58 + k * 15, 86, 2);
  ctx.fillStyle = '#d61f1f'; ctx.fillRect(14, AGY - 62, 86, 6); ctx.fillStyle = '#f2c230'; ctx.fillRect(14, AGY - 56, 86, 3);
  // pelerin
  if (cape) {
    let cx, cy;
    if (!cape.held) { cape.t++; const k = Math.min(1, cape.t / 45); cx = cape.x + (P.x + P.w / 2 - cape.x) * k; cy = cape.y - Math.sin(k * Math.PI) * 120 + (P.y + 34 - cape.y) * k; }
    if (cape.held) {
      if (arenaPhase === 'rodeo') { cx = P.x + P.w / 2 + 22; cy = P.y - 44; }
      else { cx = P.x + P.w / 2 + P.facing * 22; cy = P.y + 30; }
    }
    const fl = Math.sin(G.t / 5) * 6;
    ctx.save(); ctx.translate(cx, cy);
    if (cape.held && arenaPhase === 'rodeo') ctx.rotate(G.t / 4);
    ctx.fillStyle = '#d61f1f'; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(P.facing * 26, -2 + fl * 0.3); ctx.quadraticCurveTo(P.facing * 34, 18, P.facing * 22 + fl, 30); ctx.lineTo(-P.facing * 4, 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd23a'; ctx.fillRect(-3, -8, 6, 4);
    ctx.restore();
  }
  // olé yazıları
  for (const o of oles) {
    ctx.save(); ctx.globalAlpha = clamp(o.t / 20, 0, 1);
    const s = o.big ? 1 + Math.sin(G.t / 4) * 0.08 : 1;
    ctx.translate(o.x, o.y); ctx.scale(s, s); ctx.rotate(-0.06);
    ctx.font = (o.big ? 64 : 34) + 'px Bangers, Impact'; ctx.textAlign = 'center'; ctx.lineWidth = o.big ? 8 : 5;
    ctx.strokeStyle = '#7a0d0d'; ctx.strokeText(o.text, 0, 0); ctx.fillStyle = '#ffd23a'; ctx.fillText(o.text, 0, 0);
    ctx.restore();
  }
  // denge göstergesi
  if (RODEO) {
    const bx = W / 2 - 150, by = 214;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; rr(bx - 10, by - 10, 320, 30, 10); ctx.fill();
    ctx.fillStyle = '#6b1515'; ctx.fillRect(bx, by, 300, 10);
    ctx.fillStyle = '#3c8a3c'; ctx.fillRect(bx + 90, by, 120, 10);
    ctx.fillStyle = '#fff'; ctx.fillRect(bx + 150 + RODEO.bal * 150 - 3, by - 4, 6, 18);
    ctx.fillStyle = '#ffd23a'; ctx.fillRect(bx, by + 12, 300 * Math.min(1, RODEO.t / RODEO.dur), 3);
    ctx.fillStyle = '#fff'; ctx.font = '18px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('← →  DENGEDE KAL!', W / 2, by + 36);
  }
  if (boss && boss.type === 'elif' && !['intro', 'down'].includes(boss.state) && arenaPhase !== 'ecut') drawBossBar('ELİF HOCA', boss.hp, 3);
  if (elifTitleT > 0) {
    const a = clamp(elifTitleT / 20, 0, 1) * clamp((140 - elifTitleT) / 15, 0, 1);
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, H / 2 - 50, W, 100);
    ctx.fillStyle = '#ffd23a'; ctx.font = '58px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('BOSS: ELİF HOCA', W / 2, H / 2 + 4);
    ctx.fillStyle = '#fff'; ctx.font = '18px Bangers, Impact'; ctx.fillText('ÜSTÜNDEN ATLA, DUVARA ÇARPSIN → SIRTINA ZIPLA!', W / 2, H / 2 + 34);
    ctx.globalAlpha = 1;
  }
  if (boss && boss.type === 'elif' && boss.state === 'stun' && boss.hp === 3) { ctx.fillStyle = '#fff'; ctx.font = '20px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('SERSEMLEDİ → SIRTINA ZIPLA!', W / 2, 90); }
  if (boss && boss.type === 'elif' && boss.state === 'paw' && boss.hp === 3 && arenaPhase === 'elif') { ctx.fillStyle = '#fff'; ctx.font = '20px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('KOŞMAYA HAZIRLANIYOR → ÜSTÜNDEN ATLA!', W / 2, 90); }
}

function drawApple(a) {
  ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot);
  ctx.fillStyle = '#d62b2b'; ctx.beginPath(); ctx.arc(-5, 0, 10, 0, 7); ctx.arc(5, 0, 10, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(-6, -4, 3, 0, 7); ctx.fill();
  ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(1, -15); ctx.stroke();
  ctx.fillStyle = '#3c9a3c'; ctx.beginPath(); ctx.ellipse(6, -13, 6, 3, -0.4, 0, 7); ctx.fill();
  ctx.restore();
}

function drawElif(e) {
  const cx = e.x + e.w / 2, fy = e.y + e.h, f = e.facing;
  const st = e.state;
  ctx.save();
  if (e.flash && Math.floor(e.flash / 3) % 2) ctx.filter = 'brightness(2.2)';
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(cx, AGY + 2, 30, 6, 0, 0, 7); ctx.fill();
  ctx.translate(cx, fy - (e.buck || 0));
  if (st === 'charge' || st === 'paw') ctx.rotate(f * (st === 'charge' ? 0.42 : 0.2));
  if (st === 'rodeo') ctx.rotate(Math.sin(G.t / 6) * 0.25);
  if (st === 'down') ctx.rotate(-f * 0.3);
  ctx.scale(f * 1.12, 1.12);
  const run = st === 'charge' ? Math.sin(G.t / 2) * 9 : (e.moving ? Math.sin(e.phase) * 6 : (st === 'paw' ? Math.sin(G.t / 3) * 6 : 0));
  // bacaklar
  ctx.fillStyle = '#2a2a38'; rr(-12 + run * 0.4, -30, 10, 30, 4); ctx.fill(); rr(2 - run * 0.4, -30, 10, 30, 4); ctx.fill();
  ctx.fillStyle = '#111'; rr(-14 + run * 0.4, -5, 14, 6, 3); ctx.fill(); rr(1 - run * 0.4, -5, 14, 6, 3); ctx.fill();
  // önlük
  ctx.fillStyle = '#f6f6f2'; ctx.beginPath(); ctx.moveTo(-15, -64); ctx.lineTo(15, -64); ctx.lineTo(20, -22); ctx.lineTo(-20, -22); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c9c9c4'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#3a4a6a'; ctx.beginPath(); ctx.moveTo(-5, -64); ctx.lineTo(5, -64); ctx.lineTo(2, -40); ctx.lineTo(-2, -40); ctx.fill();
  ctx.strokeStyle = '#c9c9c4'; ctx.strokeRect(6, -46, 9, 9); ctx.fillStyle = '#2a5ad8'; ctx.fillRect(9, -50, 2, 8);
  // kollar
  ctx.strokeStyle = '#f6f6f2'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  const armUp = st === 'apples' ? -1 : 0, back = st === 'charge' ? 1 : 0;
  ctx.beginPath(); ctx.moveTo(-12, -60); ctx.lineTo(-18 - back * 8, -40 + armUp * 34 - back * 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, -60); ctx.lineTo(18 - back * 22, -40 + armUp * 34 - back * 2); ctx.stroke();
  ctx.fillStyle = '#f0c8a0'; ctx.beginPath(); ctx.arc(-18 - back * 8, -38 + armUp * 34 - back * 4, 4, 0, 7); ctx.arc(18 - back * 22, -38 + armUp * 34 - back * 2, 4, 0, 7); ctx.fill();
  // kafa
  const hy = -78;
  ctx.fillStyle = '#f0c8a0'; ctx.beginPath(); ctx.arc(0, hy, 15, 0, 7); ctx.fill();
  // saç (siyah) + iki kuyruk boynuz gibi
  ctx.fillStyle = '#121214'; ctx.beginPath(); ctx.arc(0, hy - 3, 15.5, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-15, hy - 2); ctx.quadraticCurveTo(-4, hy - 8, 6, hy - 10); ctx.lineTo(15, hy - 4); ctx.lineTo(15, hy - 12); ctx.quadraticCurveTo(0, hy - 22, -15, hy - 10); ctx.fill();
  const wob = st === 'rodeo' ? Math.sin(G.t / 3) * 6 : Math.sin(G.t / 10) * 2;
  ctx.strokeStyle = '#121214'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-13, hy - 8); ctx.quadraticCurveTo(-30, hy - 10, -32 + wob, hy - 30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(13, hy - 8); ctx.quadraticCurveTo(30, hy - 10, 32 - wob, hy - 30); ctx.stroke();
  ctx.fillStyle = '#d61f1f'; ctx.beginPath(); ctx.arc(-17, hy - 9, 3.5, 0, 7); ctx.arc(17, hy - 9, 3.5, 0, 7); ctx.fill();
  // gözlük + gözler
  const angry = st === 'paw' || st === 'charge' || st === 'rodeo';
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(-1, hy + 1, 5.5, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(11, hy + 1, 5.5, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4.5, hy + 1); ctx.lineTo(5.5, hy + 1); ctx.stroke();
  if (st === 'stun' || st === 'down') {
    ctx.lineWidth = 1.5; [[-1, hy + 1], [11, hy + 1]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 2.5, G.t / 4, G.t / 4 + 5); ctx.stroke(); });
  } else {
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, hy + 2, 1.8, 0, 7); ctx.arc(12, hy + 2, 1.8, 0, 7); ctx.fill();
  }
  if (angry) { ctx.strokeStyle = '#121214'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-6, hy - 8); ctx.lineTo(3, hy - 5); ctx.moveTo(16, hy - 8); ctx.lineTo(8, hy - 5); ctx.stroke(); }
  // ağız
  ctx.strokeStyle = '#7a2a2a'; ctx.lineWidth = 2; ctx.beginPath();
  if (st === 'charge' || st === 'rodeo') { ctx.fillStyle = '#5a1515'; ctx.ellipse(7, hy + 10, 4, 3, 0, 0, 7); ctx.fill(); }
  else if (angry) { ctx.moveTo(2, hy + 10); ctx.lineTo(11, hy + 9); ctx.stroke(); }
  else { ctx.arc(7, hy + 7, 4, 0.2, Math.PI - 0.2); ctx.stroke(); }
  ctx.restore();
  if (st === 'stun' || st === 'down') { ctx.font = '18px "Segoe UI Emoji"'; ctx.textAlign = 'center'; for (let i = 0; i < 3; i++) { const t = G.t / 8 + i * 2.1; ctx.fillText('⭐', cx + Math.cos(t) * 30, e.y - 8 + Math.sin(t) * 6); } }
}
