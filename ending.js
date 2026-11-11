/* =========================================================
   FİNAL EKLERİ: Kötülerin barışması, pasta, jenerik sonrası sahne
   ========================================================= */
'use strict';

const END = { actors: {}, cake: null, blowHint: false, postReady: false, post: null, endCard: false };
const CAKE_X = 480;
const BUBBLE_OFF = { harun: 30, vural: 30, sukru: 30, can: 30, yusuf: 34, sevgi: 20 };

function tweenY(e, ty, sp) {
  return new Promise(r => { (function go() { if (Math.abs(e.y - ty) <= sp) { e.y = ty; r(); return; } e.y += Math.sign(ty - e.y) * sp; wait(1).then(go); })(); });
}

// ---------- konuşma balonları finalde doğru kişiden çıksın ----------
const _speakerPos = speakerPos;
speakerPos = function (who) {
  if (G.mode === 'final' && END.actors[who]) { const e = END.actors[who]; return { x: e.x + e.w / 2, y: e.y - (BUBBLE_OFF[who] || 30) }; }
  return _speakerPos(who);
};

// ---------- 1) Kötüler doğum gününe geliyor ----------
const _showCollage = showCollage;
showCollage = function () { reunion().then(() => setTimeout(_showCollage, 600)); };

async function reunion() {
  const A = END.actors;
  walkTo(P, 380, 2); walkTo(B, 580, 2);
  await wait(60); P.facing = 1; B.facing = -1;
  await talk([say('bot', 'Bi dakka... kapı çalıyor.')]);

  A.harun = { type: 'harun', x: W + 30, y: AGY - 150, w: 110, h: 150, hp: 3, state: 'idle', t: 0, facing: -1, glasses: 5, flash: 0, sit: false, bull: false, gone: 0 };
  await walkTo(A.harun, 760, 2.4); A.harun.facing = -1;
  await talk([say('harun', 'Hadi oğlum... iyi ki doğdun. Çay benden.')]);

  A.vural = { type: 'vural', x: W + 30, y: AGY - 122, w: 60, h: 122, hp: 3, state: 'idle', t: 0, facing: -1, vis: 1, flash: 0, hasCase: true };
  await walkTo(A.vural, 660, 2.4); A.vural.facing = -1;
  await talk([say('vural', 'Tebeşiri ben getirdim. Doğum günün kutlu olsun.')]);

  A.sukru = { x: -80, y: AGY - 92, w: 70, h: 92, facing: 1, moving: true, phase: 0, angry: 0, hang: false, t: 0, flash: 0 };
  await walkTo(A.sukru, 200, 1.6); A.sukru.facing = 1;
  await talk([say('sukru', 'İ... yi... ki... doğ... dun...', 'slow')]);

  A.can = { type: 'can', x: -90, y: AGY - 110, w: 70, h: 110, hp: 3, state: 'idle', t: 0, facing: 1, flash: 0, crouch: 0, load: 0 };
  A.yusuf = { x: -150, y: AGY - 62, w: 30, h: 62, facing: 1, moving: true, phase: 0, onGround: true, noMentos: true };
  YU = A.yusuf;
  walkTo(A.yusuf, 30, 2.4);
  await walkTo(A.can, 95, 2.4); A.can.facing = 1;
  await talk([say('can', 'Doğum günü mü? Nasıl yani? Bugün mü?')]);
  await talk([say('yusuf', 'Pasta nereden çıkar? Eheheheeee... fırından!')]);

  A.sevgi = { type: 'sevgi', x: 375, y: -140, w: 210, h: 80, hp: 2, state: 'idle', t: 0, facing: -1, flash: 0, fly: true, stun: 0, flipped: false, flat: 0, legs: 0 };
  SFX.boom();
  await tweenY(A.sevgi, 105, 3);
  await talk([say('sevgi', 'Rehberlik servisi olarak doğum gününü kutlarız.')]);

  await talk([say('dgc', 'Ulan... hepiniz mi geldiniz?'), say('bot', 'Bugün kimse kimseye kızgın değil.')]);
  await wait(30);
}

// ---------- 2) Pasta ve mumlar ----------
const _showFinalText = showFinalText;
showFinalText = function () {
  cakeScene().then(() => {
    _showFinalText();
    setTimeout(() => { END.postReady = true; }, 9000);
  });
};

async function cakeScene() {
  setMusicVol(40);
  await wait(40);
  await talk([say('bot', 'Bi şey unuttuk ama...')]);
  END.cake = { x: CAKE_X, y: -120, candles: [1, 1, 1, 1, 1], relit: false, blows: 0 };
  await tweenY(END.cake, AGY, 9);
  G.shake = 8; SFX.boom(); burst(CAKE_X, AGY - 10, 24, { colors: ['#fff', '#ffd1e8'], max: 5, up: 2, world: false });
  await talk([say('bot', 'Üfle bakalım, dilek tutmayı unutma.')]);
  END.blowHint = true;
  await new Promise(r => { END.cakeDone = r; });
  END.blowHint = false;
  SFX.pick();
  for (let k = 0; k < 5; k++) setTimeout(() => burst(rand(150, W - 150), rand(120, 300), 50, { colors: ['#ff4fd8', '#6af2ff', '#ffd36a', '#fff'], max: 6, g: 0.05, life: 80, world: false, size: 3 }), k * 180);
  await wait(50);
}

function updCake() {
  const c = END.cake; if (!c || !END.blowHint || G.dialog.length) return;
  if (!hit(' ', 'enter')) return;
  c.blows++;
  P.facing = 1;
  // nefes
  for (let i = 0; i < 14; i++) parts.push({ x: P.x + P.w + 4, y: P.y + 22 + rand(-4, 4), vx: rand(3, 6), vy: rand(-0.6, 0.6), life: 26, max: 26, c: 'rgba(255,255,255,.8)', s: rand(3, 6), g: 0, world: false });
  sfx(300, 0.18, 'sawtooth', 0.02, -200);
  const lit = c.candles.map((v, i) => v ? i : -1).filter(i => i >= 0);
  if (!lit.length) return;
  const i = lit[(Math.random() * lit.length) | 0];
  c.candles[i] = 0;
  const cx = candleX(i);
  for (let k = 0; k < 8; k++) parts.push({ x: cx, y: AGY - 92, vx: rand(-0.4, 0.4), vy: -rand(0.5, 1.4), life: 50, max: 50, c: 'rgba(160,160,160,.7)', s: rand(4, 7), g: -0.01, world: false });
  // şaka mum: bir kere geri yanıyor
  if (!c.relit && c.candles.filter(v => v).length === 1) {
    c.relit = true;
    (async () => {
      await wait(45);
      c.candles[i] = 1; SFX.blip();
      await talk([say('can', 'Neden yandı yine? Anlamadım.'), say('bot', 'Şakalı mum o Can. Bi daha üfle.')]);
    })();
    return;
  }
  if (c.candles.every(v => !v) && END.cakeDone) { const r = END.cakeDone; END.cakeDone = null; setTimeout(r, 500); }
}
function candleX(i) { return CAKE_X - 36 + i * 18; }

function drawCake() {
  const c = END.cake; if (!c) return;
  const x = c.x, b = c.y;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, b + 2, 66, 7, 0, 0, 7); ctx.fill();
  // tabak
  ctx.fillStyle = '#e8e8f0'; rr(x - 64, b - 8, 128, 8, 4); ctx.fill();
  // alt kat
  ctx.fillStyle = '#7a3e1d'; rr(x - 54, b - 50, 108, 44, 8); ctx.fill();
  ctx.fillStyle = '#ffd1e8'; rr(x - 56, b - 54, 112, 12, 6); ctx.fill();
  for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.arc(x - 48 + k * 16, b - 42, 6, 0, Math.PI); ctx.fill(); }
  // üst kat
  ctx.fillStyle = '#8c4a24'; rr(x - 42, b - 80, 84, 30, 7); ctx.fill();
  ctx.fillStyle = '#fff'; rr(x - 44, b - 84, 88, 10, 5); ctx.fill();
  ctx.fillStyle = '#ff4fd8'; ctx.font = '700 15px Fredoka'; ctx.textAlign = 'center'; ctx.fillText('Ömer', x, b - 22);
  // mumlar
  c.candles.forEach((on, i) => {
    const cx = candleX(i);
    ctx.fillStyle = ['#6af2ff', '#ffd36a', '#ff4fd8', '#a57bff', '#7dff9a'][i]; ctx.fillRect(cx - 3, b - 102, 6, 18);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, b - 102); ctx.lineTo(cx, b - 106); ctx.stroke();
    if (on) {
      const fl = Math.sin(G.t / 3 + i) * 1.5;
      const g = ctx.createRadialGradient(cx, b - 112, 1, cx, b - 112, 16); g.addColorStop(0, 'rgba(255,220,120,.6)'); g.addColorStop(1, 'rgba(255,220,120,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, b - 112, 16, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffb02e'; ctx.beginPath(); ctx.ellipse(cx, b - 112, 4, 8 + fl, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.ellipse(cx, b - 110, 2, 4, 0, 0, 7); ctx.fill();
    }
  });
}

// ---------- 3) Jenerik sonrası gizli sahne ----------
function startPostCredits() {
  END.postReady = false;
  const el = $('final'); el.classList.remove('show', 'a', 'b');
  confettiOn = false;
  setMusicVol(18);
  fadeTo(() => {
    parts = []; fireworks = [];
    END.post = { t: 0, card: true };
    END.actors = {};
    END.actors.can = { type: 'can', x: 445, y: AGY - 110, w: 70, h: 110, hp: 3, state: 'loading', t: 0, facing: -1, flash: 0, crouch: 0, load: 0 };
    (async () => {
      await wait(170);
      END.post.card = false;
      const c = END.actors.can;
      await wait(40);
      while (c.load < 99) { c.load = Math.min(99, c.load + (c.load > 80 ? 1 : 2)); await wait(c.load > 90 ? 6 : 2); }
      await wait(120);
      c.state = 'idle';
      await talk([say('can', 'Tamam... anladım!')]);
      await wait(50);
      await talk([say('can', '...Neyi anladım?')]);
      c.state = 'loading'; c.load = 0;
      await wait(150);
      fadeTo(() => { END.endCard = true; });
    })();
  });
}

// ---------- hook'lar ----------
const _updFinal = updFinal;
updFinal = function () {
  if (END.post) {
    tickDialog();
    END.post.t++;
    return;
  }
  const hadDialog = G.dialog.length > 0;
  _updFinal();
  if (END.actors.sevgi) END.actors.sevgi.legs += 0.25;
  if (!hadDialog) updCake();
  if (END.postReady && hit('enter', ' ')) startPostCredits();
};

drawFinal = function () {
  if (END.post) { drawPost(); return; }
  bgCh3(0);
  for (const f of fireworks) { ctx.fillStyle = f.c; ctx.fillRect(f.x - 1.5, f.y, 3, 8); }
  drawParts(0, false);
  ctx.fillStyle = '#0f0626'; ctx.fillRect(0, AGY, W, H - AGY); ctx.fillStyle = '#ff4fd8'; ctx.shadowColor = '#ff4fd8'; ctx.shadowBlur = 14; ctx.fillRect(0, AGY, W, 4); ctx.shadowBlur = 0;
  ctx.save();
  if (G.shake > 0) { ctx.translate(rand(-G.shake, G.shake), rand(-G.shake, G.shake)); G.shake *= 0.86; if (G.shake < 0.5) G.shake = 0; }
  drawActors();
  drawCake();
  drawBot(B, 0); drawDGC(P, 0);
  ctx.restore();
  for (const c of caps) drawCap(c);
  drawParts(0, true);
  if (END.blowHint && !G.dialog.length) {
    const s = 1 + Math.sin(G.t / 5) * 0.06;
    ctx.save(); ctx.translate(W / 2, 250); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,.6)'; rr(-200, -36, 400, 64, 20); ctx.fill();
    ctx.fillStyle = '#ffe14a'; ctx.font = '40px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('[ SPACE ]  MUMLARI ÜFLE!', 0, 10);
    ctx.restore();
  }
  drawBubbles();
  if (END.postReady) { ctx.globalAlpha = 0.35 + Math.sin(G.t / 20) * 0.2; ctx.fillStyle = '#fff'; ctx.font = '600 12px Inter'; ctx.textAlign = 'right'; ctx.fillText('ENTER ↵', W - 16, H - 14); ctx.globalAlpha = 1; }
};

function drawActors() {
  const A = END.actors, bb = drawBossBar;
  drawBossBar = () => {};
  try {
    if (A.harun) drawHarun(A.harun);
    if (A.vural) drawVural(A.vural);
    if (A.sukru) drawSloth(A.sukru);
    if (A.yusuf) drawBot(A.yusuf, 0, 'yusuf', YUSUF_PAL);
    if (A.can) drawCan(A.can);
    if (A.sevgi) drawSevgi(A.sevgi);
  } finally { drawBossBar = bb; }
}

function drawPost() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (END.endCard) {
    ctx.textAlign = 'center'; ctx.fillStyle = '#f4e7cf';
    ctx.font = '80px "DM Serif Display"'; ctx.fillText('SON', W / 2, H / 2 - 10);
    ctx.globalAlpha = 0.6; ctx.font = 'italic 20px "DM Serif Display"'; ctx.fillText('Can hâlâ yükleniyor...', W / 2, H / 2 + 34);
    ctx.globalAlpha = 0.35; ctx.font = '600 12px Inter'; ctx.fillText('ÖMER — THE GAME · 2026', W / 2, H - 24);
    ctx.globalAlpha = 1;
    return;
  }
  if (END.post.card) {
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.globalAlpha = clamp(END.post.t / 40, 0, 1);
    ctx.font = 'italic 30px "DM Serif Display"'; ctx.fillText('Bu sırada, Early Years koridorunda...', W / 2, H / 2);
    ctx.globalAlpha = 1;
    return;
  }
  drawEarlyArena();
  drawCan(END.actors.can);
  // film greni + siyah bantlar
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 50); ctx.fillRect(0, H - 50, W, 50);
  drawBubbles();
}

// debug: ?skip=reunion|cake|post
function endingSkip(q) {
  startFinal();
  G.dialog = [];
  if (q === 'cake' || q === 'post') {
    const A = END.actors;
    P.x = 380; B.x = 580; B.facing = -1; B.noMentos = true;
    A.harun = { type: 'harun', x: 760, y: AGY - 150, w: 110, h: 150, hp: 3, state: 'idle', t: 0, facing: -1, glasses: 5, flash: 0, sit: false, bull: false, gone: 0 };
    A.vural = { type: 'vural', x: 660, y: AGY - 122, w: 60, h: 122, hp: 3, state: 'idle', t: 0, facing: -1, vis: 1, flash: 0, hasCase: true };
    A.sukru = { x: 200, y: AGY - 92, w: 70, h: 92, facing: 1, moving: false, phase: 0, angry: 0, hang: false, t: 0, flash: 0 };
    A.can = { type: 'can', x: 95, y: AGY - 110, w: 70, h: 110, hp: 3, state: 'idle', t: 0, facing: 1, flash: 0, crouch: 0, load: 0 };
    A.yusuf = YU = { x: 30, y: AGY - 62, w: 30, h: 62, facing: 1, moving: false, phase: 0, onGround: true, noMentos: true };
    A.sevgi = { type: 'sevgi', x: 375, y: 105, w: 210, h: 80, hp: 2, state: 'idle', t: 0, facing: -1, flash: 0, fly: true, stun: 0, flipped: false, flat: 0, legs: 0 };
  }
  setTimeout(() => {
    G.dialog = [];
    if (q === 'cake') showFinalText();
    if (q === 'post') startPostCredits();
  }, 1700);
}
