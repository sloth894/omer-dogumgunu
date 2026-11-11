/* =========================================================
   CHAPTER 1 FİNALİ: Boss Can (garson babun) + Tiki tikici Yusuf
   ========================================================= */
'use strict';

let YU = null;                 // Yusuf Akif Aydın
let qs = [], peels = [];       // soru baloncukları, muz kabukları
let canTitleT = 0;
const YUSUF_PAL = { bag: '#7a3b2a', bag2: '#5a2a1d', polo: '#a9bccb', hood: '#3a4150', c1: null, c2: null };
const QUESTIONS = ['Ne?', 'Nasıl yani?', 'Anlamadım', 'Bi daha anlat', 'Hı?', 'Neden?', 'Ne dedin?', 'Yani?'];

function makeCan() {
  boss = { type: 'can', x: 700, y: AGY - 110, w: 70, h: 110, hp: 3, state: 'intro', t: 0, facing: -1, vx: 0, vy: 0, cycle: 0, flash: 0, bubble: null, load: 0, n: 0, crouch: 0 };
}

function startCanFight() {
  G.mode = 'boss'; G.arena = 'early'; G.camX = 0; parts = []; projs = []; waves = []; qs = []; peels = [];
  if (typeof cases !== 'undefined') { cases = []; tools = []; SK = null; }
  slipper = null; doorOpen = false; canTitleT = 0;
  P.x = 270; P.y = AGY - P.h; P.vx = P.vy = 0; P.facing = 1; P.hp = 3; P.blink = 0; P.dizzy = 0;
  B.active = true; B.x = 200; B.y = AGY - B.h; B.facing = 1; B.moving = false; B.bubble = null; B.hop = 0; B.noMentos = false;
  YU = null; makeCan(); arenaPhase = 'cut';
  (async () => {
    await wait(50);
    await talk([say('bot', 'Tiki tikici agalar burada mı?')]);
    YU = { x: -50, y: AGY - 62, w: 30, h: 62, facing: 1, moving: true, phase: 0, onGround: true, noMentos: true };
    await walkTo(YU, 120, 2.4); YU.facing = 1;
    B.facing = -1;
    await talk([say('bot', 'Geldi işte benim dostum.')]);
    B.facing = 1;
    G.shake = 12; SFX.boom();
    await talk([say('can', 'SEEEEEEEEEN!', 'shout')]);
    await talk([say('yusuf', 'İnek, süüt, sü-süt nereden çıkar? Eheheheeee... memeden! M-me me mememeee')]);
    await talk([say('dgc', 'M-me-meme meme'), say('dgc', 'Yeteri kadar bekledik, savaş başlasın amunagoyum')]);
    boss.state = 'idle'; boss.t = 110; arenaPhase = 'can'; canTitleT = 120;
  })();
}
function resetCanFight() {
  qs = []; peels = [];
  makeCan(); boss.state = 'idle'; boss.t = 60; arenaPhase = 'can';
}

function updCan() {
  const c = boss;
  if (c.flash > 0) c.flash--;
  if (c.bubble) { c.bubble.t--; if (c.bubble.t <= 0) c.bubble = null; }
  if (c.state === 'intro' || c.state === 'down') return;
  c.t--;
  const px = P.x + P.w / 2, cx = c.x + c.w / 2, hurtLvl = 3 - c.hp;
  const seq = ['questions', 'leap', 'banana', 'loading'];
  switch (c.state) {
    case 'idle':
      c.facing = px < cx ? -1 : 1;
      if (c.t <= 0) {
        const nx = seq[c.cycle % seq.length]; c.cycle++;
        if (nx === 'questions') { c.state = 'questions'; c.n = 5 + hurtLvl; c.t = 20; }
        if (nx === 'leap') { c.state = 'crouch'; c.t = 34; c.bubble = { text: 'UUA UUA!', t: 40, type: 'shout' }; SFX.boom(); }
        if (nx === 'banana') { c.state = 'banana'; c.n = 2 + hurtLvl; c.t = 20; }
        if (nx === 'loading') { c.state = 'loading'; c.t = 200 - hurtLvl * 25; c.load = 0; c.bubble = { text: '...', t: 60, type: 'say' }; }
      }
      break;
    case 'questions':
      if (c.t <= 0 && c.n > 0) {
        c.n--; c.t = Math.max(18, 30 - hurtLvl * 5);
        const txt = QUESTIONS[(Math.random() * QUESTIONS.length) | 0];
        const ox = cx + c.facing * 20, oy = c.y + 10, tx = px + rand(-50, 50), fl = rand(46, 60);
        qs.push({ x: ox, y: oy, vx: (tx - ox) / fl, vy: -8.5 - rand(0, 2), txt, rot: rand(-.2, .2) });
        SFX.blip();
      } else if (c.t <= 0) { c.state = 'idle'; c.t = 40; }
      break;
    case 'crouch':
      c.crouch = 1;
      if (c.t <= 0) { c.crouch = 0; c.state = 'leapAir'; c.vy = -15; c.vx = clamp((px - cx) / 52, -8, 8); }
      break;
    case 'leapAir':
      c.vy += 0.6; c.y += c.vy; c.x = clamp(c.x + c.vx, 90, W - 20 - c.w);
      if (c.y >= AGY - c.h) { c.y = AGY - c.h; G.shake = 12; SFX.boom(); burst(c.x + c.w / 2, AGY, 20, { colors: ['#c9a06a', '#fff'], max: 5, up: 2 }); c.state = 'idle'; c.t = 45; }
      break;
    case 'banana':
      if (c.t <= 0 && c.n > 0) {
        c.n--; c.t = 26;
        const tx = clamp(px + rand(-120, 120), 110, W - 60), ox = cx, fl = 50;
        peels.push({ x: ox, y: c.y + 30, vx: (tx - ox) / fl, vy: -9, air: true, life: 420, rot: 0 });
      } else if (c.t <= 0) { c.state = 'idle'; c.t = 40; }
      break;
    case 'loading':
      if (G.t % 25 === 0 && c.load < 9) c.load++;
      if (c.t <= 0) { c.state = 'idle'; c.t = 30; c.bubble = { text: 'Hı?', t: 50, type: 'say' }; }
      break;
  }
  // collisions
  if (c.state === 'loading') {
    const headTop = AGY - 126;
    const head = { x: cx - 32, y: headTop - 8, w: 64, h: 34 };
    if (P.vy > 0 && overlap(P, head) && P.y + P.h < headTop + 22) {
      P.vy = -12; c.hp--; c.flash = 30; SFX.stomp(); G.shake = 10;
      burst(cx, headTop, 18, { colors: ['#ffe36a', '#fff'], max: 6 });
      if (c.hp <= 0) { canDefeated(); return; }
      c.bubble = { text: ['', 'ANLAMADIM!', 'NOLUYO?!'][c.hp], t: 60, type: 'shout' };
      c.state = 'idle'; c.t = 50;
    }
  } else if (overlap(P, { x: c.x + 10, y: c.y + 20, w: c.w - 20, h: c.h - 20 })) hurtPlayer();
}

function updEarlyExtras() {
  if (canTitleT > 0) canTitleT--;
  if (arenaPhase !== 'can') return;
  for (const q of qs) {
    q.vy += 0.38; q.x += q.vx; q.y += q.vy;
    if (overlap(P, { x: q.x - 26, y: q.y - 14, w: 52, h: 28 })) { q.dead = true; hurtPlayer(); }
    if (q.y > AGY - 12) { q.dead = true; burst(q.x, AGY - 10, 8, { colors: ['#fff'], max: 3, up: 1 }); }
  }
  qs = qs.filter(q => !q.dead);
  for (const p of peels) {
    if (p.air) { p.vy += 0.38; p.x += p.vx; p.y += p.vy; p.rot += 0.3; if (p.y >= AGY - 6) { p.y = AGY - 6; p.air = false; p.rot = 0; } }
    else {
      p.life--;
      if (P.onGround && P.blink === 0 && overlap(P, { x: p.x - 14, y: AGY - 10, w: 28, h: 10 })) {
        p.life = 0; hurtPlayer(); P.vx = 0; P.x += P.facing * 30;
        B.bubble = { text: 'Kaydı kaydı!', t: 70, type: 'say' };
      }
    }
  }
  peels = peels.filter(p => p.life > 0);
  // Yusuf ara ara laf sokuyor
  if (YU && G.t % 360 === 180 && !YU.bubble) YU.bubble = { text: ['Mememe!', 'Eheheheeee', 'Süt nereden çıkar Can?', 'M-me-meme!'][(G.t / 360 | 0) % 4], t: 90 };
  if (YU && YU.bubble) { YU.bubble.t--; if (YU.bubble.t <= 0) YU.bubble = null; }
}

function canDefeated() {
  const c = boss; c.state = 'down'; c.bubble = null; qs = []; peels = []; arenaPhase = 'cdown';
  setMusicVol(20);
  (async () => {
    await wait(50);
    await talk([say('can', "Newcastle'da çalışan bir garsonum b-ben, noldu bana?")]);
    await talk([say('yusuf', 'Eheheheeee')]);
    await wait(40);
    setMusicVol(45);
    G.canDone = true; G.level = LEVELS.ch1;
    nextLevel();
  })();
}

// ---------------- drawing ----------------
function drawEarlyArena() {
  bgCh1(0);
  ctx.fillStyle = '#a26a3c'; ctx.fillRect(0, AGY, W, H - AGY);
  ctx.fillStyle = '#7d4f2a'; for (let k = 0; k < W; k += 48) ctx.fillRect(k, AGY, 2, H - AGY);
  ctx.fillStyle = '#c48a55'; ctx.fillRect(0, AGY, W, 6);
  // lockers at the end of the corridor
  for (let i = 0; i < 4; i++) { const x = 760 + i * 50; ctx.fillStyle = '#e9e0cf'; ctx.fillRect(x, 300, 46, 170); ctx.strokeStyle = '#9c8f78'; ctx.lineWidth = 2; ctx.strokeRect(x + 3, 303, 40, 164); ctx.fillStyle = '#6b6457'; ctx.fillRect(x + 32, 360, 4, 14); }
}
function drawEarlyActors() {
  for (const p of peels) drawPeel(p);
  if (YU) { drawBot(YU, 0, 'yusuf', YUSUF_PAL); }
  if (boss && boss.type === 'can') drawCan(boss);
  for (const q of qs) drawQ(q);
}
function drawEarlyOverlay() {
  ctx.globalAlpha = 0.9; ctx.drawImage(grain, -rand(0, 100), -rand(0, 100), W + 200, H + 200); ctx.globalAlpha = 1;
  if (YU && YU.bubble) { const p = speakerPos('yusuf'); bubble(p.x, p.y, YU.bubble.text, 'say', clamp(YU.bubble.t / 15, 0, 1)); }
  if (canTitleT > 0) {
    const a = clamp(canTitleT / 30, 0, 1);
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, H / 2 - 60, W, 120);
    ctx.fillStyle = '#ffe14a'; ctx.font = '64px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('BOSS: CAN (BABUN)', W / 2, H / 2 + 10);
    ctx.fillStyle = '#fff'; ctx.font = '600 15px Inter'; ctx.fillText('Bir şeyi anlamaya çalışırken kafasına zıpla. Sorulardan ve muz kabuklarından kaç!', W / 2, H / 2 + 42);
    ctx.globalAlpha = 1;
  }
  if (boss && boss.type === 'can' && boss.state === 'loading' && boss.hp === 3) { ctx.fillStyle = '#fff'; ctx.font = '20px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('KAVRAMAYA ÇALIŞIYOR → KAFASINA ZIPLA!', W / 2, 90); }
  if (boss && boss.type === 'can' && !['intro', 'down'].includes(boss.state) && arenaPhase === 'can') drawBossBar('CAN (BABUN)', boss.hp, 3);
}

function drawQ(q) {
  ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot);
  ctx.font = 'bold 15px Inter'; const w = ctx.measureText(q.txt).width + 18;
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
  rr(-w / 2, -13, w, 26, 12); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-6, 12); ctx.lineTo(-10, 20); ctx.lineTo(2, 12); ctx.fill();
  ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(q.txt, 0, 1);
  ctx.restore(); ctx.textBaseline = 'alphabetic';
}
function drawPeel(p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
  if (!p.air && p.life < 60 && Math.floor(p.life / 5) % 2) ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#f2d34a'; ctx.strokeStyle = '#8a6a10'; ctx.lineWidth = 1.5;
  for (const a of [-0.9, 0, 0.9]) { ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -9, 5, 11, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = '#6b4a10'; ctx.fillRect(-2, -2, 4, 4);
  ctx.restore();
}

function drawCan(c) {
  const cx = c.x + c.w / 2, fy = c.y + c.h, f = c.facing;
  ctx.save();
  if (c.flash && Math.floor(c.flash / 3) % 2) ctx.filter = 'brightness(2.2)';
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(cx, AGY + 2, 34, 6, 0, 0, 7); ctx.fill();
  ctx.translate(cx, fy);
  if (c.crouch) ctx.scale(1.1, 0.85);
  if (c.state === 'down') ctx.rotate(f * -0.25);
  const ph = G.t / 6, walk = c.state === 'leapAir' ? 0 : Math.sin(ph) * 2;
  // tail + red baboon butt (behind)
  ctx.strokeStyle = '#7a6045'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-f * 22, -38); ctx.quadraticCurveTo(-f * 52, -40, -f * 48, -70 + Math.sin(G.t / 10) * 5); ctx.stroke();
  ctx.fillStyle = '#e0455a'; ctx.beginPath(); ctx.ellipse(-f * 26, -30, 9, 12, 0, 0, 7); ctx.fill();
  // legs: black trousers, brown feet
  ctx.fillStyle = '#16161a'; rr(-20, -34, 15, 30, 5); ctx.fill(); rr(5, -34, 15, 30, 5); ctx.fill();
  ctx.fillStyle = '#7a6045'; rr(-24 + walk, -6, 20, 8, 4); ctx.fill(); rr(4 - walk, -6, 20, 8, 4); ctx.fill();
  // body: white shirt + black waiter vest
  ctx.fillStyle = '#f4f4f0'; rr(-26, -78, 52, 48, 12); ctx.fill();
  ctx.fillStyle = '#1b1b1f'; ctx.beginPath(); ctx.moveTo(-26, -70); ctx.lineTo(-8, -76); ctx.lineTo(0, -48); ctx.lineTo(8, -76); ctx.lineTo(26, -70); ctx.lineTo(24, -32); ctx.lineTo(-24, -32); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d9d9d9'; ctx.beginPath(); ctx.arc(0, -56, 2, 0, 7); ctx.arc(0, -46, 2, 0, 7); ctx.fill();
  // bow tie
  ctx.fillStyle = '#b3141d'; ctx.beginPath(); ctx.moveTo(0, -76); ctx.lineTo(-10, -81); ctx.lineTo(-10, -71); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, -76); ctx.lineTo(10, -81); ctx.lineTo(10, -71); ctx.closePath(); ctx.fill();
  // long furry arms
  const armA = c.state === 'questions' || c.state === 'banana' ? -0.9 : (c.state === 'loading' ? -1.6 : 0.15 + Math.sin(ph) * 0.1);
  ctx.save(); ctx.translate(f * 24, -72); ctx.rotate(f * -armA * -1);
  ctx.fillStyle = '#f4f4f0'; rr(-6, 0, 12, 18, 5); ctx.fill(); ctx.fillStyle = '#7a6045'; rr(-5, 16, 10, 26, 5); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(-f * 24, -72); ctx.rotate(f * 0.2);
  ctx.fillStyle = '#f4f4f0'; rr(-6, 0, 12, 18, 5); ctx.fill(); ctx.fillStyle = '#7a6045'; rr(-5, 16, 10, 26, 5); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillRect(-8, 6, 16, 22); ctx.restore(); // waiter towel on arm
  // head: baboon mane + ears + Can's face
  const hy = -98;
  ctx.fillStyle = '#9a8468';
  ctx.beginPath(); for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, r = i % 2 ? 36 : 42; ctx.lineTo(Math.cos(a) * r, hy + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7a6045'; ctx.beginPath(); ctx.arc(-34, hy - 6, 8, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(34, hy - 6, 8, 0, 7); ctx.fill();
  ctx.restore();
  if (c.state === 'loading') { const gl = ctx.createRadialGradient(cx, fy + hy, 8, cx, fy + hy, 60); gl.addColorStop(0, `rgba(255,255,160,${0.4 + Math.sin(G.t / 4) * 0.25})`); gl.addColorStop(1, 'rgba(255,255,160,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, fy + hy, 60, 0, 7); ctx.fill(); }
  drawFace('can', cx + (c.state === 'down' ? f * -12 : 0), fy + hy, 28);
  // loading bar
  if (c.state === 'loading') {
    const bx = cx - 50, by = fy + hy - 62;
    ctx.fillStyle = 'rgba(0,0,0,.7)'; rr(bx - 6, by - 20, 112, 38, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '600 11px Inter'; ctx.textAlign = 'center'; ctx.fillText(`İşleniyor... %${c.load}`, cx, by - 6);
    ctx.fillStyle = '#333'; ctx.fillRect(bx, by, 100, 8); ctx.fillStyle = '#5ad15a'; ctx.fillRect(bx, by, c.load, 8);
  }
  if (c.state === 'down') { ctx.font = '18px "Segoe UI Emoji"'; ctx.textAlign = 'center'; for (let i = 0; i < 3; i++) { const t = G.t / 8 + i * 2.1; ctx.fillText('⭐', cx + Math.cos(t) * 40, fy + hy - 36 + Math.sin(t) * 7); } }
}
