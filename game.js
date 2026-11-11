/* =========================================================
   ÖMER — THE GAME   (doğum günü hediyesi, imza: Ömerf)
   ========================================================= */
'use strict';

// ---------------- CONFIG ----------------
const PASSWORD = 'babun';
const SONGS = {            // YouTube "Kanye West - Topic" resmi albüm sesleri
  ch1: 'X_0lzRcim4g',      // The New Workout Plan
  ch2: 'w2Yh9sxfTd8',      // All of the Lights
  ch3: 'hqvcww4ydh8',      // Can't Tell Me Nothing
};
const FACES = {            // kaynak fotoğraftaki yüz kare alanı
  dgc: { src: 'assets/faces/dgc-omer-1.jpg', x: 262, y: 88,  s: 190 },
  bot: { src: 'assets/faces/bot-omer-1.jpg', x: 545, y: 540, s: 300 },
};
const PHOTOS = {
  ch1a: { src: 'assets/memories/ch1-1.jpg', w: 1600, h: 1202 },
  ch1b: { src: 'assets/memories/ch1-2.jpg', w: 1170, h: 1435 },
  ch2a: { src: 'assets/memories/ch2-1.jpg', w: 739,  h: 1600, y0: 178 / 1600, y1: 1385 / 1600 },
  ch3a: { src: 'assets/memories/ch3-1.jpg', w: 1101, h: 1560 },
};
const LETTER =
`Merhaba Ömer;

Öncelikle umarım bu mini oyunu beğenmişsindir. Sana kalıcı bir doğum günü hediyesi vermek istedim.

Bizler için ne kadar değerli olduğunu söylememize bile gerek yok, sen bunun zaten farkındasın.

Seni çok seviyorum lisedeki ilk dostum. Arkadaşlığımız umarım ki hep böyle devam eder.

Yılların mutlu, doğum günün kutlu olsun dostum.

İmza Ömerf.`;

// ---------------- SETUP ----------------
const W = 960, H = 540;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const $ = id => document.getElementById(id);

function fit() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  $('stage').style.transform = `scale(${s})`;
}
window.addEventListener('resize', fit); fit();

const IMG = {};
function loadImg(key, src) {
  return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(i); i.src = src; IMG[key] = i; });
}
const ready = Promise.all([
  ...Object.entries(FACES).map(([k, f]) => loadImg('face_' + k, f.src)),
  ...Object.entries(PHOTOS).map(([k, p]) => loadImg('ph_' + k, p.src)),
]);

// ---------------- INPUT ----------------
const keys = {}, pressed = {};
window.addEventListener('keydown', e => {
  if (document.activeElement === $('pwin')) return;
  const k = e.key.toLowerCase();
  if (!keys[k]) pressed[k] = true;
  keys[k] = true;
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
const hit = (...ks) => ks.some(k => pressed[k]);
const held = (...ks) => ks.some(k => keys[k]);
function advancePressed() { return hit('enter', ' ', 'e'); }

// ---------------- AUDIO ----------------
let AC = null, muted = false;
function sfx(freq, dur = 0.12, type = 'square', vol = 0.06, slide = 0) {
  if (!AC || muted) return;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, AC.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), AC.currentTime + dur);
  g.gain.setValueAtTime(vol, AC.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
  o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + dur);
}
const SFX = {
  jump: () => sfx(420, 0.12, 'square', 0.035, 300),
  pick: () => { sfx(880, 0.1, 'triangle', 0.08); setTimeout(() => sfx(1320, 0.18, 'triangle', 0.08), 90); },
  hurt: () => sfx(200, 0.25, 'sawtooth', 0.07, -140),
  stomp: () => sfx(160, 0.18, 'square', 0.09, -90),
  glass: () => sfx(2400, 0.08, 'triangle', 0.05, -1200),
  boom: () => sfx(90, 0.4, 'sawtooth', 0.1, -50),
  sap: () => { sfx(70, 0.5, 'square', 0.14, -40); sfx(1800, 0.06, 'square', 0.08); },
  blip: () => sfx(660, 0.04, 'square', 0.025),
};

// YouTube müzik
let yt = null, ytReady = false, wantSong = null, musicVol = 45;
window.onYouTubeIframeAPIReady = () => {
  yt = new YT.Player('ytp', {
    width: 200, height: 200,
    playerVars: { autoplay: 0, controls: 0, playsinline: 1 },
    events: {
      onReady: () => { ytReady = true; yt.setVolume(musicVol); if (wantSong) playSong(wantSong, true); },
      onStateChange: e => { if (e.data === 0) { yt.seekTo(0); yt.playVideo(); } },
    },
  });
};
(function () { const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s); })();
let currentSong = null;
function playSong(id, force) {
  wantSong = id;
  if (!ytReady) return;
  if (currentSong === id && !force) return;
  currentSong = id;
  try { yt.loadVideoById(id); yt.setVolume(muted ? 0 : musicVol); } catch (e) {}
}
function setMusicVol(v) { musicVol = v; if (ytReady && !muted) try { yt.setVolume(v); } catch (e) {} }
function toggleMute() {
  muted = !muted;
  if (ytReady) try { yt.setVolume(muted ? 0 : musicVol); } catch (e) {}
  $('hud-music').textContent = muted ? '🔇 M: ses' : '🔊 M: ses';
}
$('hud-music').onclick = toggleMute;

// ---------------- HELPERS ----------------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

// noise / grain
const grain = document.createElement('canvas'); grain.width = 256; grain.height = 256;
(function () { const g = grain.getContext('2d'); const d = g.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 22; }
  g.putImageData(d, 0, 0); })();

// ---------------- PARTICLES ----------------
let parts = [];
function burst(x, y, n, opt = {}) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), sp = rand(opt.min || 1, opt.max || 5);
    parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opt.up || 0), life: opt.life || rand(30, 60), max: opt.life || 60,
      c: opt.colors ? opt.colors[(Math.random() * opt.colors.length) | 0] : '#fff', s: opt.size || rand(2, 5), g: opt.g ?? 0.15, txt: opt.txt, world: opt.world !== false, rot: rand(0, 6), vr: rand(-.2, .2) });
  }
}
function updParts() {
  for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.99; p.life--; p.rot += p.vr; }
  parts = parts.filter(p => p.life > 0);
}
function drawParts(camX, worldPass) {
  for (const p of parts) {
    if (p.world !== worldPass) continue;
    const x = p.x - (worldPass ? camX : 0);
    ctx.globalAlpha = clamp(p.life / p.max * 1.5, 0, 1);
    if (p.txt) { ctx.font = `${p.s}px "Segoe UI Emoji", sans-serif`; ctx.textAlign = 'center'; ctx.fillText(p.txt, x, p.y); }
    else { ctx.save(); ctx.translate(x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * (p.conf ? 0.5 : 1)); ctx.restore(); }
  }
  ctx.globalAlpha = 1;
}

// ---------------- CHARACTERS ----------------
function drawFace(key, cx, cy, r) {
  const f = FACES[key], img = IMG['face_' + key];
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  if (img && img.complete && img.naturalWidth) ctx.drawImage(img, f.x, f.y, f.s, f.s, cx - r, cy - r, r * 2, r * 2);
  else { ctx.fillStyle = '#d9a77a'; ctx.fill(); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.stroke();
}

// DGÇ Ömer — ayıcık gövdesi, lacivert hırka + kot
function drawDGC(e, camX) {
  const cx = e.x + e.w / 2 - camX, fy = e.y + e.h;
  const ph = e.phase, mv = e.moving && e.onGround ? 1 : 0;
  const sq = e.onGround ? 1 : 1.06;
  if (e.blink && Math.floor(e.blink / 4) % 2) ctx.globalAlpha = 0.35;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(cx, fy + 2, 18, 4, 0, 0, 7); ctx.fill();
  // legs (jeans)
  const l1 = Math.sin(ph) * 6 * mv, l2 = -l1;
  ctx.fillStyle = '#2c3e66';
  rr(cx - 11 + l1, fy - 22, 9, 20, 3); ctx.fill(); rr(cx + 2 + l2, fy - 22, 9, 20, 3); ctx.fill();
  ctx.fillStyle = '#f2f2f2'; rr(cx - 13 + l1, fy - 5, 13, 6, 3); ctx.fill(); rr(cx + 1 + l2, fy - 5, 13, 6, 3); ctx.fill();
  // body: navy zip hoodie
  ctx.fillStyle = '#1c2438'; rr(cx - 15, fy - 48 * sq, 30, 30 * sq, 9); ctx.fill();
  ctx.strokeStyle = '#9aa3b5'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, fy - 45 * sq); ctx.lineTo(cx, fy - 20); ctx.stroke();
  // arms + bear paws
  const a = Math.sin(ph + Math.PI) * 7 * mv + (e.onGround ? 0 : -10);
  ctx.fillStyle = '#1c2438';
  ctx.save(); ctx.translate(cx - 14, fy - 44); ctx.rotate((a) * 0.05); rr(-6, 0, 9, 20, 4); ctx.fill(); ctx.fillStyle = '#8a5a34'; ctx.beginPath(); ctx.arc(-1.5, 21, 5, 0, 7); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#1c2438';
  ctx.save(); ctx.translate(cx + 14, fy - 44); ctx.rotate((-a) * 0.05); rr(-3, 0, 9, 20, 4); ctx.fill(); ctx.fillStyle = '#8a5a34'; ctx.beginPath(); ctx.arc(1.5, 21, 5, 0, 7); ctx.fill(); ctx.restore();
  // head: bear ears + face
  const hy = fy - 70 + (mv ? Math.abs(Math.sin(ph)) * -2 : 0) + (e.onGround ? 0 : -3);
  ctx.fillStyle = '#8a5a34';
  ctx.beginPath(); ctx.arc(cx - 22, hy - 21, 11, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 22, hy - 21, 11, 0, 7); ctx.fill();
  ctx.fillStyle = '#e8a0a0';
  ctx.beginPath(); ctx.arc(cx - 22, hy - 21, 5.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 22, hy - 21, 5.5, 0, 7); ctx.fill();
  drawFace('dgc', cx, hy, 27);
  ctx.globalAlpha = 1;
  // dizzy stars
  if (e.dizzy > 0) {
    ctx.font = '16px "Segoe UI Emoji"'; ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) { const t = performance.now() / 200 + i * 2.1; ctx.fillText('⭐', cx + Math.cos(t) * 32, hy - 30 + Math.sin(t) * 7); }
  }
  if (e.sweat > 0) { ctx.font = '18px "Segoe UI Emoji"'; ctx.fillText('💧', cx + 30, hy - 8); }
}

// Bot Ömer — öğrenci: siyah hırka, sarı-kırmızı yakalı polo, sırt çantası, Mentos
function drawBot(e, camX) {
  const cx = e.x + e.w / 2 - camX, fy = e.y + e.h;
  const ph = e.phase, mv = e.moving && e.onGround ? 1 : 0;
  const f = e.facing;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(cx, fy + 2, 16, 4, 0, 0, 7); ctx.fill();
  // backpack (behind)
  ctx.fillStyle = '#2f6f73'; rr(cx - f * 20 - 8, fy - 46, 16, 24, 5); ctx.fill();
  ctx.fillStyle = '#245457'; rr(cx - f * 20 - 6, fy - 34, 12, 9, 3); ctx.fill();
  // legs
  const l1 = Math.sin(ph) * 6 * mv;
  ctx.fillStyle = '#16161a';
  rr(cx - 10 + l1, fy - 21, 8, 19, 3); ctx.fill(); rr(cx + 2 - l1, fy - 21, 8, 19, 3); ctx.fill();
  ctx.fillStyle = '#fff'; rr(cx - 12 + l1, fy - 5, 12, 6, 3); ctx.fill(); rr(cx + 1 - l1, fy - 5, 12, 6, 3); ctx.fill();
  // polo + open black hoodie
  ctx.fillStyle = '#2a2420'; rr(cx - 13, fy - 46, 26, 27, 7); ctx.fill();
  ctx.fillStyle = '#0d0d0f'; rr(cx - 15, fy - 46, 9, 28, 6); ctx.fill(); rr(cx + 6, fy - 46, 9, 28, 6); ctx.fill();
  ctx.strokeStyle = '#f2b81c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 6, fy - 46); ctx.lineTo(cx, fy - 39); ctx.lineTo(cx + 6, fy - 46); ctx.stroke();
  ctx.strokeStyle = '#c0262d'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx - 6, fy - 44); ctx.lineTo(cx, fy - 37.5); ctx.lineTo(cx + 6, fy - 44); ctx.stroke();
  // arms; front hand holds Mentos
  const a = Math.sin(ph + Math.PI) * 6 * mv;
  ctx.fillStyle = '#0d0d0f';
  rr(cx - 19, fy - 44 + a * 0.3, 8, 19, 4); ctx.fill(); rr(cx + 11, fy - 44 - a * 0.3, 8, 19, 4); ctx.fill();
  ctx.fillStyle = '#e9c3a0'; ctx.beginPath(); ctx.arc(cx - 15, fy - 23 + a * 0.3, 4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 15, fy - 23 - a * 0.3, 4, 0, 7); ctx.fill();
  if (!e.noMentos) {
    const mx = cx + f * 15, my = fy - 30 - f * a * 0.3;
    ctx.fillStyle = '#f4f4f4'; rr(mx - 3, my - 8, 7, 16, 3); ctx.fill();
    ctx.fillStyle = '#1e5bd8'; ctx.fillRect(mx - 3, my - 3, 7, 6);
  }
  const hy = fy - 66 + (mv ? Math.abs(Math.sin(ph)) * -2 : 0) + (e.hop || 0);
  drawFace('bot', cx, hy, 24);
}

// ---------------- SPEECH BUBBLES ----------------
function wrap(text, maxW) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function bubble(x, y, text, type = 'say', alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  const shout = type === 'shout', think = type === 'think';
  ctx.font = shout ? '28px Bangers, Impact, sans-serif' : (think ? 'italic 600 17px Inter, sans-serif' : '600 18px Inter, sans-serif');
  const maxW = shout ? 380 : 270;
  const lines = wrap(text, maxW), lh = shout ? 30 : 23;
  const tw = Math.max(...lines.map(l => ctx.measureText(l).width));
  const bw = tw + 30, bh = lines.length * lh + 20;
  const m = shout ? 40 : 8;
  let bx = clamp(x - bw / 2, m, W - bw - m), by = y - bh - (shout ? 34 : 22);
  if (by < 8) by = 8;
  if (shout) {
    ctx.fillStyle = '#ffe14a'; ctx.strokeStyle = '#c40d0d'; ctx.lineWidth = 4;
    ctx.beginPath(); const cx = bx + bw / 2, cy = by + bh / 2, n = 22;
    for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? 1 : 1.13; ctx.lineTo(cx + Math.cos(a) * bw / 2 * r * 1.08, cy + Math.sin(a) * bh / 2 * r * 1.25); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c40d0d'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    lines.forEach((l, i) => ctx.fillText(l, bx + bw / 2 + rand(-1, 1), by + 10 + i * lh + rand(-1, 1)));
  } else {
    ctx.fillStyle = think ? 'rgba(255,255,255,.93)' : '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5;
    rr(bx, by, bw, bh, think ? 22 : 14); ctx.fill(); ctx.stroke();
    if (think) {
      [[0, 10, 7], [-6, 4, 4]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(clamp(x, bx + 20, bx + bw - 20) + dx, by + bh + dy, r, 0, 7); ctx.fill(); ctx.stroke(); });
    } else {
      const tx = clamp(x, bx + 18, bx + bw - 18);
      ctx.beginPath(); ctx.moveTo(tx - 9, by + bh - 1); ctx.lineTo(tx, by + bh + 16); ctx.lineTo(tx + 9, by + bh - 1); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tx - 9, by + bh); ctx.lineTo(tx, by + bh + 16); ctx.lineTo(tx + 9, by + bh); ctx.stroke();
    }
    ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    lines.forEach((l, i) => ctx.fillText(l, bx + bw / 2, by + 11 + i * lh));
  }
  ctx.restore(); ctx.textBaseline = 'alphabetic';
}

// ---------------- GAME STATE ----------------
const G = {
  mode: 'menu',        // menu | card | play | boss | final
  level: null, camX: 0, t: 0, shake: 0, slow: 1,
  dialog: [], dialogCb: null, dialogT: 0,
  modal: false,
};
const P = { x: 80, y: 300, w: 34, h: 64, vx: 0, vy: 0, onGround: false, facing: 1, phase: 0, moving: false, blink: 0, dizzy: 0, sweat: 0, hp: 3, safe: { x: 80, y: 300 } };
const B = { x: 0, y: 0, w: 30, h: 62, facing: 1, phase: 0, moving: false, onGround: true, active: false, trail: [], bubble: null, hop: 0 };
let idleT = 0, fellOnce = false, collected = [];

function say(who, text, type = 'say') { return { who, text, type }; }
function runDialog(lines, cb) { G.dialog = lines.slice(); G.dialogCb = cb || null; G.dialogT = 0; SFX.blip(); }
function shownText(d) { return d.type === 'slow' ? d.text.slice(0, Math.floor(G.dialogT / 6)) : d.text; }
function tickDialog() {
  if (!G.dialog.length) return;
  G.dialogT++;
  const d = G.dialog[0];
  if (d.type === 'slow' && G.dialogT % 6 === 0 && shownText(d).length < d.text.length) sfx(300, 0.03, 'triangle', 0.03);
  if (advancePressed() && G.dialogT > 12) {
    if (d.type === 'slow' && shownText(d).length < d.text.length) { G.dialogT = d.text.length * 6; return; }
    G.dialog.shift(); G.dialogT = 0;
    if (G.dialog.length) SFX.blip(); else if (G.dialogCb) { const cb = G.dialogCb; G.dialogCb = null; cb(); }
  }
}
function speakerPos(who) {
  if (who === 'dgc') return { x: P.x + P.w / 2 - G.camX, y: P.y - 40 };
  if (who === 'bot') return { x: B.x + B.w / 2 - G.camX, y: B.y - 34 };
  if (who === 'harun' && boss) return { x: boss.x + boss.w / 2, y: boss.y - 30 };
  if (who === 'sevgi' && boss) return { x: boss.x + boss.w / 2, y: boss.y - 20 };
  if (who === 'vural' && boss) return { x: boss.x + boss.w / 2, y: boss.y - 60 };
  if (who === 'sukru' && typeof SK !== 'undefined' && SK) return { x: SK.x + SK.w / 2, y: SK.hang ? SK.y + 10 : SK.y - 30 };
  return { x: W / 2, y: 160 };
}
function botSay(text, dur = 150) { B.bubble = { text, t: dur, type: 'say' }; }

// ---------------- LEVELS ----------------
const GY = 460;
function ground(a, b, y = GY) { return { x: a, y, w: b - a, h: H - y + 60, kind: 'ground' }; }

const LEVELS = {
  ch1: {
    key: 'ch1', num: 'CHAPTER 1', name: 'The Early Years', sub: '♪ The New Workout Plan', font: '"DM Serif Display", serif', song: SONGS.ch1,
    len: 4000, exit: 3820,
    plats: [ground(0, 1150), ground(1260, 2300), ground(2420, 4000),
      { x: 360, y: 405, w: 110, h: 55, kind: 'desk' }, { x: 960, y: 375, w: 70, h: 85, kind: 'books' },
      { x: 1390, y: 405, w: 110, h: 55, kind: 'desk' }, { x: 1600, y: 405, w: 110, h: 55, kind: 'desk' }, { x: 1730, y: 335, w: 90, h: 125, kind: 'locker' },
      { x: 2600, y: 345, w: 90, h: 115, kind: 'locker' }, { x: 2690, y: 280, w: 90, h: 180, kind: 'locker' }, { x: 2780, y: 345, w: 90, h: 115, kind: 'locker' },
      { x: 3150, y: 390, w: 70, h: 70, kind: 'books' }, { x: 3400, y: 405, w: 110, h: 55, kind: 'desk' }],
    mems: [{ x: 1445, y: 350, photo: 'ch1a', lines: ['Olm küçükmüşüz lan... Gürhun ne alaka bu arada'] },
      { x: 2735, y: 225, photo: 'ch1b', lines: ['Niye herkes kel amk'] }],
    botStart: { x: 780, y: GY - 62, waiting: true },
    triggers: [{ x: 600, fn: meetBot }],
  },
  ch2: {
    key: 'ch2', num: 'CHAPTER 2', name: 'The Dark Fantasy Years', sub: '♪ All of the Lights', font: 'Cinzel, serif', song: SONGS.ch2,
    len: 4000, exit: 3820,
    plats: [ground(0, 900), ground(1020, 1500), ground(1640, 2600), ground(2740, 4000),
      { x: 840, y: 380, w: 120, h: 22, kind: 'marble' }, { x: 1200, y: 370, w: 140, h: 22, kind: 'marble' }, { x: 1380, y: 290, w: 120, h: 22, kind: 'marble' },
      { x: 1900, y: 380, w: 120, h: 22, kind: 'marble' }, { x: 2070, y: 300, w: 120, h: 22, kind: 'marble' }, { x: 2240, y: 220, w: 150, h: 22, kind: 'marble' },
      { x: 2560, y: 380, w: 110, h: 22, kind: 'marble' }, { x: 3100, y: 370, w: 120, h: 22, kind: 'marble' }, { x: 3300, y: 300, w: 120, h: 22, kind: 'marble' }],
    mems: [{ x: 2315, y: 165, photo: 'ch2a', fire: true, lines: [] }],
    startLines: [say('bot', 'Dayyum')],
    triggers: [{ x: 1100, fn: () => botSay('Mentos ister misin? Hâlâ 1 lira.', 170) }],
  },
  ch3: {
    key: 'ch3', num: 'CHAPTER 3', name: 'Graduation', sub: "♪ Can't Tell Me Nothing", font: 'Fredoka, sans-serif', song: SONGS.ch3,
    len: 4000, exit: 3840,
    plats: [ground(0, 700), ground(800, 1300, 420), ground(1410, 1900, 380), ground(2000, 2500, 430), ground(2600, 2800, 350), ground(2900, 3300, 300), ground(3400, 4000)],
    mems: [{ x: 1650, y: 320, photo: 'ch3a', babun: true, lines: ['Özledim.', 'Fotoğraftaki babunu bulun.'] }],
    startLines: [say('bot', "Sana güveniyorum kardeşim git ve Harun'un içinden geç ben buradayım")],
    triggers: [],
  },
};
const ORDER = ['ch1', 'ch2', 'ch3'];

function meetBot() {
  runDialog([
    say('bot', 'Mentos var, 1 lira.'),
    say('dgc', 'Yavşağa bak, mentosa bile para istiyo. Böyle tiplerle 4 sene nasıl geçecek...', 'think'),
  ], () => {
    B.active = true; B.waiting = false; resetTrail(true);
    setTimeout(() => runDialog([say('bot', 'Oğlum spora gidicektik bir gidemedik... Neyse yolumuza devam edelim')]), 400);
  });
}

function resetTrail(here) { B.trail = []; for (let i = 0; i < 30; i++) B.trail.push(here ? { x: B.x, y: B.y, moving: false, onGround: true, facing: B.facing } : { x: P.x - 50, y: P.y + P.h - B.h, moving: false, onGround: true, facing: P.facing }); }

function startLevel(key) {
  const L = LEVELS[key];
  G.level = L; G.mode = 'play'; G.camX = 0; parts = [];
  L.mems.forEach(m => m.got = false); L.triggers.forEach(t => t.done = false);
  P.x = 80; P.y = GY - P.h; P.vx = P.vy = 0; P.facing = 1; P.safe = { x: 80, y: P.y };
  if (L.botStart) { B.active = false; B.waiting = true; B.x = L.botStart.x; B.y = L.botStart.y; B.facing = -1; }
  else { B.active = true; B.waiting = false; B.x = 30; B.y = GY - B.h; resetTrail(); }
  B.bubble = null; idleT = 0;
  if (L.startLines) setTimeout(() => runDialog(L.startLines), 500);
}

function showCard(key, then) {
  const L = LEVELS[key];
  G.mode = 'card';
  const c = $('card');
  c.querySelector('.n').textContent = L.num;
  c.querySelector('.name').textContent = L.name;
  c.querySelector('.name').style.fontFamily = L.font;
  c.querySelector('.sub').textContent = L.sub;
  c.classList.add('show'); c.classList.remove('in');
  requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add('in')));
  playSong(L.song);
  setTimeout(() => { c.classList.remove('show', 'in'); then(); }, 3600);
}

// ---------------- PHYSICS ----------------
function solids() { return G.mode === 'boss' ? ARENA.plats : G.level.plats; }
function physics(e, ctrl) {
  const S = solids();
  e.x += e.vx;
  for (const p of S) if (overlap(e, p)) { if (e.vx > 0) e.x = p.x - e.w; else if (e.vx < 0) e.x = p.x + p.w; e.vx = 0; }
  e.vy = Math.min(e.vy + 0.62, 15);
  e.y += e.vy; e.onGround = false;
  for (const p of S) if (overlap(e, p)) {
    if (e.vy > 0) { e.y = p.y - e.h; e.onGround = true; } else if (e.vy < 0) e.y = p.y + p.h;
    e.vy = 0;
  }
}

function updatePlayer(allow = true) {
  const L = G.level;
  let dir = 0;
  if (allow) { if (held('arrowleft', 'a')) dir -= 1; if (held('arrowright', 'd')) dir += 1; }
  P.vx = dir * 4.4; if (dir) P.facing = dir;
  P.moving = dir !== 0;
  if (allow && hit(' ', 'arrowup', 'w') && P.onGround) { P.vy = G.mode === 'boss' ? -14.6 : -13.2; SFX.jump(); }
  if (allow && !held(' ', 'arrowup', 'w') && P.vy < -5) P.vy += 0.6; // short hop
  physics(P);
  const maxX = G.mode === 'boss' ? W : L.len;
  P.x = clamp(P.x, 0, maxX - P.w);
  if (P.moving) P.phase += 0.28;
  if (P.blink > 0) P.blink--; if (P.dizzy > 0) P.dizzy--; if (P.sweat > 0) P.sweat--;
  if (P.onGround && G.mode === 'play') {
    const S = solids(); const under = S.filter(p => p.y === P.y + P.h && P.x >= p.x && P.x + P.w <= p.x + p.w);
    if (under.length) P.safe = { x: P.x, y: P.y };
  }
  if (P.y > H + 80) {
    P.x = P.safe.x; P.y = P.safe.y - 4; P.vx = P.vy = 0; P.dizzy = 90; P.blink = 40; SFX.hurt();
    if (B.active) { resetTrail(); B.x = P.x - 50; B.y = P.y + P.h - B.h; }
    if (!fellOnce && B.active) { fellOnce = true; botSay('Hâlâ zıplamayı öğrenemedin.', 160); }
  }
  // idle
  if (P.moving || !P.onGround) idleT = 0; else idleT++;
  if (idleT === 600 && B.active && !B.bubble && G.mode === 'play') botSay('Uyudun mu?', 130);
}

function updateBot() {
  if (B.bubble) { B.bubble.t--; if (B.bubble.t <= 0) B.bubble = null; }
  if (!B.active || G.mode === 'boss') { B.moving = false; return; }
  B.trail.push({ x: P.x, y: P.y + P.h - B.h, moving: P.moving, onGround: P.onGround, facing: P.facing });
  const lag = 26;
  while (B.trail.length > lag) B.trail.shift();
  const t = B.trail[0];
  const nx = lerp(B.x, t.x - t.facing * 46, 0.25);
  B.moving = Math.abs(nx - B.x) > 0.4; B.x = nx; B.y = lerp(B.y, t.y, 0.35); B.onGround = t.onGround; B.facing = t.facing;
  if (B.moving) B.phase += 0.28;
}

// ---------------- MEMORY MODAL ----------------
function openMemory(m) {
  G.modal = true; SFX.pick();
  const ph = PHOTOS[m.photo], img = $('pimg'), crop = $('pcrop');
  const y0 = ph.y0 || 0, y1 = ph.y1 || 1;
  const boxH = 340, imgH = boxH / (y1 - y0), imgW = imgH * ph.w / ph.h;
  img.src = ph.src; img.style.width = imgW + 'px'; img.style.marginTop = (-y0 * imgH) + 'px';
  crop.style.width = imgW + 'px'; crop.style.height = boxH + 'px';
  $('monkey').classList.remove('on');
  $('cav').style.backgroundImage = `url(${FACES.bot.src})`;
  $('cav').style.backgroundSize = `${(1200 / 300) * 44}px auto`;
  $('cav').style.backgroundPosition = `${-545 / 300 * 44}px ${-540 / 300 * 44}px`;
  const cbox = $('cbox'), ctext = $('ctext'), next = $('cnext');
  cbox.classList.remove('on'); next.style.opacity = 0;
  $('mem').classList.add('show');

  const steps = [];
  m.lines.forEach(l => steps.push({ type: 'line', text: l }));
  if (m.babun) steps.push({ type: 'babun' }, { type: 'line', text: 'Aynen 😂' });
  if (m.fire) steps.push({ type: 'fire' });
  let i = -1;
  let waitingKey = false, waitingClick = false;
  function step() {
    i++;
    if (i >= steps.length) { close(); return; }
    const s = steps[i];
    if (s.type === 'line') {
      cbox.classList.remove('on');
      setTimeout(() => { ctext.textContent = s.text; cbox.classList.add('on'); SFX.blip(); next.style.opacity = .6; waitingKey = true; }, 180);
    } else if (s.type === 'fire') {
      cbox.classList.remove('on'); next.style.opacity = 0;
      const pol = $('pol').getBoundingClientRect(), st = $('stage').getBoundingClientRect();
      const sc = st.width / W;
      for (let k = 0; k < 34; k++) setTimeout(() => {
        const f = document.createElement('div'); f.className = 'flame'; f.textContent = '🔥';
        f.style.left = ((pol.left - st.left) / sc + Math.random() * pol.width / sc - 20) + 'px';
        f.style.top = ((pol.bottom - st.top) / sc - 30) + 'px';
        f.style.fontSize = (30 + Math.random() * 36) + 'px';
        $('mem').appendChild(f); setTimeout(() => f.remove(), 1900);
      }, k * 55);
      setTimeout(() => { next.style.opacity = .6; waitingKey = true; }, 1600);
    } else if (s.type === 'babun') {
      ctext.textContent = 'Fotoğraftaki babunu bulun. (tıkla 👆)';
      next.style.opacity = 0; waitingClick = true; crop.style.cursor = 'crosshair';
    }
  }
  crop.onclick = ev => {
    if (!waitingClick) return;
    const r = img.getBoundingClientRect();
    const rx = (ev.clientX - r.left) / r.width, ry = (ev.clientY - r.top) / r.height;
    const st = $('stage').getBoundingClientRect(), sc = st.width / W;
    if (rx > 875 / 1101 && ry > 0.18 && ry < 0.92) {
      waitingClick = false; crop.style.cursor = '';
      const mk = $('monkey'); mk.style.left = (985 / 1101 * 100) + '%'; mk.style.top = (440 / 1560 * 100) + '%';
      mk.style.fontSize = (r.width / sc * 0.17) + 'px';
      mk.classList.add('on'); SFX.pick();
      setTimeout(step, 700);
    } else {
      const tip = document.createElement('div'); tip.className = 'wrongtip'; tip.textContent = 'Yok o değil 🙄';
      tip.style.left = (ev.clientX - st.left) / sc + 'px'; tip.style.top = (ev.clientY - st.top) / sc + 'px';
      $('mem').appendChild(tip); setTimeout(() => tip.remove(), 1300); SFX.hurt();
    }
  };
  G.memKey = () => { if (waitingKey) { waitingKey = false; next.style.opacity = 0; step(); } };
  function close() {
    $('mem').classList.remove('show'); G.memKey = null;
    setTimeout(() => { G.modal = false; }, 200);
  }
  setTimeout(step, 500);
}

// ---------------- BACKGROUNDS ----------------
function bgCh1(camX) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f3e4c4'); g.addColorStop(1, '#d9bf92');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // windows with warm light (parallax .3)
  for (let i = -1; i < 8; i++) {
    const x = i * 360 - (camX * 0.3) % 360;
    ctx.fillStyle = '#fff3d6'; rr(x + 40, 60, 120, 150, 6); ctx.fill();
    ctx.strokeStyle = '#8b6440'; ctx.lineWidth = 6; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 100, 60); ctx.lineTo(x + 100, 210); ctx.moveTo(x + 40, 135); ctx.lineTo(x + 160, 135); ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = 'rgba(255,220,150,.18)'; ctx.beginPath(); ctx.moveTo(x + 40, 210); ctx.lineTo(x + 160, 210); ctx.lineTo(x + 230, 460); ctx.lineTo(x + 10, 460); ctx.fill();
  }
  // chalkboards with inside jokes (parallax .5)
  const notes = ['Mentos = 1₺', 'Akşam etüdü 19:00', 'Spor: yarın', 'babun ≠ ders', '9-A', 'Free Speech?'];
  for (let i = -1; i < 10; i++) {
    const x = i * 520 + 220 - (camX * 0.5) % 520;
    ctx.fillStyle = '#6b4a2b'; rr(x - 6, 90, 232, 132, 4); ctx.fill();
    ctx.fillStyle = '#2f4a3a'; ctx.fillRect(x, 96, 220, 120);
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '22px "Special Elite", monospace'; ctx.textAlign = 'center';
    const idx = ((Math.floor((camX * 0.5 + x) / 520) % notes.length) + notes.length) % notes.length;
    ctx.fillText(notes[(i + 60 + Math.floor(camX * 0.5 / 520)) % notes.length], x + 110, 162);
  }
  // wainscot
  ctx.fillStyle = '#8b6440'; ctx.fillRect(0, 300, W, 8);
  ctx.fillStyle = '#b08a5c'; ctx.fillRect(0, 308, W, 152);
  for (let i = -1; i < 14; i++) { const x = i * 80 - (camX * 0.8) % 80; ctx.strokeStyle = 'rgba(80,50,20,.3)'; ctx.lineWidth = 2; ctx.strokeRect(x + 8, 320, 64, 125); }
}
function bgCh2(camX) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a0306'); g.addColorStop(0.6, '#5e0a10'); g.addColorStop(1, '#170103');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // giant gold frames (parallax .35)
  for (let i = -1; i < 7; i++) {
    const x = i * 420 - (camX * 0.35) % 420;
    ctx.fillStyle = '#b8892c'; ctx.fillRect(x + 60, 90, 220, 260);
    ctx.fillStyle = '#e0b955'; ctx.fillRect(x + 70, 100, 200, 240);
    const pg = ctx.createRadialGradient(x + 170, 200, 10, x + 170, 220, 160); pg.addColorStop(0, '#7a3a1c'); pg.addColorStop(1, '#1b0805');
    ctx.fillStyle = pg; ctx.fillRect(x + 80, 110, 180, 220);
    ctx.fillStyle = 'rgba(255,200,120,.15)'; ctx.beginPath(); ctx.ellipse(x + 170, 230, 40, 70, 0, 0, 7); ctx.fill();
  }
  // chandeliers (parallax .6)
  for (let i = -1; i < 6; i++) {
    const x = i * 560 + 280 - (camX * 0.6) % 560;
    ctx.strokeStyle = '#d9ae4a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 60); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, 70, 60, 14, 0, 0, Math.PI); ctx.stroke();
    for (let k = -2; k <= 2; k++) {
      const cx = x + k * 26, cy = 72 + (2 - Math.abs(k)) * 5;
      ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(cx, cy - 8, 3, 0, 7); ctx.fill();
      const gl = ctx.createRadialGradient(cx, cy - 8, 0, cx, cy - 8, 26); gl.addColorStop(0, 'rgba(255,210,120,.5)'); gl.addColorStop(1, 'rgba(255,210,120,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy - 8, 26, 0, 7); ctx.fill();
    }
  }
  // curtains
  ctx.fillStyle = '#7d0b14';
  for (let k = 0; k < W; k += 40) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.quadraticCurveTo(k + 20, 34, k + 40, 0); ctx.fill(); }
  ctx.fillStyle = '#d9ae4a'; ctx.fillRect(0, 0, W, 4);
  // embers
  if (Math.random() < 0.35) parts.push({ x: rand(0, W), y: H + 5, vx: rand(-.3, .3), vy: rand(-1.6, -.6), life: 240, max: 240, c: Math.random() < .5 ? '#ffb347' : '#ff5a36', s: rand(1.5, 3.5), g: -0.002, world: false, rot: 0, vr: 0 });
}
function bgCh3(camX, night) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1b0a3a'); g.addColorStop(0.45, '#5b1f8f'); g.addColorStop(0.75, '#e2459d'); g.addColorStop(1, '#ff9a5a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { const sx = (i * 137.5 - camX * 0.05) % W, sy = (i * 71) % 220; ctx.fillStyle = `rgba(255,255,255,${0.3 + (i % 5) * 0.12})`; ctx.fillRect((sx + W) % W, sy, 2, 2); }
  // big glowing planet/moon
  const mx = 720 - camX * 0.04; const mg = ctx.createRadialGradient(mx, 130, 10, mx, 130, 120); mg.addColorStop(0, 'rgba(255,240,255,.95)'); mg.addColorStop(.35, 'rgba(255,170,230,.6)'); mg.addColorStop(1, 'rgba(255,100,200,0)');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, 130, 120, 0, 7); ctx.fill();
  // skylines
  const layer = (par, base, col, win, seed) => {
    for (let i = -1; i < 18; i++) {
      const bw = 60 + ((i * seed) % 5) * 18, bh = base + ((i * seed * 7) % 9) * 22;
      const x = i * 90 - (camX * par) % 90;
      ctx.fillStyle = col; ctx.fillRect(x, H - bh, bw, bh);
      for (let wy = H - bh + 12; wy < H - 20; wy += 18) for (let wx = x + 8; wx < x + bw - 8; wx += 14) {
        if (((wx * 7 + wy * 3 + i) | 0) % 4 === 0) { ctx.fillStyle = win[(wx + wy) % win.length | 0] || win[0]; ctx.fillRect(wx, wy, 6, 8); }
      }
    }
  };
  layer(0.15, 160, '#2a1150', ['#ff6ad5', '#6af2ff'], 3);
  layer(0.35, 110, '#160733', ['#ffd36a', '#ff6ad5', '#6af2ff'], 5);
}

function drawPlat(p, camX, theme) {
  const x = p.x - camX; if (x > W + 20 || x + p.w < -20) return;
  if (theme === 'ch1') {
    if (p.kind === 'ground') {
      ctx.fillStyle = '#a26a3c'; ctx.fillRect(x, p.y, p.w, p.h);
      ctx.fillStyle = '#7d4f2a'; for (let k = 0; k < p.w; k += 48) ctx.fillRect(x + k, p.y, 2, 80);
      ctx.fillStyle = '#c48a55'; ctx.fillRect(x, p.y, p.w, 6);
    } else if (p.kind === 'desk') {
      ctx.fillStyle = '#7a5532'; ctx.fillRect(x + 8, p.y + 10, 8, p.h - 10); ctx.fillRect(x + p.w - 16, p.y + 10, 8, p.h - 10);
      ctx.fillStyle = '#c99a62'; rr(x, p.y, p.w, 12, 3); ctx.fill(); ctx.fillStyle = '#5a3d22'; ctx.fillRect(x + 10, p.y + 12, p.w - 20, 14);
    } else if (p.kind === 'books') {
      const cols = ['#b5452f', '#2f5e8a', '#d1a53a', '#3e7a46', '#7b3f8c'];
      for (let k = 0; k * 17 < p.h; k++) { ctx.fillStyle = cols[k % 5]; rr(x + (k % 2) * 4 - 2, p.y + k * 17, p.w - 2, 16, 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(x + 6 + (k % 2) * 4, p.y + k * 17 + 6, p.w - 18, 2); }
    } else if (p.kind === 'locker') {
      ctx.fillStyle = '#e9e0cf'; ctx.fillRect(x, p.y, p.w, p.h); ctx.strokeStyle = '#9c8f78'; ctx.lineWidth = 2;
      for (let k = 0; k < 2; k++) { ctx.strokeRect(x + 3 + k * p.w / 2, p.y + 3, p.w / 2 - 6, p.h - 6); ctx.fillStyle = '#6b6457'; ctx.fillRect(x + k * p.w / 2 + p.w / 2 - 14, p.y + 30, 4, 14); }
      ctx.fillStyle = '#333'; ctx.font = '11px Inter'; ctx.textAlign = 'left'; ctx.fillText(String(70 + ((p.x / 10) | 0) % 30), x + 8, p.y + 16);
    }
  } else if (theme === 'ch2') {
    const g = ctx.createLinearGradient(0, p.y, 0, p.y + Math.min(p.h, 80)); g.addColorStop(0, '#2b2023'); g.addColorStop(1, '#0d0809');
    ctx.fillStyle = g; ctx.fillRect(x, p.y, p.w, p.h);
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; for (let k = 0; k < p.w; k += 37) { ctx.beginPath(); ctx.moveTo(x + k, p.y + 4); ctx.lineTo(x + k + 20, p.y + Math.min(p.h, 60)); ctx.stroke(); }
    ctx.fillStyle = '#d9ae4a'; ctx.fillRect(x, p.y, p.w, 4); ctx.fillStyle = '#8a6420'; ctx.fillRect(x, p.y + 4, p.w, 2);
  } else {
    // rooftops: building body
    ctx.fillStyle = '#0f0626'; ctx.fillRect(x, p.y, p.w, p.h);
    for (let wy = p.y + 26; wy < H; wy += 26) for (let wx = x + 14; wx < x + p.w - 14; wx += 30) {
      ctx.fillStyle = ((wx - x + wy) / 2 | 0) % 3 ? '#2a1458' : '#ffd36a'; ctx.fillRect(wx, wy, 12, 14);
    }
    ctx.fillStyle = '#ff4fd8'; ctx.shadowColor = '#ff4fd8'; ctx.shadowBlur = 14; ctx.fillRect(x, p.y, p.w, 4); ctx.shadowBlur = 0;
  }
}

function drawPaper(m, camX, t) {
  if (m.got) return;
  const x = m.x - camX, y = m.y + Math.sin(t / 20 + m.x) * 5;
  const gl = ctx.createRadialGradient(x, y, 2, x, y, 40); gl.addColorStop(0, 'rgba(255,240,170,.75)'); gl.addColorStop(1, 'rgba(255,240,170,0)');
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 40, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t / 30 + m.x) * 0.25);
  ctx.fillStyle = '#fbf6e8'; ctx.beginPath();
  ctx.moveTo(-15, -18); ctx.lineTo(13, -20); ctx.lineTo(16, -4); ctx.lineTo(12, 2); ctx.lineTo(17, 18); ctx.lineTo(-4, 15); ctx.lineTo(-9, 20); ctx.lineTo(-16, 16); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#a89470'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#7d6a4a'; ctx.fillRect(-9, -10, 18, 13);
  ctx.restore();
}
function drawExit(L, camX, t) {
  const x = L.exit - camX; if (x > W + 100) return;
  const gy = L.key === 'ch3' ? GY : GY;
  if (L.key === 'ch3') {
    // school entrance
    ctx.fillStyle = '#1d2a4a'; ctx.fillRect(x - 70, gy - 210, 200, 210);
    ctx.fillStyle = '#0b1020'; ctx.fillRect(x - 20, gy - 110, 70, 110);
    ctx.fillStyle = `rgba(255,240,140,${0.6 + Math.sin(t / 10) * 0.2})`; ctx.fillRect(x - 14, gy - 104, 58, 104);
    ctx.fillStyle = '#6af2ff'; ctx.shadowColor = '#6af2ff'; ctx.shadowBlur = 12; ctx.font = 'bold 18px Fredoka'; ctx.textAlign = 'center'; ctx.fillText('AKŞAM ETÜDÜ', x + 30, gy - 180); ctx.shadowBlur = 0;
    for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) { ctx.fillStyle = '#ffd36a'; ctx.fillRect(x - 55 + k * 150, gy - 160 + j * 50, 26, 30); }
    return;
  }
  ctx.fillStyle = L.key === 'ch1' ? '#5a3d22' : '#d9ae4a'; ctx.fillRect(x - 6, gy - 130, 72, 130);
  ctx.fillStyle = '#000'; ctx.fillRect(x, gy - 124, 60, 124);
  const lg = ctx.createLinearGradient(x, 0, x + 60, 0); lg.addColorStop(0, 'rgba(255,255,255,.95)'); lg.addColorStop(1, 'rgba(255,230,170,.6)');
  ctx.fillStyle = lg; ctx.globalAlpha = 0.6 + Math.sin(t / 12) * 0.2; ctx.fillRect(x + 4, gy - 120, 52, 120); ctx.globalAlpha = 1;
  ctx.fillStyle = L.key === 'ch1' ? '#3a2715' : '#f4dc8f'; ctx.font = '14px Inter'; ctx.textAlign = 'center'; ctx.fillText('ÇIKIŞ →', x + 30, gy - 140);
}

function drawHUD() {
  const L = G.level;
  ctx.fillStyle = 'rgba(0,0,0,.45)'; rr(10, 10, 230, 34, 17); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '600 14px Inter'; ctx.textAlign = 'left';
  const got = L.mems.filter(m => m.got).length;
  ctx.fillText(`📜 ${got}/${L.mems.length}   ·   ${L.name}`, 24, 32);
}

// ---------------- PLAY UPDATE ----------------
function updatePlay() {
  const L = G.level;
  const blocked = G.dialog.length > 0 || G.modal;
  if (G.modal) { if (advancePressed() && G.memKey) G.memKey(); return; }
  tickDialog();
  updatePlayer(!blocked);
  updateBot();
  // waiting bot idle look
  if (B.waiting) { B.facing = P.x < B.x ? -1 : 1; }
  // triggers
  for (const t of L.triggers) if (!t.done && P.x > t.x) { t.done = true; t.fn(); }
  // memories
  for (const m of L.mems) if (!m.got && Math.abs(P.x + P.w / 2 - m.x) < 30 && Math.abs(P.y + P.h / 2 - m.y) < 50) {
    m.got = true; collected.push(m.photo);
    burst(m.x, m.y, 26, { colors: ['#fff6c8', '#ffd36a', '#ffffff'], max: 4 });
    openMemory(m);
  }
  // exit
  if (P.x + P.w > L.exit && P.x < L.exit + 60) {
    if (L.mems.some(m => !m.got)) { if (!B.bubble) botSay('Dur, geride anı kaldı.', 120); P.x = L.exit - P.w - 2; }
    else nextLevel();
  }
  // camera
  const target = clamp(P.x - W * 0.38, 0, L.len - W);
  G.camX = lerp(G.camX, target, 0.12);
}

function nextLevel() {
  const i = ORDER.indexOf(G.level.key);
  G.mode = 'trans';
  if (G.level.key === 'ch2' && !G.classDone) fadeTo(startClass);
  else if (i < ORDER.length - 1) showCard(ORDER[i + 1], () => startLevel(ORDER[i + 1]));
  else fadeTo(() => startBoss());
}
let fade = 0, fadeDir = 0, fadeCb = null;
function fadeTo(cb) { fadeDir = 1; fadeCb = cb; }

function drawPlay() {
  const L = G.level, camX = G.camX | 0;
  if (L.key === 'ch1') bgCh1(camX); else if (L.key === 'ch2') bgCh2(camX); else bgCh3(camX);
  drawParts(camX, false);
  if (L.key === 'ch1') { const pg = ctx.createLinearGradient(0, GY, 0, H); pg.addColorStop(0, '#2a1708'); pg.addColorStop(1, '#000'); ctx.fillStyle = pg; ctx.fillRect(0, GY, W, H - GY); }
  if (L.key === 'ch2') { // red glow in pits
    const pg = ctx.createLinearGradient(0, GY, 0, H); pg.addColorStop(0, '#120203'); pg.addColorStop(1, '#ff3a14'); ctx.fillStyle = pg; ctx.fillRect(0, GY, W, H - GY);
  }
  drawExit(L, camX, G.t);
  for (const p of L.plats) drawPlat(p, camX, L.key);
  for (const m of L.mems) drawPaper(m, camX, G.t);
  if (B.active || B.waiting) drawBot(B, camX);
  drawDGC(P, camX);
  drawParts(camX, true);
  if (L.key === 'ch1') { ctx.globalAlpha = 0.9; ctx.drawImage(grain, -rand(0, 100), -rand(0, 100), W + 200, H + 200); ctx.globalAlpha = 1; const v = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 620); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,30,0,.35)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
  if (L.key === 'ch2') { const v = ctx.createRadialGradient(W / 2, H / 2, 220, W / 2, H / 2, 600); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
  drawHUD();
  drawBubbles();
}
function drawBubbles() {
  if (G.dialog.length) {
    const d = G.dialog[0], p = speakerPos(d.who);
    bubble(p.x, p.y, shownText(d) || ' ', d.type === 'slow' ? 'say' : d.type);
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '600 12px Inter'; ctx.textAlign = 'center';
    ctx.fillText('ENTER ↵', W / 2, H - 14);
  }
  if (B.bubble && !(G.dialog.length && G.dialog[0].who === 'bot')) { const p = speakerPos('bot'); bubble(p.x, p.y, B.bubble.text, B.bubble.type || 'say', clamp(B.bubble.t / 20, 0, 1)); }
  if (boss && boss.bubble) { const p = speakerPos(boss.type); bubble(p.x, p.y, boss.bubble.text, boss.bubble.type, clamp(boss.bubble.t / 15, 0, 1)); }
}

// =========================================================
//                       BOSS ARENA
// =========================================================
const AGY = 470;
const ARENA = { plats: [{ x: -100, y: AGY, w: W + 200, h: 200 }, { x: -60, y: -400, w: 60, h: 1000 }, { x: W, y: -400, w: 60, h: 1000 }] };
let boss = null, projs = [], waves = [], slipper = null, arenaPhase = '', arenaT = 0, doorOpen = false;

function startBoss() {
  G.mode = 'boss'; G.arena = 'etut'; G.level = LEVELS.ch3; G.camX = 0; parts = []; projs = []; waves = []; slipper = null; doorOpen = false;
  P.x = 140; P.y = AGY - P.h; P.vx = P.vy = 0; P.facing = 1; P.hp = 3;
  B.active = true; B.x = 40; B.y = AGY - B.h; B.facing = 1; B.moving = false; B.bubble = null; B.hop = 0;
  makeHarun();
  arenaPhase = 'harunIntro';
  setTimeout(() => runDialog([say('bot', 'Free Speech var mı?'), say('harun', 'BEN VURALIN SOL TAŞŞAĞIYIM LAAAAN!', 'shout')], () => { boss.state = 'idle'; boss.t = 40; arenaPhase = 'harun'; }), 700);
}
function makeHarun() {
  boss = { type: 'harun', x: 700, y: AGY - 150, w: 110, h: 150, hp: 3, state: 'intro', t: 0, facing: -1, cycle: 0, glasses: 5, vx: 0, vy: 0, flash: 0, bubble: null, sit: false, bull: false, speedUp: 0, gone: 0 };
}
function makeSevgi() {
  boss = { type: 'sevgi', x: W + 40, y: AGY - 80, w: 210, h: 80, hp: 2, state: 'emerge', t: 0, facing: -1, vx: 0, vy: 0, flash: 0, bubble: null, fly: false, stun: 0, flipped: false, flat: 0, legs: 0 };
}
function bossShout(text, t = 110) { boss.bubble = { text, t, type: 'shout' }; G.shake = Math.max(G.shake, 6); SFX.boom(); }

function hurtPlayer() {
  if (P.blink > 0) return;
  P.hp--; P.blink = 70; P.sweat = 60; SFX.hurt(); G.shake = 10;
  P.vy = -7; P.vx = 0; P.x += (P.x < (boss ? boss.x : 0) ? -30 : 30);
  if (P.hp <= 0) {
    const t = boss.type; arenaPhase = 'dead'; projs = []; waves = []; P.dizzy = 200;
    setTimeout(() => {
      runDialog([say('bot', 'Ben buradayım kardeşim, tekrar dene.')], () => {
        P.hp = 3; P.x = 140; P.y = AGY - P.h; P.blink = 60; P.dizzy = 0; projs = []; waves = [];
        if (t === 'vural') { resetVuralFight(); }
        else if (t === 'harun') { makeHarun(); boss.state = 'idle'; boss.t = 60; arenaPhase = 'harun'; }
        else { makeSevgi(); boss.x = W - 260; boss.y = AGY - boss.h; boss.state = 'idle'; boss.t = 60; arenaPhase = 'sevgi'; }
      });
    }, 900);
  }
}

function updHarun() {
  const h = boss, sp = 1 + h.speedUp * 0.35;
  if (h.flash > 0) h.flash--;
  if (h.bubble) { h.bubble.t--; if (h.bubble.t <= 0) h.bubble = null; }
  if (h.state === 'intro') return;
  h.t--;
  const px = P.x + P.w / 2, hx = h.x + h.w / 2;
  switch (h.state) {
    case 'idle':
      h.facing = px < hx ? -1 : 1; h.bull = false;
      if (h.t <= 0) {
        const seq = ['charge', 'throw', 'slam', 'refill'];
        const nx = seq[h.cycle % 4]; h.cycle++;
        if (nx === 'charge') { h.state = 'chargePrep'; h.t = 55; bossShout('SINIFINIZA GEÇİN LAAAAAAAN!'); }
        if (nx === 'throw') { h.state = 'throw'; h.t = 30; h.glasses = 5 + h.speedUp; bossShout('DERS ÇALIŞIN LAAAAAAAAAN!'); }
        if (nx === 'slam') { h.state = 'slamPrep'; h.t = 45; bossShout('OĞLUM TUVALETTE NAPIYORSUNUZ HEPİNİZİ YİYECEĞİM HAHAHAHAH!', 140); }
        if (nx === 'refill') { h.state = 'refill'; h.t = 190 - h.speedUp * 25; h.sit = true; h.glasses = 0; }
      }
      break;
    case 'chargePrep':
      h.bull = true; if (G.t % 8 === 0) burst(hx - h.facing * 40, AGY - 4, 4, { colors: ['#bba98a', '#8a7b63'], max: 2, up: 1 });
      if (h.t <= 0) { h.state = 'charge'; h.vx = h.facing * 8.5 * sp; }
      break;
    case 'charge':
      h.x += h.vx; if (G.t % 3 === 0) burst(h.x + (h.vx > 0 ? 0 : h.w), AGY - 4, 2, { colors: ['#bba98a'], max: 2, up: 1 });
      if (h.x < 100 || h.x + h.w > W - 20) { h.x = clamp(h.x, 100, W - 20 - h.w); h.vx = 0; G.shake = 8; SFX.boom(); h.state = 'idle'; h.t = 45; h.facing *= -1; }
      break;
    case 'throw':
      if (h.t <= 0 && h.glasses > 0) {
        h.glasses--; h.t = Math.max(14, 26 - h.speedUp * 4);
        const ox = hx + h.facing * 50, oy = h.y + 40;
        const tx = px + rand(-60, 60), flight = rand(48, 62);
        projs.push({ x: ox, y: oy, vx: (tx - ox) / flight, vy: -9 - rand(0, 2), r: 9, kind: 'tea', rot: 0 });
      } else if (h.t <= 0) { h.state = 'idle'; h.t = 40; }
      break;
    case 'slamPrep':
      if (h.t <= 0) { h.state = 'slamAir'; h.vy = -16; h.vx = clamp((px - hx) / 50, -7, 7); }
      break;
    case 'slamAir':
      h.vy += 0.6; h.y += h.vy; h.x = clamp(h.x + h.vx, 100, W - 20 - h.w);
      if (h.y >= AGY - h.h) {
        h.y = AGY - h.h; G.shake = 16; SFX.boom();
        burst(hx, AGY, 30, { colors: ['#c9b48f', '#8a7b63', '#fff'], max: 6, up: 3 });
        waves.push({ x: hx, dir: -1, sp: 5.5 * sp, h: 30 }, { x: hx, dir: 1, sp: 5.5 * sp, h: 30 });
        h.state = 'idle'; h.t = 70;
      }
      break;
    case 'refill':
      if (G.t % 20 === 0) h.glasses = Math.min(5, h.glasses + 1);
      if (h.t <= 0) { h.sit = false; h.state = 'idle'; h.t = 40; }
      break;
    case 'down':
      if (h.t <= 0 && !h.downDone) {
        h.downDone = true;
        runDialog([say('harun', '...Hadi oğlum geçin gidin. Daha uğraştırmayın.')], () => { h.state = 'leave'; setMusicVol(45); });
      }
      break;
    case 'leave':
      h.x += 1.4; h.gone += 0.008; if (h.x > W + 40) { boss = null; sevgiIntro(); }
      break;
  }
  // collisions
  const body = { x: h.x + 10, y: h.y + 20, w: h.w - 20, h: h.h - 20 };
  if (h.state === 'refill') {
    const headTop = AGY - 146;
    const head = { x: hx - 38, y: headTop - 8, w: 76, h: 36 };
    if (P.vy > 0 && overlap(P, head) && P.y + P.h < headTop + 22) {
      P.vy = -12; h.hp--; h.flash = 30; SFX.stomp(); G.shake = 10;
      burst(hx, h.y + 50, 20, { colors: ['#ffe36a', '#fff'], max: 6 });
      h.bubble = { text: ['ÇAYIM!!', 'AAAH LAAAN!', 'NEREYE LAN!'][2 - h.hp] || 'AAH!', t: 60, type: 'shout' };
      h.speedUp++; h.sit = false;
      if (h.hp <= 0) { h.state = 'down'; h.t = 70; h.bull = false; projs = []; waves = []; setMusicVol(18); }
      else { h.state = 'idle'; h.t = 50; h.glasses = 5; }
    }
  } else if (!['down', 'leave'].includes(h.state) && overlap(P, h.bull ? { x: h.x, y: h.y + 70, w: h.w, h: 100 } : body)) hurtPlayer();
}

function sevgiIntro() {
  arenaPhase = 'sevgiIntro';
  G.shake = 30; SFX.boom(); setTimeout(() => { G.shake = 30; SFX.boom(); }, 500);
  makeSevgi();
  setTimeout(() => {
    boss.state = 'emerging';
    runDialog([say('bot', 'ben bunun tipini skm')], () => { boss.state = 'idle'; boss.t = 40; arenaPhase = 'sevgi'; });
  }, 1100);
}

function updSevgi() {
  const s = boss; s.legs += s.state === 'run' || s.state === 'emerging' ? 0.8 : 0.25;
  if (s.flash > 0) s.flash--;
  if (s.bubble) { s.bubble.t--; if (s.bubble.t <= 0) s.bubble = null; }
  const px = P.x + P.w / 2, sx = s.x + s.w / 2;
  if (s.state === 'emerge') return;
  if (s.state === 'emerging') { if (s.x > W - 260) s.x -= 3; return; }
  s.t--;
  switch (s.state) {
    case 'idle':
      s.facing = px < sx ? -1 : 1; s.fly = false;
      if (s.t <= 0) {
        if ((s.cyc = (s.cyc || 0) + 1) % 2) { s.state = 'runPrep'; s.t = 40; s.bubble = { text: 'tıkıtıkıtıkı', t: 50, type: 'say' }; }
        else { s.state = 'takeoff'; s.t = 40; s.fly = true; }
      }
      break;
    case 'runPrep': if (s.t <= 0) { s.state = 'run'; s.vx = s.facing * 10; } break;
    case 'run':
      s.x += s.vx;
      if (s.x < 90 || s.x + s.w > W - 10) { s.x = clamp(s.x, 90, W - 10 - s.w); s.state = 'idle'; s.t = 30; }
      break;
    case 'takeoff': s.y -= 4.2; if (s.t <= 0) { s.state = 'hover'; s.t = 80; } break;
    case 'hover':
      s.x += clamp((px - sx) * 0.05, -4, 4); s.y = AGY - 330 + Math.sin(G.t / 6) * 8;
      if (s.t <= 0) { s.state = 'dive'; s.tx = px; s.vy = 2; }
      break;
    case 'dive':
      s.vy += 0.9; s.y += s.vy; s.x += clamp((s.tx - sx) * 0.08, -6, 6);
      if (s.y >= AGY - s.h) { s.y = AGY - s.h; s.fly = false; s.state = 'stunned'; s.t = 150; G.shake = 10; SFX.boom(); burst(sx, AGY, 18, { colors: ['#c9b48f', '#fff'], max: 5, up: 2 }); }
      break;
    case 'stunned':
      if (s.t <= 0) { s.state = 'idle'; s.t = 30; }
      break;
    case 'flipped':
      break;
  }
  // collisions
  const body = { x: s.x + 20, y: s.y + 10, w: s.w - 40, h: s.h - 10 };
  if (s.state === 'stunned') {
    const top = { x: s.x + 20, y: s.y, w: s.w - 40, h: 30 };
    if (P.vy > 0 && overlap(P, top) && P.y + P.h < s.y + 26) {
      P.vy = -12; s.hp--; s.flash = 25; SFX.stomp(); G.shake = 8; burst(sx, s.y, 16, { colors: ['#fff', '#ffe36a'], max: 5 });
      if (s.hp <= 0) { s.state = 'flipped'; s.flipped = true; G.slow = 0.35; arenaPhase = 'terlik'; projs = []; }
      else { s.state = 'idle'; s.t = 40; s.bubble = { text: 'Tısss!', t: 50, type: 'say' }; }
    }
  } else if (!['flipped', 'dead'].includes(s.state) && overlap(P, body)) hurtPlayer();
}

function updSlipper() {
  if (!slipper) return;
  slipper.t++;
  const k = clamp(slipper.t / slipper.dur, 0, 1);
  slipper.x = lerp(slipper.x0, slipper.x1, k); slipper.y = lerp(slipper.y0, slipper.y1, k) - Math.sin(k * Math.PI) * 160; slipper.rot += 0.35;
  if (k >= 1) {
    slipper = null; G.slow = 1; G.shake = 26; SFX.sap();
    boss.state = 'dead'; boss.flat = 1;
    burst(boss.x + boss.w / 2, AGY - 20, 40, { colors: ['#ffe36a', '#fff', '#ff4fd8', '#6af2ff'], max: 9, up: 3 });
    G.sapT = 70;
    setTimeout(() => { doorOpen = true; arenaPhase = 'exit'; botSay('Hadi kaçalım, kapı açıldı!', 160); }, 1600);
  }
}

function updateBossMode() {
  tickDialog();
  const blocked = G.dialog.length > 0 || ['harunIntro', 'sevgiIntro', 'dead', 'throwing', 'cut', 'vdown'].includes(arenaPhase);
  updatePlayer(!blocked);
  if (B.bubble) { B.bubble.t--; if (B.bubble.t <= 0) B.bubble = null; }
  if (boss && arenaPhase !== 'dead' && (!G.dialog.length || boss.state === 'emerging')) { if (boss.type === 'harun') updHarun(); else if (boss.type === 'vural') updVural(); else updSevgi(); }
  if (G.arena === 'class') updClassExtras();
  // projectiles
  for (const p of projs) {
    p.vy += 0.4; p.x += p.vx; p.y += p.vy; p.rot += 0.2;
    if (overlap(P, { x: p.x - 8, y: p.y - 10, w: 16, h: 20 })) { p.dead = true; hurtPlayer(); burst(p.x, p.y, 10, { colors: ['#b5501d', '#fff'], max: 4 }); SFX.glass(); }
    if (p.y > AGY - 6) { p.dead = true; burst(p.x, AGY - 4, 12, { colors: ['#d9f1ff', '#b5501d', '#fff'], max: 4, up: 2 }); SFX.glass(); }
  }
  projs = projs.filter(p => !p.dead);
  for (const w of waves) {
    w.x += w.dir * w.sp;
    if (overlap(P, { x: w.x - 12, y: AGY - w.h, w: 24, h: w.h })) hurtPlayer();
    if (G.t % 3 === 0) burst(w.x, AGY - 6, 2, { colors: ['#e9d7b0'], max: 2, up: 1 });
  }
  waves = waves.filter(w => w.x > -40 && w.x < W + 40);
  // terlik!
  if (arenaPhase === 'terlik' && hit('t')) {
    arenaPhase = 'throwing';
    B.bubble = { text: 'Hadi sg la.', t: 140, type: 'say' };
    B.hop = -14; setTimeout(() => B.hop = 0, 300);
    slipper = { x0: B.x + 20, y0: B.y + 10, x1: boss.x + boss.w / 2, y1: boss.y + 30, t: 0, dur: 55, rot: 0, x: 0, y: 0 };
    B.facing = 1;
  }
  updSlipper();
  if (G.sapT) G.sapT--;
  // exit door
  if (doorOpen && P.x > W - 120) { doorOpen = false; arenaPhase = 'done'; fadeTo(startFinal); }
}

// ----- boss drawing -----
function drawArena() {
  // night corridor
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1230'); g.addColorStop(1, '#1b2550');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // fluorescent lights
  for (let i = 0; i < 4; i++) {
    const x = 90 + i * 240, on = !(i === 2 && Math.sin(G.t / 3) > 0.7);
    ctx.fillStyle = on ? '#eaf4ff' : '#556'; ctx.fillRect(x, 20, 120, 8);
    if (on) { const lg = ctx.createLinearGradient(0, 28, 0, 300); lg.addColorStop(0, 'rgba(200,225,255,.22)'); lg.addColorStop(1, 'rgba(200,225,255,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(x, 28); ctx.lineTo(x + 120, 28); ctx.lineTo(x + 200, 300); ctx.lineTo(x - 80, 300); ctx.fill(); }
  }
  // lockers
  for (let i = 0; i < 12; i++) { const x = 20 + i * 52; if (x > 250 && x < 560) continue; ctx.fillStyle = '#c9c2b2'; ctx.fillRect(x, 270, 48, 200); ctx.strokeStyle = '#8c8574'; ctx.lineWidth = 2; ctx.strokeRect(x + 3, 273, 42, 96); ctx.strokeRect(x + 3, 372, 42, 94); ctx.fillStyle = '#333'; ctx.font = '10px Inter'; ctx.textAlign = 'left'; ctx.fillText(String(79 + i), x + 6, 286); }
  // doors + signs
  const door = (x, label) => { ctx.fillStyle = '#5a3d22'; ctx.fillRect(x, 300, 80, 170); ctx.fillStyle = '#e8f0ff'; ctx.fillRect(x + 10, 238, 60, 26); ctx.fillStyle = '#0b1230'; ctx.font = 'bold 13px Inter'; ctx.textAlign = 'center'; ctx.fillText(label, x + 40, 256); ctx.fillStyle = '#d9b26b'; ctx.fillRect(x + 64, 385, 8, 4); };
  door(280, 'ETÜT 1'); door(380, 'WC');
  // tea station
  ctx.fillStyle = '#7a5532'; ctx.fillRect(475, 400, 80, 70); ctx.fillStyle = '#c0c0c8'; ctx.beginPath(); ctx.ellipse(500, 392, 14, 10, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#9a9aa5'; ctx.beginPath(); ctx.ellipse(500, 378, 10, 8, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#e8f0ff'; ctx.fillRect(478, 330, 74, 22); ctx.fillStyle = '#0b1230'; ctx.font = 'bold 11px Inter'; ctx.fillText('ÇAY OCAĞI', 515, 345);
  // exit door right
  ctx.fillStyle = '#26324f'; ctx.fillRect(W - 100, 250, 90, 220);
  if (doorOpen || arenaPhase === 'done') { const dg = ctx.createLinearGradient(W - 95, 0, W - 15, 0); dg.addColorStop(0, '#ff4fd8'); dg.addColorStop(1, '#ffd36a'); ctx.fillStyle = dg; ctx.fillRect(W - 95, 255, 80, 215); ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Fredoka'; ctx.textAlign = 'center'; ctx.fillText('ÇIKIŞ →', W - 55, 240); }
  else { ctx.fillStyle = '#3d4a6e'; ctx.fillRect(W - 95, 255, 80, 215); }
  // floor: red/cream tiles like the photos
  for (let i = 0; i < 24; i++) for (let j = 0; j < 3; j++) { ctx.fillStyle = (i + j) % 2 ? '#c4573a' : '#e8d9be'; ctx.fillRect(i * 40, AGY + j * 24, 40, 24); }
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, AGY, W, 4);
}

function drawHarun(h) {
  if (!h) return;
  const cx = h.x + h.w / 2, fy = h.y + h.h, f = h.facing;
  ctx.save();
  if (h.state === 'leave') { ctx.globalAlpha = clamp(1 - h.gone, 0, 1); }
  if (h.flash && Math.floor(h.flash / 3) % 2) ctx.filter = 'brightness(2.2)';
  const sit = h.sit, shrink = (h.state === 'down' || h.state === 'leave' ? 0.78 : 0.85);
  ctx.translate(cx, fy); ctx.scale(shrink, shrink);
  if (h.bull) ctx.rotate(f * 0.35);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 2, 70, 9, 0, 0, 7); ctx.fill();
  const bob = h.state === 'charge' ? Math.sin(G.t) * 3 : 0;
  // legs
  ctx.fillStyle = '#2b2b33';
  if (sit) { rr(-48, -36, 40, 30, 8); ctx.fill(); rr(8, -36, 40, 30, 8); ctx.fill(); }
  else { const l = h.state === 'charge' ? Math.sin(G.t * 0.8) * 10 : 0; rr(-40 + l, -55, 32, 55, 8); ctx.fill(); rr(8 - l, -55, 32, 55, 8); ctx.fill(); }
  ctx.fillStyle = '#111'; rr(-46, -10, 40, 12, 5); ctx.fill(); rr(6, -10, 40, 12, 5); ctx.fill();
  const ty = sit ? 55 : 0;
  // torso: big ox body, shirt + brown vest
  ctx.fillStyle = '#9fc0e0'; rr(-62, -150 + ty + bob, 124, 104, 30); ctx.fill();
  ctx.fillStyle = '#6b4a2e'; rr(-62, -150 + ty + bob, 40, 104, 24); ctx.fill(); rr(22, -150 + ty + bob, 40, 104, 24); ctx.fill();
  // arms
  ctx.fillStyle = '#9fc0e0'; rr(-84, -142 + ty + bob, 28, 70, 14); ctx.fill(); rr(56, -142 + ty + bob, 28, 70, 14); ctx.fill();
  ctx.fillStyle = '#e2a87e'; ctx.beginPath(); ctx.arc(-70, -70 + ty + bob, 13, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(70, -70 + ty + bob, 13, 0, 7); ctx.fill();
  // tray with tea glasses (front hand)
  if (h.state !== 'down' && h.state !== 'leave') {
    const tx = f * 72, tyy = -78 + ty + bob;
    ctx.fillStyle = '#c9ccd4'; ctx.beginPath(); ctx.ellipse(tx, tyy, 40, 8, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#8b8f99'; ctx.lineWidth = 2; ctx.stroke();
    for (let k = 0; k < Math.min(5, h.glasses); k++) drawTea(tx - 28 + k * 14, tyy - 2, 1);
    if (sit) { // pouring kettle
      ctx.fillStyle = '#b8bcc6'; ctx.beginPath(); ctx.ellipse(-f * 60, -110 + ty, 18, 14, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#b5501d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-f * 44, -108 + ty); ctx.quadraticCurveTo(0, -100 + ty, tx * 0.5, tyy - 8); ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#c9ccd4'; ctx.beginPath(); ctx.ellipse(f * 40, -4, 40, 7, 0.1, 0, 7); ctx.fill();
  }
  // head
  const hy = -178 + ty + bob;
  if (sit) { const gl = ctx.createRadialGradient(0, hy - 10, 10, 0, hy - 10, 70); gl.addColorStop(0, `rgba(255,255,160,${0.5 + Math.sin(G.t / 4) * 0.3})`); gl.addColorStop(1, 'rgba(255,255,160,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, hy - 10, 70, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#e2a87e'; ctx.beginPath(); ctx.ellipse(0, hy, 40, 46, 0, 0, 7); ctx.fill();
  // receding hairline: side hair only + shiny forehead
  ctx.fillStyle = '#2a1d14';
  ctx.beginPath(); ctx.ellipse(-36, hy - 12, 9, 22, 0.2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(36, hy - 12, 9, 22, -0.2, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, hy - 44, 10, 4, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(-12, hy - 30, 12, 6, -0.4, 0, 7); ctx.fill();
  // beard
  ctx.fillStyle = '#2a1d14'; ctx.beginPath(); ctx.moveTo(-40, hy - 4); ctx.quadraticCurveTo(-42, hy + 52, 0, hy + 60); ctx.quadraticCurveTo(42, hy + 52, 40, hy - 4); ctx.quadraticCurveTo(28, hy + 22, 0, hy + 22); ctx.quadraticCurveTo(-28, hy + 22, -40, hy - 4); ctx.fill();
  // eyes + angry brows
  const angry = h.state !== 'down' && h.state !== 'leave';
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-15, hy - 4, 8, 6, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(15, hy - 4, 8, 6, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-15 + f * 3, hy - 3, 3.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(15 + f * 3, hy - 3, 3.5, 0, 7); ctx.fill();
  ctx.strokeStyle = '#2a1d14'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); if (angry) { ctx.moveTo(-26, hy - 18); ctx.lineTo(-6, hy - 11); ctx.moveTo(26, hy - 18); ctx.lineTo(6, hy - 11); } else { ctx.moveTo(-24, hy - 12); ctx.lineTo(-6, hy - 16); ctx.moveTo(24, hy - 12); ctx.lineTo(6, hy - 16); } ctx.stroke();
  // mouth
  const shouting = !!h.bubble;
  ctx.fillStyle = '#5a1010'; ctx.beginPath(); if (shouting) ctx.ellipse(0, hy + 26, 14, 11 + Math.sin(G.t) * 3, 0, 0, 7); else ctx.ellipse(0, hy + 26, 10, 3, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#e2a87e'; ctx.beginPath(); ctx.ellipse(0, hy + 10, 7, 6, 0, 0, 7); ctx.fill();
  // anger vein + steam
  if (angry && !sit) {
    ctx.font = '26px "Segoe UI Emoji"'; ctx.textAlign = 'center'; ctx.fillText('💢', 30, hy - 30);
    if (G.t % 10 === 0) burst(cx + f * 8, fy - 140, 2, { colors: ['rgba(255,255,255,.7)'], max: 1.5, g: -0.05, size: 6, life: 30 });
  }
  if (h.state === 'down') { ctx.font = '22px "Segoe UI Emoji"'; ctx.fillText('💧', -40, hy); }
  ctx.restore();
  // HP bar
  if (!['down', 'leave'].includes(h.state)) drawBossBar('HARUN HOCA', h.hp, 3);
}
function drawTea(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(230,245,255,.85)'; ctx.beginPath(); ctx.moveTo(-5, -16); ctx.quadraticCurveTo(-2, -8, -4, 0); ctx.lineTo(4, 0); ctx.quadraticCurveTo(2, -8, 5, -16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b5401a'; ctx.beginPath(); ctx.moveTo(-4.5, -12); ctx.quadraticCurveTo(-2, -7, -3.5, -1); ctx.lineTo(3.5, -1); ctx.quadraticCurveTo(2, -7, 4.5, -12); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawBossBar(name, hp, max) {
  ctx.fillStyle = 'rgba(0,0,0,.55)'; rr(W / 2 - 160, 14, 320, 40, 10); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '18px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText(name, W / 2, 32);
  ctx.fillStyle = '#400'; ctx.fillRect(W / 2 - 140, 38, 280, 9);
  ctx.fillStyle = '#ff3b3b'; ctx.fillRect(W / 2 - 140, 38, 280 * hp / max, 9);
}

function drawSevgi(s) {
  if (!s || s.state === 'emerge') { drawCrack(); return; }
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
  ctx.save(); ctx.translate(cx, cy);
  if (s.flash && Math.floor(s.flash / 3) % 2) ctx.filter = 'brightness(2)';
  if (s.state === 'dead') ctx.scale(1.15, 0.18 + 0.82 * (1 - s.flat) ), ctx.translate(0, s.h * 2);
  if (s.flipped && s.state !== 'dead') ctx.scale(1, -1);
  ctx.scale(-s.facing, 1);
  // wings
  if (s.fly) { ctx.fillStyle = 'rgba(200,170,120,.45)'; const wa = Math.sin(G.t * 1.6) * 0.6; ctx.save(); ctx.rotate(-0.3 + wa); ctx.beginPath(); ctx.ellipse(10, -40, 80, 24, -0.3, 0, 7); ctx.fill(); ctx.restore(); }
  // legs
  ctx.strokeStyle = '#3a1f0e'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const lx = -50 + k * 45, sw = Math.sin(s.legs + k * 2) * 12 * (s.flipped ? 1.6 : 1);
    ctx.beginPath(); ctx.moveTo(lx, 18); ctx.lineTo(lx - 14 + sw, 34); ctx.lineTo(lx - 22 + sw, 44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx + 8, 18); ctx.lineTo(lx + 20 - sw, 34); ctx.lineTo(lx + 28 - sw, 44); ctx.stroke();
  }
  // body
  const bg = ctx.createLinearGradient(0, -36, 0, 30); bg.addColorStop(0, '#7a3f17'); bg.addColorStop(1, '#3a1a08');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(10, 0, 88, 34, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2; for (let k = -2; k <= 3; k++) { ctx.beginPath(); ctx.ellipse(10 + k * 22, 0, 6, 30, 0, -1.3, 1.3); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,220,180,.35)'; ctx.beginPath(); ctx.ellipse(0, -18, 50, 7, 0, 0, 7); ctx.fill();
  // head
  ctx.fillStyle = '#4a240c'; ctx.beginPath(); ctx.ellipse(-86, 2, 26, 22, 0, 0, 7); ctx.fill();
  // antennae
  ctx.strokeStyle = '#3a1f0e'; ctx.lineWidth = 3;
  const aw = Math.sin(G.t / 4) * 10 + (s.state === 'runPrep' ? Math.sin(G.t) * 14 : 0);
  ctx.beginPath(); ctx.moveTo(-100, -12); ctx.quadraticCurveTo(-140, -70 + aw, -190, -50 + aw); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-94, -16); ctx.quadraticCurveTo(-120, -90 - aw, -160, -100 - aw); ctx.stroke();
  // eyes
  if (s.state === 'dead' || s.flipped) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    [[-98, -4], [-78, -6]].forEach(([ex, ey]) => { ctx.beginPath(); ctx.moveTo(ex - 6, ey - 6); ctx.lineTo(ex + 6, ey + 6); ctx.moveTo(ex + 6, ey - 6); ctx.lineTo(ex - 6, ey + 6); ctx.stroke(); });
  } else {
    [[-98, -4], [-76, -6]].forEach(([ex, ey]) => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, 10, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ex - 3, ey + 1, 4.5, 0, 7); ctx.fill(); });
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-108, -18); ctx.lineTo(-90, -14); ctx.moveTo(-84, -16); ctx.lineTo(-66, -20); ctx.stroke();
  }
  ctx.restore();
  if (s.state === 'stunned') { ctx.font = '18px "Segoe UI Emoji"'; ctx.textAlign = 'center'; for (let i = 0; i < 3; i++) { const t = G.t / 8 + i * 2.1; ctx.fillText('⭐', cx + Math.cos(t) * 50, s.y - 10 + Math.sin(t) * 8); } }
  if (!['dead'].includes(s.state) && s.state !== 'emerging') drawBossBar('SEVGİ HOCA', Math.max(0, s.hp), 2);
}
function drawCrack() {
  if (arenaPhase !== 'sevgiIntro') return;
  ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(W - 120, 300); ctx.lineTo(W - 140, 360); ctx.lineTo(W - 115, 400); ctx.lineTo(W - 150, 470); ctx.stroke();
}

function drawBossMode() {
  ctx.save();
  if (G.shake > 0) { ctx.translate(rand(-G.shake, G.shake), rand(-G.shake, G.shake)); G.shake *= 0.86; if (G.shake < 0.5) G.shake = 0; }
  if (G.arena === 'class') drawClassroom(); else drawArena();
  drawParts(0, false);
  for (const w of waves) { ctx.fillStyle = 'rgba(240,220,170,.85)'; ctx.beginPath(); ctx.moveTo(w.x - 14, AGY); ctx.quadraticCurveTo(w.x, AGY - w.h * 1.6, w.x + 14, AGY); ctx.fill(); }
  if (boss && boss.type === 'harun') drawHarun(boss);
  if (G.arena === 'class') drawClassActors();
  if (boss && boss.type === 'sevgi') drawSevgi(boss); else if (arenaPhase === 'sevgiIntro') drawCrack();
  drawBot(B, 0);
  drawDGC(P, 0);
  for (const p of projs) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); drawTea(0, 8, 1.3); ctx.restore(); }
  if (slipper) { ctx.save(); ctx.translate(slipper.x, slipper.y); ctx.rotate(slipper.rot); ctx.font = '48px "Segoe UI Emoji"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🩴', 0, 0); ctx.restore(); ctx.textBaseline = 'alphabetic'; }
  drawParts(0, true);
  if (G.arena === 'class') drawClassFront();
  ctx.restore();
  if (G.arena === 'class') drawClassOverlay();
  // hearts
  ctx.font = '22px "Segoe UI Emoji"'; ctx.textAlign = 'left';
  if (arenaPhase !== 'cut') { for (let i = 0; i < 3; i++) { ctx.globalAlpha = i < P.hp ? 1 : 0.2; ctx.fillText('❤️', 16 + i * 30, 36); } ctx.globalAlpha = 1; }
  // hint
  if (boss && boss.type === 'harun' && boss.state === 'refill' && boss.hp === 3) { ctx.fillStyle = '#fff'; ctx.font = '20px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('ÇAY DOLDURUYOR → KAFASINA ZIPLA!', W / 2, 90); }
  if (boss && boss.type === 'sevgi' && boss.state === 'stunned' && boss.hp === 2) { ctx.fillStyle = '#fff'; ctx.font = '20px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('SERSEMLEDİ → ÜSTÜNE ZIPLA!', W / 2, 90); }
  if (arenaPhase === 'terlik') {
    const s = 1 + Math.sin(G.t / 4) * 0.08;
    ctx.save(); ctx.translate(W / 2, H / 2 - 40); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,.6)'; rr(-210, -50, 420, 100, 24); ctx.fill();
    ctx.fillStyle = '#ffe14a'; ctx.font = '54px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('[ T ]  🩴  TERLİK!', 0, 20);
    ctx.restore();
  }
  if (G.sapT) {
    const k = G.sapT / 70; ctx.save(); ctx.translate(W / 2, H / 2 - 30); ctx.scale(1 + (1 - k) * 0.6, 1 + (1 - k) * 0.6); ctx.rotate(-0.1);
    ctx.globalAlpha = clamp(k * 2, 0, 1); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#c40d0d'; ctx.lineWidth = 10; ctx.font = '130px Bangers, Impact'; ctx.textAlign = 'center';
    ctx.strokeText('ŞAP!', 0, 40); ctx.fillText('ŞAP!', 0, 40); ctx.restore(); ctx.globalAlpha = 1;
  }
  drawBubbles();
}

// =========================================================
//                          FINAL
// =========================================================
let finalStep = 0, caps = [], fireworks = [];
function startFinal() {
  G.mode = 'final'; parts = []; caps = []; finalStep = 0;
  P.x = 400; P.y = AGY - P.h; P.facing = 1; P.moving = false; P.blink = 0; P.dizzy = 0;
  B.x = 520; B.y = AGY - B.h; B.facing = -1; B.moving = false; B.noMentos = false; B.bubble = null;
  for (let i = 0; i < 9; i++) caps.push({ x: rand(150, 810), y: AGY - 20, vy: -rand(11, 16), vx: rand(-2, 2), rot: rand(0, 6), vr: rand(-.2, .2) });
  setTimeout(() => runDialog([say('bot', 'Mentos ister misin? Bu sefer bedava.')], () => { B.noMentos = true; SFX.pick(); setTimeout(showCollage, 900); }), 1500);
}
function updFinal() {
  tickDialog();
  for (const c of caps) { c.vy += 0.25; c.x += c.vx; c.y += c.vy; c.rot += c.vr; if (c.y > AGY - 6) { c.y = AGY - 6; c.vy = 0; c.vx *= 0.8; c.vr = 0; } }
  if (Math.random() < 0.05) fireworks.push({ x: rand(100, W - 100), y: H, vy: -rand(8, 11), c: ['#ff4fd8', '#6af2ff', '#ffd36a', '#a57bff', '#ffffff'][(Math.random() * 5) | 0] });
  for (const f of fireworks) { f.y += f.vy; f.vy += 0.15; if (f.vy > -1.5 && !f.done) { f.done = true; burst(f.x, f.y, 50, { colors: [f.c, '#fff'], min: 1, max: 5, g: 0.05, life: 70, world: false, size: 3 }); SFX.boom(); } }
  fireworks = fireworks.filter(f => !f.done);
  if (G.letterKey && advancePressed()) G.letterKey();
}
function drawFinal() {
  bgCh3(0);
  for (const f of fireworks) { ctx.fillStyle = f.c; ctx.fillRect(f.x - 1.5, f.y, 3, 8); }
  drawParts(0, false);
  ctx.fillStyle = '#0f0626'; ctx.fillRect(0, AGY, W, H - AGY); ctx.fillStyle = '#ff4fd8'; ctx.shadowColor = '#ff4fd8'; ctx.shadowBlur = 14; ctx.fillRect(0, AGY, W, 4); ctx.shadowBlur = 0;
  drawBot(B, 0); drawDGC(P, 0);
  for (const c of caps) drawCap(c);
  drawBubbles();
}
function drawCap(c) {
  ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(0, -10); ctx.lineTo(22, 0); ctx.lineTo(0, 10); ctx.closePath(); ctx.fill();
  ctx.fillRect(-11, 2, 22, 10); ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(16, 14); ctx.stroke();
  ctx.restore();
}
function showCollage() {
  const el = $('collage'); el.classList.add('show');
  el.querySelectorAll('.pc').forEach(n => n.remove());
  const order = ['ch1a', 'ch1b', 'ch2a', 'ch3a'];
  const spots = [[80, 130, -8], [300, 170, 5], [520, 120, -4], [720, 160, 7]];
  order.forEach((k, i) => {
    const ph = PHOTOS[k], y0 = ph.y0 || 0, y1 = ph.y1 || 1, bh = 200, ih = bh / (y1 - y0), iw = ih * ph.w / ph.h;
    const d = document.createElement('div'); d.className = 'pc';
    d.innerHTML = `<div class="crop" style="width:${iw}px;height:${bh}px"><img src="${ph.src}" style="width:${iw}px;margin-top:${-y0 * ih}px"></div>`;
    const [x, y, r] = spots[i];
    d.style.left = Math.min(x, W - iw - 30) + 'px'; d.style.top = y + 'px';
    d.style.transform = `translateY(-700px) rotate(${r * 3}deg)`;
    el.appendChild(d);
    setTimeout(() => { d.style.opacity = 1; d.style.transform = `rotate(${r}deg)`; SFX.stomp(); }, 500 + i * 650);
  });
  setTimeout(() => el.querySelector('.cap').style.opacity = 1, 3400);
  setTimeout(() => { el.classList.remove('show'); el.querySelector('.cap').style.opacity = 0; showLetter(); }, 7600);
}
function showLetter() {
  setMusicVol(22);
  const el = $('letter'), paper = $('paper'); el.classList.add('show'); paper.innerHTML = '';
  setTimeout(() => el.classList.add('open'), 100);
  let i = 0; const txt = LETTER; const caret = '<span class="caret"></span>';
  let skip = false;
  G.letterKey = () => { skip = true; };
  const tick = () => {
    if (skip) i = txt.length;
    i = Math.min(txt.length, i + 1);
    const ch = txt[i - 1];
    paper.innerHTML = escapeHtml(txt.slice(0, i)) + caret;
    if (ch && ch !== ' ' && ch !== '\n' && i % 2 === 0) sfx(1200 + Math.random() * 300, 0.015, 'square', 0.012);
    if (i < txt.length) setTimeout(tick, ch === '\n' ? 260 : (ch === '.' || ch === ',' ? 180 : 42));
    else {
      $('lnext').style.opacity = .6; G.letterKey = null;
      setTimeout(() => { G.letterKey = () => { G.letterKey = null; el.classList.remove('show', 'open'); $('lnext').style.opacity = 0; showFinalText(); }; }, 400);
    }
  };
  setTimeout(tick, 1100);
}
function escapeHtml(s) { return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function showFinalText() {
  setMusicVol(55);
  const el = $('final'); el.classList.add('show');
  for (let k = 0; k < 6; k++) setTimeout(() => burst(rand(100, W - 100), rand(80, 250), 60, { colors: ['#ff4fd8', '#6af2ff', '#ffd36a', '#fff'], max: 6, g: 0.05, life: 80, world: false, size: 3 }), k * 300);
  confettiOn = true;
  setTimeout(() => el.classList.add('a'), 200);
  setTimeout(() => el.classList.add('b'), 3000);
}
let confettiOn = false;

// =========================================================
//                        MAIN LOOP
// =========================================================
let acc = 0, last = performance.now();
function frame(now) {
  const dt = Math.min(50, now - last); last = now;
  acc += dt * G.slow;
  while (acc >= 1000 / 60) {
    acc -= 1000 / 60;
    step();
    for (const k in pressed) delete pressed[k];
  }
  render();
  requestAnimationFrame(frame);
}
function step() {
  G.t++;
  if (hit('m') && G.mode !== 'menu') toggleMute();
  if (G.mode === 'play') updatePlay();
  else if (G.mode === 'boss') updateBossMode();
  else if (G.mode === 'final') updFinal();
  else if (G.mode === 'office') updOffice();
  tickScript();
  if (confettiOn && Math.random() < 0.5) parts.push({ x: rand(0, W), y: -10, vx: rand(-1, 1), vy: rand(1, 3), life: 260, max: 260, c: ['#ff4fd8', '#6af2ff', '#ffd36a', '#a57bff', '#fff'][(Math.random() * 5) | 0], s: rand(5, 9), g: 0.01, world: false, rot: rand(0, 6), vr: rand(-.2, .2), conf: true });
  updParts();
  if (fadeDir) { fade += 0.04 * fadeDir; if (fade >= 1) { fade = 1; fadeDir = -1; const cb = fadeCb; fadeCb = null; cb && cb(); } if (fade <= 0 && fadeDir === -1) { fade = 0; fadeDir = 0; } }
}
function render() {
  ctx.clearRect(0, 0, W, H);
  if (G.mode === 'play' || G.mode === 'trans') { if (G.level) drawPlay(); }
  else if (G.mode === 'boss') drawBossMode();
  else if (G.mode === 'final') drawFinal();
  else if (G.mode === 'office') drawOffice();
  else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
}
requestAnimationFrame(frame);

// =========================================================
//                     PASSWORD + START
// =========================================================
const wrongMsgs = ['Yanlış. Babun gibi düşün. 🐒', 'Yok. Bir daha dene.', 'Hâlâ yanlış. Mentos 1 lira.', 'Ciddi misin?'];
let wrongN = 0;
$('pwin').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const v = $('pwin').value.trim().toLocaleLowerCase('tr');
  if (v === PASSWORD) {
    $('pw').classList.remove('show'); $('start').classList.add('show'); $('pwin').blur();
  } else {
    const er = $('pwerr'); er.textContent = wrongMsgs[Math.min(wrongN++, wrongMsgs.length - 1)]; er.style.opacity = 1; $('pwin').value = '';
  }
});
$('go').addEventListener('click', async () => {
  AC = AC || new (window.AudioContext || window.webkitAudioContext)();
  $('go').blur();
  $('start').classList.remove('show');
  $('hud-music').style.display = 'block';
  // unlock youtube with this gesture
  if (ytReady) { try { yt.loadVideoById(SONGS.ch1); yt.setVolume(musicVol); currentSong = SONGS.ch1; } catch (e) {} }
  await ready; try { await Promise.all(['28px Bangers', '20px Fredoka', '20px Cinzel', '20px "DM Serif Display"', '20px "Special Elite"', '600 18px Inter'].map(f => document.fonts.load(f))); } catch (e) {}
  showCard('ch1', () => startLevel('ch1'));
});

// debug: ?skip=ch2|ch3|boss|sevgi|final
(function () {
  const q = new URLSearchParams(location.search).get('skip'); if (!q) return;
  $('pw').classList.remove('show');
  window.addEventListener('load', () => ready.then(() => {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    if (q === 'boss') startBoss();
    else if (q === 'class') { G.level = LEVELS.ch2; startClass(); }
    else if (q === 'office') { G.level = LEVELS.ch2; startClass(); setTimeout(() => { G.dialog = []; startOffice(); }, 300); }
    else if (q === 'vural') { G.level = LEVELS.ch2; startClass(); setTimeout(() => { G.dialog = []; startVuralFightDirect(); }, 300); }
    else if (q === 'sevgi') { startBoss(); setTimeout(() => { G.dialog = []; boss = null; sevgiIntro(); }, 800); }
    else if (q === 'final') startFinal();
    else startLevel(q);
  }));
})();
