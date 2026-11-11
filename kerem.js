/* =========================================================
   GRADUATION AÇILIŞI: Kerem Eren ("Scooby") cutscene boss fight
   ========================================================= */
'use strict';

let KE = null, FIGHT = null, gradTitleT = 0, gradPops = [];

// Graduation başlamadan önce sahne
const _startLevelK = startLevel;
startLevel = function (key) {
  if (key === 'ch3' && !G.keremDone) { startKerem(); return; }
  _startLevelK(key);
};

function startKerem() {
  G.mode = 'boss'; G.arena = 'grad'; G.level = LEVELS.ch3; G.camX = 0; arenaPhase = 'cut';
  parts = []; projs = []; waves = []; boss = null; slipper = null; doorOpen = false; FIGHT = null; gradPops = []; gradTitleT = 0;
  if (typeof cases !== 'undefined') { cases = []; tools = []; SK = null; }
  if (typeof YU !== 'undefined') YU = null;
  P.x = 560; P.y = AGY - P.h; P.vx = P.vy = 0; P.facing = -1; P.hp = 3; P.blink = 0; P.dizzy = 0;
  B.active = true; B.x = 400; B.y = AGY - B.h; B.facing = 1; B.moving = false; B.bubble = null; B.hop = 0; B.noMentos = false;
  KE = { x: -60, y: AGY - 64, w: 30, h: 64, facing: 1, moving: false, phase: 0, vis: 1, pose: 'sneak' };
  (async () => {
    await wait(50);
    await talk([say('bot', 'Mezuniyet geldi kardeşim, inanamıyorum.'), say('dgc', 'Ben de.')]);
    // Kerem sinsice arkadan yaklaşıyor
    await walkTo(KE, B.x - 34, 1.1); KE.facing = 1; KE.moving = false;
    await wait(30);
    KE.pose = 'poke'; await wait(14);
    SFX.hurt(); G.shake = 10; B.hop = -34; setTimeout(() => B.hop = 0, 380);
    burst(B.x + 4, B.y + 46, 16, { colors: ['#ffd36a', '#fff'], max: 5, world: false });
    gradPops.push({ text: 'DÜRT!', x: B.x, y: B.y + 20, t: 60 });
    await wait(30); B.facing = -1;
    await talk([say('bot', 'ULAN SCOOBY!', 'shout')]);
    // kaybolur...
    puff(KE.x + KE.w / 2, KE.y + 30); KE.vis = 0; KE.pose = 'stand';
    await wait(55);
    // ...ve bir anda belirir
    KE.x = 230; KE.facing = 1; KE.vis = 1; puff(KE.x + KE.w / 2, KE.y + 30); SFX.boom(); G.shake = 12;
    await talk([say('kerem', 'Ruh-roh!')]);
    gradTitleT = 130; SFX.boom();
    await wait(135);
    // toz bulutu kavgası
    FIGHT = { t: 0, x: (KE.x + B.x) / 2 + 20, bx: B.x };
    B.x = -500; KE.vis = 0;
    await wait(110);
    await talk([say('dgc', 'Ayırmayayım bence.', 'think')]);
    await wait(90);
    const fx = FIGHT.x; FIGHT = null;
    puff(fx, AGY - 40); SFX.boom();
    B.x = fx + 30; B.facing = -1; KE.vis = 1; KE.x = fx - 70; KE.pose = 'dizzy';
    await wait(70);
    KE.pose = 'eat';
    await talk([say('kerem', 'Ruh-roh... sandviç molası.')]);
    KE.pose = 'run'; await walkTo(KE, -120, 7.5);
    await talk([say('bot', 'Kalemini de al git.')]);
    await wait(30);
    fadeTo(() => { G.keremDone = true; KE = null; _startLevelK('ch3'); });
  })();
}

function puff(x, y) { burst(x, y, 30, { colors: ['#e8e8f0', '#ffffff', '#c9c9d6'], max: 5, life: 45, world: false, size: 5 }); }

function updGrad() {
  if (gradTitleT > 0) gradTitleT--;
  for (const p of gradPops) { p.t--; p.y -= 0.7; }
  gradPops = gradPops.filter(p => p.t > 0);
  if (FIGHT) {
    FIGHT.t++;
    if (FIGHT.t % 7 === 0) { G.shake = Math.max(G.shake, 6); sfx(rand(120, 260), 0.07, 'square', 0.05, -60); }
    if (FIGHT.t % 22 === 0) gradPops.push({ text: ['POW!', 'BAM!', 'ŞLAK!', 'RUH-ROH!', 'ÇAT!', 'MENTOS!'][(FIGHT.t / 22 | 0) % 6], x: FIGHT.x + rand(-90, 90), y: AGY - rand(110, 170), t: 40 });
    FIGHT.x += Math.sin(FIGHT.t / 14) * 2.2;
  }
}

const _speakerPosK = speakerPos;
speakerPos = function (who) {
  if (who === 'kerem' && KE) return { x: KE.x + KE.w / 2, y: KE.y - 52 };
  return _speakerPosK(who);
};

// ---------- çizim ----------
function drawGradArena() {
  bgCh3(0);
  ctx.fillStyle = '#0f0626'; ctx.fillRect(0, AGY, W, H - AGY);
  ctx.fillStyle = '#ffd36a'; ctx.shadowColor = '#ffd36a'; ctx.shadowBlur = 12; ctx.fillRect(0, AGY, W, 3); ctx.shadowBlur = 0;
}
function drawGradActors() {
  if (KE && KE.vis > 0) drawKerem(KE);
  if (FIGHT) drawFightCloud(FIGHT);
}
function drawGradOverlay() {
  for (const p of gradPops) {
    ctx.save(); ctx.globalAlpha = clamp(p.t / 15, 0, 1); ctx.translate(p.x, p.y); ctx.rotate(-0.08);
    ctx.font = '34px Bangers, Impact'; ctx.textAlign = 'center'; ctx.lineWidth = 5;
    ctx.strokeStyle = '#1a1030'; ctx.strokeText(p.text, 0, 0); ctx.fillStyle = '#ffe14a'; ctx.fillText(p.text, 0, 0);
    ctx.restore();
  }
  if (gradTitleT > 0) {
    const a = clamp(gradTitleT / 20, 0, 1) * clamp((130 - gradTitleT) / 15, 0, 1);
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, H / 2 - 64, W, 118);
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffd36a'; ctx.font = '26px Bangers, Impact'; ctx.fillText('BOSS FIGHT', W / 2, H / 2 - 28);
    ctx.fillStyle = '#fff'; ctx.font = '56px Bangers, Impact'; ctx.fillText('BOT ÖMER  vs  KEREM EREN', W / 2, H / 2 + 26);
    ctx.globalAlpha = 1;
  }
}

function drawFightCloud(F) {
  const x = F.x, y = AGY - 60;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, AGY + 2, 90, 10, 0, 0, 7); ctx.fill();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2 + F.t / 9, r = 52 + Math.sin(F.t / 3 + i) * 10;
    ctx.fillStyle = i % 2 ? '#e9e6f2' : '#d4d0e2';
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.6, 34, 0, 7); ctx.fill();
  }
  ctx.fillStyle = '#f2f0f8'; ctx.beginPath(); ctx.arc(x, y, 58, 0, 7); ctx.fill();
  // çıkan kol/bacaklar
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a = F.t / 5 + i * 1.7, len = 70 + Math.sin(F.t / 2 + i) * 14;
    ctx.strokeStyle = i % 2 ? '#2a2420' : '#3d5a3a'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 40, y + Math.sin(a) * 26); ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len * 0.6); ctx.stroke();
    ctx.fillStyle = i % 2 ? '#f0c8a0' : '#6b4226'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * len, y + Math.sin(a) * len * 0.6, 7, 0, 7); ctx.fill();
  }
  // yıldızlar + uçan kalem
  ctx.font = '20px "Segoe UI Emoji"'; ctx.textAlign = 'center';
  for (let i = 0; i < 3; i++) { const t = F.t / 6 + i * 2.1; ctx.fillText('⭐', x + Math.cos(t) * 70, y - 40 + Math.sin(t) * 18); }
  ctx.save(); ctx.translate(x + Math.cos(F.t / 4) * 80, y - 70 + Math.sin(F.t / 3) * 20); ctx.rotate(F.t / 3); drawPencil(); ctx.restore();
  ctx.restore();
}
function drawPencil() {
  ctx.fillStyle = '#f2c230'; ctx.fillRect(-14, -3, 22, 6);
  ctx.fillStyle = '#f0c8a0'; ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(15, 0); ctx.lineTo(8, 3); ctx.fill();
  ctx.fillStyle = '#222'; ctx.beginPath(); ctx.moveTo(13, -1); ctx.lineTo(15, 0); ctx.lineTo(13, 1); ctx.fill();
  ctx.fillStyle = '#e88'; ctx.fillRect(-17, -3, 3, 6);
}

function drawKerem(k) {
  const cx = k.x + k.w / 2, fy = k.y + k.h, f = k.facing, pose = k.pose;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(cx, AGY + 2, 22, 5, 0, 0, 7); ctx.fill();
  ctx.translate(cx, fy);
  if (pose === 'dizzy') { ctx.rotate(-f * 1.35); ctx.translate(0, 6); }
  if (pose === 'sneak') { ctx.scale(1, 0.9); }
  ctx.scale(f, 1);
  const skin = '#6b4226', ph = k.phase || 0;
  // bacaklar
  if (pose === 'run') {
    // Scooby koşusu: dönen bacak çemberi
    ctx.strokeStyle = 'rgba(40,60,110,.55)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, -14, 12, 0, 7); ctx.stroke();
    ctx.strokeStyle = '#2c3e6e'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const a = G.t * 0.9 + i * 2.1; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(Math.cos(a) * 14, -14 + Math.sin(a) * 12); ctx.stroke(); }
  } else {
    const l = k.moving ? Math.sin(ph) * 6 : 0;
    ctx.fillStyle = '#2c3e6e'; rr(-9 + l, -26, 8, 24, 3); ctx.fill(); rr(1 - l, -26, 8, 24, 3); ctx.fill();
    ctx.fillStyle = '#f4f4f4'; rr(-11 + l, -4, 12, 5, 2); ctx.fill(); rr(0 - l, -4, 12, 5, 2); ctx.fill();
  }
  // gövde (yeşil kapüşonlu)
  const lean = pose === 'sneak' ? 6 : (pose === 'run' ? 10 : 0);
  ctx.save(); ctx.rotate(lean * 0.03);
  ctx.fillStyle = '#4f7a3a'; rr(-12, -52, 24, 28, 8); ctx.fill();
  ctx.fillStyle = '#3f6630'; rr(-7, -38, 14, 8, 3); ctx.fill();
  // kollar
  ctx.strokeStyle = '#4f7a3a'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  let hx = 12, hy = -34;
  if (pose === 'sneak') { hx = 6; hy = -58; }          // parmak dudakta
  if (pose === 'poke') { hx = 26; hy = -34; }
  if (pose === 'eat') { hx = 10; hy = -54; }
  if (pose === 'run') { hx = 16; hy = -44; }
  ctx.beginPath(); ctx.moveTo(-9, -48); ctx.lineTo(-14, -30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -48); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(-14, -29, 3.5, 0, 7); ctx.arc(hx, hy, 3.5, 0, 7); ctx.fill();
  if (pose === 'poke' || pose === 'sneak') { ctx.save(); ctx.translate(pose === 'poke' ? hx + 8 : -14, pose === 'poke' ? hy : -28); if (pose === 'sneak') ctx.rotate(0.6); drawPencil(); ctx.restore(); }
  if (pose === 'eat' || pose === 'run') {
    // kocaman sandviç
    ctx.save(); ctx.translate(hx + 8, hy - 6);
    const cols = ['#e3b46a', '#5aa83a', '#d9483b', '#f2d24a', '#b0603a', '#5aa83a', '#d9483b', '#e3b46a'];
    cols.forEach((c, i) => { ctx.fillStyle = c; rr(-12, -i * 5, 24, i === 0 || i === cols.length - 1 ? 7 : 4, 3); ctx.fill(); });
    ctx.restore();
  }
  // kafa (diğer karakterlerin büyük kafalarıyla uyumlu)
  const hyh = -66;
  ctx.translate(0, hyh - 16); ctx.scale(1.75, 1.75); ctx.translate(0, -hyh);
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, hyh, 15, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(-14, hyh + 1, 4, 0, 7); ctx.fill();
  // saç (kısa, siyah)
  ctx.fillStyle = '#141414'; ctx.beginPath(); ctx.arc(0, hyh - 2, 15.5, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(i * 4.2, hyh - 13 + Math.abs(i) * 0.9, 3.4, 0, 7); ctx.fill(); }
  // yüz
  if (pose === 'dizzy') {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    [[3, hyh - 1], [11, hyh - 1]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 2.8, G.t / 4, G.t / 4 + 5); ctx.stroke(); });
  } else {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(4, hyh - 1, 3.2, 3.8, 0, 0, 7); ctx.ellipse(11, hyh - 1, 3.2, 3.8, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#111'; const look = pose === 'sneak' ? 1.2 : 0.6;
    ctx.beginPath(); ctx.arc(4 + look, hyh - 0.5, 1.7, 0, 7); ctx.arc(11 + look, hyh - 0.5, 1.7, 0, 7); ctx.fill();
    ctx.strokeStyle = '#141414'; ctx.lineWidth = 2; ctx.beginPath();
    if (pose === 'sneak' || pose === 'poke') { ctx.moveTo(1, hyh - 7); ctx.lineTo(7, hyh - 5); ctx.moveTo(9, hyh - 5); ctx.lineTo(14, hyh - 7); }
    else { ctx.moveTo(1, hyh - 6); ctx.lineTo(7, hyh - 7); ctx.moveTo(9, hyh - 7); ctx.lineTo(14, hyh - 6); }
    ctx.stroke();
  }
  ctx.strokeStyle = '#3a1f12'; ctx.lineWidth = 2; ctx.beginPath();
  if (pose === 'poke' || pose === 'sneak') { ctx.moveTo(3, hyh + 7); ctx.quadraticCurveTo(8, hyh + 11, 13, hyh + 6); }
  else if (pose === 'eat') { ctx.fillStyle = '#3a1f12'; ctx.ellipse(9, hyh + 8, 3.5, 3, 0, 0, 7); ctx.fill(); }
  else { ctx.arc(8, hyh + 5, 4, 0.2, Math.PI - 0.2); }
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  if (pose === 'dizzy') { ctx.font = '16px "Segoe UI Emoji"'; ctx.textAlign = 'center'; for (let i = 0; i < 3; i++) { const t = G.t / 8 + i * 2.1; ctx.fillText('⭐', cx + Math.cos(t) * 22, fy - 34 + Math.sin(t) * 5); } }
}
