/* Tana del Luppolo Game — disegno del locale, di Roberto, dei clienti e dei cani.
   Tutto in coordinate «mondo»: larghezza 1820, altezza da -420 a 720.
   x < 712 = fuori (Via del Molo), x >= 712 = dentro la Tana. */
(function () {
  'use strict';
  const W = 1820, Y0 = -420, Y1 = 720;
  const CUT = 712, FL = 650, BL = 566;

  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function fr(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function lg(c, x0, y0, x1, y1, st) { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(s => g.addColorStop(s[0], s[1])); return g; }
  function rg(c, x, y, r0, r1, st) { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(s => g.addColorStop(s[0], s[1])); return g; }
  function ell(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, Math.PI * 2); c.fill(); }
  function circ(c, x, y, r, col) { ell(c, x, y, r, r, col); }

  /* ---------- luce: i personaggi si scuriscono di notte, fuori più che dentro ---------- */
  const LUCE = { f: 0, t: [27, 32, 64] };
  const cache = new Map();
  function hex2(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function K(h) {
    if (LUCE.f < 0.01) return h;
    const k = h + '|' + LUCE.f.toFixed(2) + LUCE.t.join();
    let v = cache.get(k);
    if (!v) {
      const a = hex2(h), f = LUCE.f;
      v = 'rgb(' + Math.round(a[0] * (1 - f) + LUCE.t[0] * f) + ',' + Math.round(a[1] * (1 - f) + LUCE.t[1] * f) + ',' + Math.round(a[2] * (1 - f) + LUCE.t[2] * f) + ')';
      if (cache.size > 4000) cache.clear();
      cache.set(k, v);
    }
    return v;
  }
  function luce(f, tint) { LUCE.f = f; LUCE.t = tint || [27, 32, 64]; }

  /* ---------- finestre del palazzo (servono anche per la notte) ---------- */
  const FINESTRE = [];
  (function () {
    const R = rng(11);
    for (let x = 250; x < W - 40; x += 175) for (const y of [-380, -240, -100]) {
      const aperta = R() < 0.62, accesa = aperta && R() < 0.55;
      FINESTRE.push({ x, y, aperta, accesa });
    }
  })();

  /* =================== SFONDO (strato dietro) =================== */
  function sfondo(c) {
    const R = rng(7);
    // cielo
    c.fillStyle = lg(c, 0, Y0, 0, 300, [[0, '#6fa8de'], [1, '#d4e6f3']]);
    c.fillRect(0, Y0, W, 1100);
    darsena(c, R);
    palazzo(c, R);
    esterno(c, R);
    interno(c, R);
    strada(c, R);
    // taglio della sezione (il muro tra fuori e dentro)
    fr(c, '#3a2a20', CUT - 10, 40, 12, 600);
    fr(c, '#3a2a20', CUT - 10, 40, W - CUT + 10, 22);
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(CUT + 2, 62, 10, 538);
  }

  function darsena(c, R) {
    // terminal crociere: vetro e tende bianche
    fr(c, '#9fb7c6', -10, 360, 190, 140);
    c.strokeStyle = '#7f98a8'; c.lineWidth = 2;
    for (let x = -10; x < 180; x += 16) { c.beginPath(); c.moveTo(x, 360); c.lineTo(x, 500); c.stroke(); }
    for (let i = 0; i < 6; i++) {
      const x = -20 + i * 36;
      c.fillStyle = '#f4f6f7'; c.beginPath(); c.moveTo(x, 470); c.lineTo(x + 20, 408); c.lineTo(x + 40, 470); c.closePath(); c.fill();
      c.strokeStyle = '#c9cfd3'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 20, 408); c.lineTo(x + 20, 396); c.stroke();
    }
    // nave da crociera
    fr(c, '#ffffff', -20, 250, 150, 130);
    fr(c, '#e8edf1', -20, 230, 120, 24);
    fr(c, '#1d3a6b', -20, 372, 150, 10);
    for (let r = 0; r < 5; r++) for (let x = -14; x < 124; x += 12) fr(c, r % 2 ? '#7d9cc0' : '#2f4b6e', x, 262 + r * 21, 8, 7);
    fr(c, '#f2c230', 40, 180, 34, 52); fr(c, '#1d1d1d', 40, 176, 34, 9);
    // tettoia del mercato e albero
    fr(c, '#d8d2c6', 0, 560, 175, 55);
    c.fillStyle = '#4a3324'; c.beginPath(); c.moveTo(10, 505); c.lineTo(80, 470); c.lineTo(150, 505); c.closePath(); c.fill();
    fr(c, '#3b2a1e', 10, 503, 140, 7);
    for (const x of [20, 60, 100, 140]) fr(c, '#3b2a1e', x, 510, 5, 80);
    fr(c, '#5a4030', 112, 470, 10, 130);
    for (const [x, y, r] of [[118, 410, 46], [86, 430, 36], [150, 425, 38], [120, 375, 34], [100, 395, 30]]) circ(c, x, y, r, '#3e6b34');
    for (const [x, y, r] of [[106, 398, 18], [138, 392, 16], [92, 424, 14]]) circ(c, x, y, r, '#58884a');
    // palazzo giallo in fondo
    fr(c, '#dcb45f', 128, 150, 52, 465);
    fr(c, '#c9a250', 128, 150, 6, 465);
    for (let y = 190; y < 560; y += 90) fr(c, '#5b4a3a', 145, y, 18, 40);
    fr(c, '#a7a299', 128, 520, 52, 95);
    // lampione
    fr(c, '#47504f', 162, 0, 7, 640);
    fr(c, '#47504f', 150, -6, 40, 8);
    c.fillStyle = '#3b4241'; c.beginPath(); c.moveTo(178, 2); c.lineTo(198, 2); c.lineTo(194, 16); c.lineTo(182, 16); c.closePath(); c.fill();
  }

  function finestra(c, f) {
    const { x, y } = f;
    fr(c, '#e9e2d4', x - 34, y - 6, 68, 124);        // cornice in rilievo
    fr(c, '#f1ebe0', x - 38, y + 112, 76, 8);        // davanzale
    fr(c, '#2a3440', x - 28, y, 56, 108);            // vetro
    fr(c, '#d9d4c8', x - 2, y, 4, 108);
    fr(c, '#d9d4c8', x - 28, y + 50, 56, 4);
    const pers = (px, w) => {
      fr(c, '#2f6a45', px, y - 2, w, 112);
      c.fillStyle = '#255a39';
      for (let yy = y + 6; yy < y + 106; yy += 7) c.fillRect(px + 3, yy, w - 6, 3);
    };
    if (f.aperta) { pers(x - 62, 26); pers(x + 36, 26); }
    else { pers(x - 30, 30); pers(x, 30); fr(c, '#1d4a2f', x - 1, y - 2, 2, 112); }
  }

  function palazzo(c, R) {
    // facciata rosa sopra tutto il locale
    fr(c, '#d6a59a', 175, -408, W - 175, 470);
    c.fillStyle = lg(c, 0, -408, 0, 60, [[0, 'rgba(255,255,255,.06)'], [1, 'rgba(0,0,0,.06)']]); c.fillRect(175, -408, W - 175, 470);
    for (let i = 0; i < 900; i++) { c.fillStyle = R() < .5 ? 'rgba(120,70,60,.08)' : 'rgba(255,255,255,.08)'; c.fillRect(175 + R() * (W - 175), -408 + R() * 460, 2 + R() * 3, 2); }
    // gronda e tetto
    fr(c, '#8f4f37', 170, -420, W, 10); fr(c, '#e6ddd0', 170, -410, W, 8);
    // fascia marcapiano
    fr(c, '#cfc9be', 175, 44, W - 175, 18); fr(c, '#b2ab9f', 175, 58, W - 175, 4);
    FINESTRE.forEach(f => finestra(c, f));
    // grondaia e fili
    fr(c, '#6d5a4c', 700, -410, 8, 1025);
    c.strokeStyle = 'rgba(50,40,35,.6)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(175, 120); c.quadraticCurveTo(420, 150, 700, 112); c.stroke();
    c.beginPath(); c.moveTo(175, 30); c.quadraticCurveTo(900, 50, W, 26); c.stroke();
  }

  function insegna(c) {
    // arco giallo con le bottiglie
    const cx = 470;
    c.save();
    c.beginPath(); c.moveTo(384, 292); c.lineTo(384, 228); c.ellipse(cx, 228, 86, 66, 0, Math.PI, 0); c.lineTo(556, 292); c.closePath();
    c.fillStyle = '#e1ad49'; c.fill(); c.clip();
    c.fillStyle = '#2c2622';
    const bott = [[392, 212, 24], [422, 178, 28], [456, 166, 30], [492, 178, 28], [526, 208, 26]];
    for (const [x, y, w] of bott) {
      c.beginPath(); c.moveTo(x, 300); c.lineTo(x, y + 40); c.quadraticCurveTo(x, y + 22, x + w * .32, y + 16); c.lineTo(x + w * .32, y); c.lineTo(x + w * .68, y);
      c.lineTo(x + w * .68, y + 16); c.quadraticCurveTo(x + w, y + 22, x + w, y + 40); c.lineTo(x + w, 300); c.closePath(); c.fill();
    }
    c.restore();
    c.textAlign = 'center'; c.lineJoin = 'round';
    c.font = '900 20px "Arial Rounded MT Bold","Arial Black",sans-serif';
    c.strokeStyle = '#2c2622'; c.lineWidth = 4; c.strokeText('LA TANA DEL', cx, 244);
    c.fillStyle = '#fff'; c.fillText('LA TANA DEL', cx, 244);
    c.font = '900 33px "Arial Rounded MT Bold","Arial Black",sans-serif';
    c.lineWidth = 5; c.strokeText('LUPPOLO', cx, 284); c.fillText('LUPPOLO', cx, 284);
    // fascia arancione
    fr(c, '#b2552c', 374, 290, 192, 40);
    fr(c, '#c96a3d', 374, 290, 192, 4); fr(c, '#8c3f1f', 374, 326, 192, 4);
    c.fillStyle = '#fff'; c.font = '600 19px "Avenir Next","Helvetica Neue",Arial,sans-serif'; c.textAlign = 'left';
    c.fillText('craft beer & food', 396, 320);
    fr(c, '#fff', 396, 298, 112, 2.5);
    for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(510 + i * 6, 293); c.lineTo(516 + i * 6, 299.5); c.lineTo(510 + i * 6, 306); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
    for (const y of [296, 300, 304]) fr(c, '#fff', 540, y, 14, 1.5);
  }

  function ghirlanda(c, R) {
    for (let a = Math.PI * 1.02; a < Math.PI * 1.98; a += 0.035) {
      const x = 470 + Math.cos(a) * 94, y = 228 + Math.sin(a) * 74;
      circ(c, x + (R() - .5) * 6, y + (R() - .5) * 6, 7 + R() * 4, R() < .5 ? '#2f5b2c' : '#3f7339');
    }
    for (const s of [-1, 1]) for (let y = 228; y < 296; y += 6) circ(c, 470 + s * (94 + (R() - .5) * 5), y, 7 + R() * 3, R() < .5 ? '#2f5b2c' : '#3f7339');
    for (let i = 0; i < 26; i++) { const a = Math.PI + R() * Math.PI; circ(c, 470 + Math.cos(a) * 94, 228 + Math.sin(a) * 74, 2, '#9fc58f'); }
  }

  function lanterna(c, x, y) {
    c.strokeStyle = '#1e1e1e'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y + 62); c.quadraticCurveTo(x, y + 80, x + (x < 470 ? -14 : 14), y + 82); c.stroke();
    fr(c, '#1e1e1e', x - 20, y, 40, 8);
    c.fillStyle = '#1e1e1e'; c.beginPath(); c.moveTo(x - 14, y); c.lineTo(x, y - 10); c.lineTo(x + 14, y); c.fill();
    fr(c, '#efe2bd', x - 16, y + 8, 32, 46);
    fr(c, '#1e1e1e', x - 18, y + 8, 4, 48); fr(c, '#1e1e1e', x + 14, y + 8, 4, 48); fr(c, '#1e1e1e', x - 1, y + 8, 2, 46);
    fr(c, '#1e1e1e', x - 20, y + 54, 40, 8);
    circ(c, x, y + 32, 6, '#fff6dc');
  }

  function porta(c, R) {
    // vano: a sinistra la porta aperta si vede dentro, a destra il vetro con i sottobicchieri
    fr(c, '#16452f', 410, 328, 120, 290);
    c.fillStyle = lg(c, 0, 340, 0, 600, [[0, '#d8a865'], [1, '#7a512f']]); c.fillRect(420, 338, 50, 262);
    fr(c, '#f6e7c4', 428, 350, 6, 22); fr(c, '#f6e7c4', 446, 356, 6, 22); fr(c, '#f6e7c4', 462, 352, 6, 22);
    fr(c, '#6d4527', 420, 470, 50, 130); fr(c, '#8a5d36', 420, 470, 50, 6);
    fr(c, '#c9b9a0', 420, 560, 50, 40);
    // anta destra a vetri
    fr(c, '#1d5a3f', 470, 332, 58, 280);
    fr(c, '#2d3a38', 478, 342, 44, 250);
    const cols = ['#e94e3c', '#f2c230', '#3b9ad9', '#ffffff', '#7bc043', '#f28c28', '#9b59b6', '#1abc9c', '#e84393', '#f5f5f5', '#2c3e50', '#d35400'];
    for (let y = 352; y < 560; y += 13) for (let x = 484; x < 520; x += 12) { if (R() < .1) continue; circ(c, x + (R() - .5) * 3, y + (R() - .5) * 3, 5.5, cols[(R() * cols.length) | 0]); circ(c, x, y, 2, 'rgba(0,0,0,.25)'); }
    fr(c, '#2a2a2a', 486, 572, 30, 6);
    // gradino in pietra
    fr(c, '#bdb8ae', 398, 604, 144, 14); fr(c, '#d6d1c7', 398, 604, 144, 3);
  }

  function lavagnaMuro(c) {
    fr(c, '#6a3c21', 620, 340, 80, 140);
    fr(c, '#1f2522', 626, 346, 68, 128);
  }

  function esterno(c, R) {
    // intonaco del piano terra
    fr(c, '#cbc6ba', 175, 62, CUT - 185, 553);
    for (let i = 0; i < 1400; i++) { c.fillStyle = R() < .5 ? 'rgba(90,85,70,.07)' : 'rgba(255,255,255,.10)'; c.fillRect(175 + R() * (CUT - 185), 62 + R() * 550, 2 + R() * 3, 2); }
    c.fillStyle = lg(c, 0, 520, 0, 615, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(60,55,45,.18)']]); c.fillRect(175, 520, CUT - 185, 95);
    fr(c, '#a9a397', 175, 588, CUT - 185, 27);
    // foglio con gli orari
    fr(c, '#f7f7f2', 330, 384, 28, 38);
    for (let y = 390; y < 418; y += 5) fr(c, '#9a9a9a', 334, y, 20, 1.5);
    insegna(c); ghirlanda(c, R);
    lanterna(c, 345, 250); lanterna(c, 595, 250);
    porta(c, R);
    lavagnaMuro(c);
    // bidone nero vicino alla porta
    fr(c, '#232323', 538, 560, 30, 56); fr(c, '#3a3a3a', 535, 556, 36, 8); fr(c, '#d9d9d9', 541, 578, 24, 10);
    // cavalletto sul marciapiede
    c.fillStyle = '#c27238';
    c.beginPath(); c.moveTo(612, 646); c.lineTo(626, 548); c.lineTo(632, 548); c.lineTo(620, 646); c.fill();
    c.beginPath(); c.moveTo(676, 646); c.lineTo(662, 548); c.lineTo(668, 548); c.lineTo(684, 646); c.fill();
    fr(c, '#c27238', 622, 546, 50, 8);
    c.fillStyle = '#1e2421'; c.beginPath(); c.moveTo(626, 556); c.lineTo(668, 556); c.lineTo(676, 630); c.lineTo(618, 630); c.closePath(); c.fill();
    c.fillStyle = '#efe9dc'; c.font = '700 8px "Chalkboard SE","Comic Sans MS",cursive'; c.textAlign = 'center';
    c.fillText('LA TANA', 647, 568);
    c.fillText('BIRRE ALLA SPINA', 647, 584); c.fillText('SELEZIONATE', 647, 594);
    c.fillStyle = '#f2a65a'; c.fillText('FOCACCE', 647, 608); c.fillText('DI PATATE', 647, 618);
  }

  /* ----- dentro ----- */
  function vite(c, R, x0, x1, yb, amp) {
    c.strokeStyle = '#1b1b1b'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath();
    for (let x = x0; x <= x1; x += 6) { const y = yb + Math.sin(x / 95) * amp; x === x0 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.stroke();
    c.lineWidth = 3;
    for (let x = x0 + 40; x < x1 - 20; x += 70 + R() * 50) {
      const y = yb + Math.sin(x / 95) * amp, s = R() < .5 ? -1 : 1;
      c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 10, y + s * 30, x + 40, y + s * 34, x + 34, y + s * 12);
      c.arc(x + 26, y + s * 14, 8, 0, Math.PI * 1.6); c.stroke();
      if (s > 0) luppolo(c, x + 14, y + 40 + R() * 10, 9);
      else foglia(c, x + 6, y - 22, 14);
    }
  }
  function luppolo(c, x, y, r) {
    c.fillStyle = '#1b1b1b'; c.beginPath(); c.ellipse(x, y, r * .8, r * 1.25, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1;
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(x - r * .7, y + i * r * .55); c.quadraticCurveTo(x, y + i * r * .55 + r * .35, x + r * .7, y + i * r * .55); c.stroke(); }
    c.strokeStyle = '#1b1b1b'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - r * 1.2); c.lineTo(x, y - r * 1.7); c.stroke();
  }
  function foglia(c, x, y, r) {
    c.fillStyle = '#1b1b1b'; c.beginPath();
    c.moveTo(x, y + r * .8);
    c.quadraticCurveTo(x - r * 1.2, y + r * .1, x - r * .9, y - r * .4); c.quadraticCurveTo(x - r * .4, y - r * .2, x - r * .3, y - r * .5);
    c.quadraticCurveTo(x, y - r * 1.3, x + r * .3, y - r * .5); c.quadraticCurveTo(x + r * .4, y - r * .2, x + r * .9, y - r * .4);
    c.quadraticCurveTo(x + r * 1.2, y + r * .1, x, y + r * .8); c.fill();
  }
  function bottiglie(c, R, x0, x1, ybase, hmax) {
    const cols = ['#2e5a26', '#5a3215', '#7a4a1b', '#1f3d1c', '#3b2412', '#8a6a2a', '#4d6b2e', '#6b2a1a'];
    let x = x0;
    while (x < x1 - 10) {
      const w = 10 + R() * 6, h = hmax * (.7 + R() * .3), col = cols[(R() * cols.length) | 0];
      c.fillStyle = col;
      c.beginPath(); c.moveTo(x, ybase); c.lineTo(x, ybase - h * .62); c.quadraticCurveTo(x, ybase - h * .78, x + w * .35, ybase - h * .82);
      c.lineTo(x + w * .35, ybase - h); c.lineTo(x + w * .65, ybase - h); c.lineTo(x + w * .65, ybase - h * .82); c.quadraticCurveTo(x + w, ybase - h * .78, x + w, ybase - h * .62); c.lineTo(x + w, ybase); c.fill();
      fr(c, ['#f1e6c8', '#e9d36b', '#d9534f', '#ffffff', '#f0a14a'][(R() * 5) | 0], x + 1, ybase - h * .45, w - 2, h * .25);
      fr(c, 'rgba(255,255,255,.25)', x + 2, ybase - h * .6, 2, h * .5);
      x += w + 2 + R() * 3;
    }
  }
  function volta(c, a, b) {
    const cx = (a + b) / 2, rx = (b - a) / 2;
    c.save();
    c.beginPath(); c.moveTo(a, 62); c.lineTo(b, 62); c.lineTo(b, 205); c.ellipse(cx, 205, rx, 128, 0, 0, Math.PI, true); c.closePath();
    c.fillStyle = lg(c, 0, 62, 0, 205, [[0, '#a87c48'], [.5, '#d2ac74'], [1, '#e0bf8a']]); c.fill();
    c.restore();
    c.strokeStyle = 'rgba(80,50,25,.35)'; c.lineWidth = 5;
    c.beginPath(); c.ellipse(cx, 205, rx, 128, 0, Math.PI, 0); c.stroke();
  }
  function cornice(c, x, y, w, h, dentro) {
    fr(c, '#3d2a1c', x, y, w, h); fr(c, dentro || '#f4f1e6', x + 4, y + 4, w - 8, h - 8);
    if (!dentro) for (let yy = y + 12; yy < y + h - 8; yy += 6) fr(c, '#b9b4a6', x + 9, yy, w - 18, 1.5);
  }
  function boccale(c, x, y) {
    fr(c, '#e9e6dc', x, y - 34, 20, 34); fr(c, '#c9c5b8', x, y - 34, 20, 4);
    c.strokeStyle = '#e9e6dc'; c.lineWidth = 4; c.beginPath(); c.arc(x + 22, y - 18, 8, -1.3, 1.3); c.stroke();
    fr(c, '#2f5c8a', x + 4, y - 26, 12, 10);
  }

  function interno(c, R) {
    // pareti: in alto azzurro, in basso giallo ocra con la linea ondulata nera
    fr(c, '#a7bccb', CUT, 62, W - CUT, 540);
    fr(c, '#e1a13f', CUT, 330, W - CUT, 270);
    c.fillStyle = '#a7bccb';
    c.beginPath(); c.moveTo(CUT, 320);
    for (let x = CUT; x <= W; x += 6) c.lineTo(x, 330 + Math.sin(x / 95) * 22);
    c.lineTo(W, 300); c.lineTo(CUT, 300); c.fill();
    // retro del bancone: piastrelle bianche e mensole
    fr(c, '#b7c6d0', 788, 62, 452, 270);
    fr(c, '#e7e9e6', 788, 332, 452, 270);
    c.strokeStyle = '#cfd3d0'; c.lineWidth = 1;
    for (let y = 340; y < 600; y += 16) { c.beginPath(); c.moveTo(788, y); c.lineTo(1240, y); c.stroke(); }
    for (let x = 796; x < 1240; x += 24) { c.beginPath(); c.moveTo(x, 332); c.lineTo(x, 600); c.stroke(); }
    vite(c, R, CUT, 790, 330, 22);
    vite(c, R, 1380, W, 330, 22);
    // volte a botte
    volta(c, CUT, 1240); volta(c, 1240, W);
    // mensola alta con le bottiglie (sala)
    fr(c, '#4b2f1c', 1385, 196, W - 1385, 10);
    bottiglie(c, R, 1392, W - 4, 196, 44);
    // murale «La Tana del Luppolo»
    c.save();
    c.fillStyle = '#161616'; c.textAlign = 'center';
    c.font = 'italic 700 58px "Snell Roundhand","Brush Script MT","Apple Chancery",Georgia,serif';
    c.fillText('La Tana', 1600, 262);
    c.font = 'italic 700 48px "Snell Roundhand","Brush Script MT","Apple Chancery",Georgia,serif';
    c.fillText('del Luppolo', 1625, 310);
    c.strokeStyle = '#161616'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(1505, 268); c.bezierCurveTo(1480, 250, 1470, 280, 1495, 288); c.stroke();
    c.beginPath(); c.moveTo(1720, 296); c.bezierCurveTo(1760, 280, 1770, 310, 1745, 318); c.stroke();
    c.restore();
    foglia(c, 1700, 232, 16); foglia(c, 1528, 305, 12);
    // quadri in sala
    cornice(c, 1408, 360, 44, 58, '#c9a06a'); fr(c, '#7a3b2a', 1416, 368, 28, 42); circ(c, 1430, 384, 8, '#e8d6a8');
    cornice(c, 1772, 372, 36, 48, '#2d4a6e'); fr(c, '#e7c25a', 1780, 384, 20, 22);
    // lanternine a muro
    for (const x of [758, 1398]) { fr(c, '#1e1e1e', x - 8, 250, 16, 4); fr(c, '#efe2bd', x - 7, 254, 14, 22); fr(c, '#1e1e1e', x - 8, 276, 16, 4); fr(c, '#1e1e1e', x - 2, 280, 4, 10); }
    // porta d'ingresso vista da dentro
    fr(c, '#1d5a3f', 716, 338, 62, 262);
    c.fillStyle = lg(c, 0, 345, 0, 595, [[0, '#cfe0ea'], [1, '#9fb0b8']]); c.fillRect(724, 346, 46, 246);
    fr(c, '#1d5a3f', 745, 346, 4, 246);
    // ---- bancone: retro ----
    fr(c, '#4b2f1c', 790, 212, 445, 10);
    fr(c, '#4b2f1c', 790, 296, 345, 10);
    cornice(c, 800, 160, 40, 50); cornice(c, 848, 166, 36, 44); cornice(c, 1182, 160, 40, 50);
    boccale(c, 900, 212); boccale(c, 928, 212); boccale(c, 1150, 212);
    bottiglie(c, R, 960, 1140, 212, 42);
    // cartelli
    fr(c, '#c8352a', 800, 246, 60, 48);
    c.fillStyle = '#f7d24a'; c.font = '900 10px "Arial Black",sans-serif'; c.textAlign = 'center'; c.fillText('WISH', 830, 260);
    c.fillStyle = '#fff'; c.font = '900 15px "Arial Black",sans-serif'; c.fillText('YOU', 830, 274);
    c.fillStyle = '#f7d24a'; c.font = '900 12px "Arial Black",sans-serif'; c.fillText('BEER', 830, 288);
    fr(c, '#b88a55', 866, 246, 50, 48); circ(c, 891, 270, 19, '#2a2520'); fr(c, '#e8d6a8', 881, 262, 20, 14); fr(c, '#e8d6a8', 879, 258, 5, 5); fr(c, '#e8d6a8', 888, 258, 5, 5); fr(c, '#e8d6a8', 897, 258, 5, 5);
    c.save(); c.translate(950, 270);
    for (let i = 0; i < 16; i++) { c.rotate(Math.PI / 8); c.fillStyle = i % 2 ? '#f3b33d' : '#e06b2a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(34, -6); c.lineTo(34, 6); c.fill(); }
    c.restore();
    fr(c, 'rgba(0,0,0,0)', 0, 0, 0, 0);
    c.save(); c.beginPath(); c.rect(922, 246, 56, 48); c.clip(); c.restore();
    circ(c, 950, 270, 15, '#f6e2b0'); c.fillStyle = '#7a3a14'; c.font = '900 9px "Arial Black",sans-serif'; c.fillText('COLD', 950, 268); c.fillText('BEER', 950, 278);
    bottiglie(c, R, 985, 1130, 296, 40);
    // bicchieri capovolti
    for (const y of [360, 410]) { fr(c, '#5a3a24', 795, y, 335, 6); for (let x = 802; x < 1125; x += 15) { c.strokeStyle = 'rgba(120,140,150,.55)'; c.lineWidth = 1.5; c.strokeRect(x, y - 22, 10, 22); } }
    // frigo a vetro
    fr(c, '#1c1c1c', 1132, 300, 58, 300);
    fr(c, '#dceef2', 1138, 308, 46, 220);
    for (let y = 352; y < 528; y += 44) {
      fr(c, '#9fb3b8', 1138, y, 46, 3);
      for (let x = 1141; x < 1180; x += 9) { const col = ['#d9534f', '#2a7ab0', '#f0ad4e', '#5cb85c', '#6b2a1a', '#2e5a26'][(R() * 6) | 0]; fr(c, col, x, y - (R() < .5 ? 24 : 32), 7, R() < .5 ? 24 : 32); }
    }
    fr(c, '#9aa4a6', 1179, 380, 3, 60);
    // passaggio verso la cucina, con la lavastoviglie
    fr(c, '#5b4a3c', 1192, 300, 42, 300);
    fr(c, '#f1f1ee', 1196, 500, 34, 100); fr(c, '#c8c8c4', 1196, 500, 34, 8);
    // cucina: lavagna del menu, cappa, piastrelle, piastra
    fr(c, '#5a3a24', 1240, 168, 136, 76);
    fr(c, '#1f2522', 1245, 173, 126, 66);
    c.fillStyle = '#efe9dc'; c.font = '700 10px "Chalkboard SE","Comic Sans MS",cursive'; c.textAlign = 'left';
    ['PULLED PORK', 'PIADINE', 'PANINI', 'FOCACCIA'].forEach((t, i) => c.fillText(t, 1252, 189 + i * 14));
    c.fillStyle = '#f2a65a'; c.fillText('★', 1338, 189);
    fr(c, '#f0f0ec', 1240, 250, 140, 350);
    c.strokeStyle = '#d4d6d2'; for (let y = 258; y < 600; y += 16) { c.beginPath(); c.moveTo(1240, y); c.lineTo(1380, y); c.stroke(); }
    c.fillStyle = lg(c, 1240, 0, 1380, 0, [[0, '#9aa0a5'], [.5, '#e5e8ea'], [1, '#8f969b']]);
    c.beginPath(); c.moveTo(1258, 252); c.lineTo(1362, 252); c.lineTo(1376, 300); c.lineTo(1244, 300); c.closePath(); c.fill();
    fr(c, '#6f767b', 1244, 300, 132, 4);
    fr(c, '#2b2b2b', 1306, 432, 66, 10); fr(c, '#444', 1306, 442, 66, 158);
    // pavimento a piastrelle chiare
    c.fillStyle = lg(c, 0, 600, 0, 720, [[0, '#c8b291'], [1, '#dcc7a6']]); c.fillRect(CUT, 600, W - CUT, 120);
    c.strokeStyle = 'rgba(120,95,65,.35)'; c.lineWidth = 1.5;
    for (const y of [612, 628, 650, 680, 716]) { c.beginPath(); c.moveTo(CUT, y); c.lineTo(W, y); c.stroke(); }
    for (let x = CUT - 200; x < W + 200; x += 70) { c.beginPath(); c.moveTo(x, 600); c.lineTo(x + (x - 1260) * .35, 720); c.stroke(); }
    fr(c, '#5a3a24', CUT, 594, W - CUT, 6);
    // sedie pieghevoli in sala (schienali dietro ai tavoli)
    for (const x of [1440, 1520, 1640, 1720]) sedia(c, x);
  }
  function sedia(c, x) {
    fr(c, '#2b2b2b', x - 24, 470, 4, 130); fr(c, '#2b2b2b', x + 20, 470, 4, 130);
    for (const y of [474, 490, 506]) { fr(c, '#9c7a52', x - 26, y, 52, 11); fr(c, '#b8956a', x - 26, y, 52, 3); }
  }

  function strada(c, R) {
    // marciapiede in lastre
    fr(c, '#b4b0a8', 0, 615, CUT, 50);
    c.strokeStyle = 'rgba(80,75,70,.35)'; c.lineWidth = 1.5;
    for (let x = 0; x < CUT; x += 64 + R() * 30) { c.beginPath(); c.moveTo(x, 615); c.lineTo(x - 8, 665); c.stroke(); }
    c.beginPath(); c.moveTo(0, 640); c.lineTo(CUT, 640); c.stroke();
    fr(c, '#8f8b84', 0, 662, CUT, 4);
    // asfalto con le grate scure di Via del Molo
    fr(c, '#727273', 0, 666, CUT, 54);
    fr(c, '#454b52', 60, 672, 520, 48);
    c.strokeStyle = 'rgba(160,170,180,.28)'; c.lineWidth = 1.2;
    for (let y = 676; y < 720; y += 5) { c.beginPath(); c.moveTo(60, y); c.lineTo(580, y); c.stroke(); }
    // tombino
    fr(c, '#5d5a55', 300, 646, 30, 10); c.strokeStyle = '#7a776f'; c.strokeRect(300, 646, 30, 10);
  }

  /* =================== STRATO DAVANTI =================== */
  function pietre(c, R, x0, x1, y0, y1) {
    const cols = ['#a7a094', '#b8b1a5', '#9a9387', '#c2bcb0', '#8f887d', '#aea69a'];
    fr(c, '#6e675e', x0, y0, x1 - x0, y1 - y0);
    for (let y = y0 + 1; y < y1; y += 13) {
      let x = x0 - R() * 40;
      while (x < x1) { const w = 26 + R() * 60; c.fillStyle = cols[(R() * cols.length) | 0]; c.fillRect(Math.max(x0, x), y, Math.min(w, x1 - Math.max(x0, x)) - 2, 11); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(Math.max(x0, x), y, Math.min(w, x1 - Math.max(x0, x)) - 2, 2); x += w; }
    }
  }
  function bancone(c, R, x0, x1) {
    pietre(c, R, x0, x1, 462, 628);
    fr(c, '#3e2716', x0 - 6, 462, 12, 178); fr(c, '#3e2716', x1 - 6, 462, 12, 178);
    fr(c, '#4a2f1c', x0 - 6, 626, x1 - x0 + 12, 14);
    fr(c, '#6e4424', x0 - 10, 446, x1 - x0 + 20, 17);
    fr(c, '#93603a', x0 - 10, 446, x1 - x0 + 20, 5);
    fr(c, 'rgba(0,0,0,.2)', x0, 463, x1 - x0, 5);
  }
  function spina(c, x) {
    c.fillStyle = lg(c, x - 8, 0, x + 8, 0, [[0, '#7e858b'], [.45, '#f4f6f8'], [1, '#6f767c']]);
    c.fillRect(x - 8, 372, 16, 76);
    rr(c, x - 9, 366, 18, 12, 5); c.fill();
    fr(c, '#c9ced2', x - 3, 378, 14, 6);
    fr(c, '#1b1b1b', x - 3, 330, 6, 40); circ(c, x, 330, 6, '#1b1b1b');
  }
  function fronte(c) {
    const R = rng(23);
    // tavolo alto fuori
    fr(c, '#4a2f20', 192, 528, 12, 122); fr(c, '#4a2f20', 314, 528, 12, 122);
    fr(c, '#4a2f20', 198, 588, 124, 9); fr(c, '#5a3a26', 192, 616, 134, 9);
    fr(c, '#5b3826', 178, 514, 162, 16); fr(c, '#7a5038', 178, 514, 162, 4);
    // bancone birre e bancone cucina
    bancone(c, R, 788, 1188);
    bancone(c, R, 1234, 1380);
    // vaschetta, spine, pompa a mano, cassa
    fr(c, '#3a3d40', 860, 440, 216, 8);
    [880, 940, 1000, 1060].forEach(x => spina(c, x));
    fr(c, '#1b1b1b', 826, 360, 9, 88); fr(c, '#c79a3c', 822, 404, 17, 6); fr(c, '#fbfbf4', 820, 372, 21, 24); fr(c, '#2b2b2b', 820, 440, 22, 8);
    fr(c, '#1d1d1d', 1098, 418, 30, 30); fr(c, '#2f7bbf', 1102, 422, 22, 14); fr(c, '#d9534f', 1130, 430, 16, 18);
    // vetrinetta della focaccia
    fr(c, '#d8c7a6', 1248, 440, 70, 8);
    c.fillStyle = 'rgba(220,235,240,.55)'; rr(c, 1250, 408, 66, 34, 8); c.fill();
    for (let i = 0; i < 3; i++) { fr(c, '#e0b35a', 1256 + i * 20, 428, 17, 12); fr(c, '#c98f3a', 1256 + i * 20, 428, 17, 3); }
    // lampade pendenti a barattolo e lampadina della cucina
    for (const x of [880, 1000, 1120]) {
      c.strokeStyle = '#2b2b2b'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, 70); c.lineTo(x, 186); c.stroke();
      fr(c, '#b08a3a', x - 10, 184, 20, 6);
      c.fillStyle = lg(c, x - 14, 0, x + 14, 0, [[0, '#e9e1cf'], [.5, '#fbf8ef'], [1, '#ddd4bf']]); rr(c, x - 14, 190, 28, 44, 6); c.fill();
    }
    c.strokeStyle = '#2b2b2b'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(1360, 70); c.lineTo(1360, 262); c.stroke();
    fr(c, '#3a3a3a', 1355, 260, 10, 10); circ(c, 1360, 280, 12, 'rgba(255,240,200,.9)');
    // tavoli in sala
    for (const cx of [1480, 1680]) {
      c.strokeStyle = '#2b2b2b'; c.lineWidth = 5;
      c.beginPath(); c.moveTo(cx - 60, 528); c.lineTo(cx + 50, 662); c.moveTo(cx + 60, 528); c.lineTo(cx - 50, 662); c.stroke();
      for (let i = 0; i < 6; i++) { fr(c, i % 2 ? '#a07c54' : '#b48c60', cx - 85 + i * 28.3, 514, 27, 14); }
      fr(c, '#7c5a38', cx - 85, 526, 170, 4);
    }
  }

  /* =================== NOTTE =================== */
  function notte(c, d) {
    // d = disegno di giorno già fatto su c
    c.save();
    // fuori: buio blu
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = '#353c6a';
    c.beginPath(); c.rect(0, Y0, CUT, Y1 - Y0); c.rect(CUT, Y0, W - CUT, 62 - Y0); c.fill('nonzero');
    // dentro: luce calda, più bassa
    c.fillStyle = '#d2b08a'; c.fillRect(CUT, 62, W - CUT, Y1 - 62);
    c.globalCompositeOperation = 'source-over';
    // stelle e luna
    const R = rng(5);
    for (let i = 0; i < 70; i++) circ(c, R() * 180, Y0 + R() * 560, R() * 1.4 + .3, 'rgba(255,255,240,' + (.4 + R() * .5) + ')');
    circ(c, 70, 90, 20, '#f4f0d8'); circ(c, 78, 84, 18, '#353c6a');
    circ(c, 70, 90, 20, 'rgba(244,240,216,0)');
    // finestre accese
    FINESTRE.forEach(f => { if (f.accesa) { c.fillStyle = lg(c, 0, f.y, 0, f.y + 108, [[0, '#ffd88f'], [1, '#e9a24f']]); c.fillRect(f.x - 28, f.y, 56, 108); fr(c, '#8a6a4a', f.x - 2, f.y, 4, 108); fr(c, '#8a6a4a', f.x - 28, f.y + 50, 56, 4); } });
    // luci della nave
    for (let i = 0; i < 40; i++) circ(c, -14 + R() * 140, 262 + ((R() * 5) | 0) * 21, 2.2, '#ffe9a8');
    // insegna illuminata
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = rg(c, 470, 240, 10, 140, [[0, 'rgba(255,235,200,.55)'], [1, 'rgba(255,235,200,0)']]); c.fillRect(320, 100, 300, 260);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = .8; insegna(c); c.globalAlpha = .45; ghirlanda(c, rng(99)); c.globalAlpha = 1;
    c.globalCompositeOperation = 'lighter';
    // lanterne
    for (const x of [345, 595]) { c.fillStyle = rg(c, x, 280, 4, 120, [[0, 'rgba(255,190,100,.75)'], [.4, 'rgba(255,170,80,.25)'], [1, 'rgba(255,160,70,0)']]); c.fillRect(x - 120, 160, 240, 240); }
    // la porta versa luce sul marciapiede
    c.fillStyle = lg(c, 0, 600, 0, 720, [[0, 'rgba(255,170,80,.45)'], [1, 'rgba(255,170,80,0)']]);
    c.beginPath(); c.moveTo(418, 615); c.lineTo(472, 615); c.lineTo(560, 720); c.lineTo(350, 720); c.closePath(); c.fill();
    c.fillStyle = rg(c, 445, 470, 10, 140, [[0, 'rgba(255,180,90,.5)'], [1, 'rgba(255,180,90,0)']]); c.fillRect(300, 330, 300, 290);
    // lampione
    c.fillStyle = rg(c, 188, 20, 4, 90, [[0, 'rgba(255,230,170,.9)'], [1, 'rgba(255,220,150,0)']]); c.fillRect(90, -70, 200, 180);
    c.fillStyle = lg(c, 0, 16, 0, 660, [[0, 'rgba(255,220,150,.20)'], [1, 'rgba(255,220,150,.05)']]);
    c.beginPath(); c.moveTo(182, 16); c.lineTo(194, 16); c.lineTo(330, 665); c.lineTo(40, 665); c.closePath(); c.fill();
    // dentro: lampade e frigo
    for (const x of [880, 1000, 1120]) { c.fillStyle = rg(c, x, 224, 6, 200, [[0, 'rgba(255,200,120,.55)'], [1, 'rgba(255,190,110,0)']]); c.fillRect(x - 190, 130, 380, 380); }
    c.fillStyle = rg(c, 1360, 280, 4, 150, [[0, 'rgba(255,210,140,.6)'], [1, 'rgba(255,200,120,0)']]); c.fillRect(1160, 90, 300, 300);
    c.fillStyle = rg(c, 1160, 420, 4, 110, [[0, 'rgba(190,230,255,.45)'], [1, 'rgba(190,230,255,0)']]); c.fillRect(1050, 300, 220, 240);
    for (const x of [758, 1398]) { c.fillStyle = rg(c, x, 265, 2, 80, [[0, 'rgba(255,190,100,.6)'], [1, 'rgba(255,190,100,0)']]); c.fillRect(x - 80, 185, 160, 160); }
    // faretti sul murale
    for (const x of [1480, 1600, 1720]) {
      c.fillStyle = lg(c, 0, 80, 0, 420, [[0, 'rgba(255,235,190,.45)'], [1, 'rgba(255,235,190,0)']]);
      c.beginPath(); c.moveTo(x - 8, 80); c.lineTo(x + 8, 80); c.lineTo(x + 70, 420); c.lineTo(x - 70, 420); c.closePath(); c.fill();
      circ(c, x, 82, 6, 'rgba(255,245,220,.9)');
    }
    c.restore();
  }
  function notteFronte(c) {
    c.save();
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = 'rgba(30,34,70,.62)'; c.fillRect(0, Y0, CUT, Y1 - Y0);
    c.fillStyle = 'rgba(60,36,18,.22)'; c.fillRect(CUT, Y0, W - CUT, Y1 - Y0);
    c.globalCompositeOperation = 'source-over';
    for (const x of [880, 1000, 1120]) { c.fillStyle = lg(c, x - 14, 0, x + 14, 0, [[0, '#ffd994'], [.5, '#fff6dc'], [1, '#ffd08a']]); rr(c, x - 14, 190, 28, 44, 6); c.fill(); }
    circ(c, 1360, 280, 12, '#fff2c4');
    c.restore();
  }

  /* =================== PERSONE =================== */
  // look: {pelle, capelli, colCap, maglia, motivo, pantaloni, scarpe, barba, occhiali, cappello, macchina}
  function testa(c, L, x, y, espr, opt) {
    const P = K(L.pelle), dark = K(L.pelleOmbra || '#8a5a3a');
    // capelli dietro (lunghi)
    if (L.capelli === 'lunghi' || L.capelli === 'caschetto') { c.fillStyle = K(L.colCap); const h = L.capelli === 'lunghi' ? 78 : 46; rr(c, x - 37, y - 30, 22, h, 10); c.fill(); rr(c, x + 15, y - 30, 22, h, 10); c.fill(); }
    // orecchie
    ell(c, x - 31, y + 4, 6, 9, P); ell(c, x + 31, y + 4, 6, 9, P);
    ell(c, x, y, 31, 36, P);
    // ombra mento
    c.fillStyle = 'rgba(0,0,0,.06)'; c.beginPath(); c.ellipse(x, y + 22, 24, 12, 0, 0, Math.PI); c.fill();
    if (L.capelli === 'roberto') {
      c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(x - 9, y - 24, 11, 6, -.4, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(60,40,25,.18)'; c.beginPath(); c.ellipse(x, y + 8, 30, 26, 0, .1, Math.PI - .1); c.fill(); // ombra di barba rasata
    }
    // barba
    if (L.barba === 'pizzetto') {
      c.fillStyle = K('#3b2a20');
      c.beginPath(); c.moveTo(x - 15, y + 14); c.quadraticCurveTo(x, y + 9, x + 15, y + 14); c.lineTo(x + 13, y + 20); c.quadraticCurveTo(x, y + 15, x - 13, y + 20); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x - 12, y + 22); c.quadraticCurveTo(x, y + 26, x + 12, y + 22); c.lineTo(x + 10, y + 34); c.quadraticCurveTo(x, y + 40, x - 10, y + 34); c.closePath(); c.fill();
      c.fillStyle = 'rgba(59,42,32,.35)'; c.beginPath(); c.ellipse(x, y + 22, 27, 15, 0, 0, Math.PI); c.fill();
    } else if (L.barba === 'piena') {
      c.fillStyle = K(L.colCap); c.beginPath(); c.ellipse(x, y + 16, 29, 22, 0, 0, Math.PI); c.fill();
      c.fillStyle = K(L.pelle); c.beginPath(); c.ellipse(x, y + 18, 9, 5, 0, 0, Math.PI * 2); c.fill();
    }
    // occhi e sopracciglia
    const ey = y - 2;
    if (opt && opt.occhiali) {
      c.fillStyle = K('#111'); rr(c, x - 27, ey - 9, 24, 16, 5); c.fill(); rr(c, x + 3, ey - 9, 24, 16, 5); c.fill(); fr(c, K('#111'), x - 5, ey - 6, 10, 3);
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - 23, ey - 6, 6, 3); c.fillRect(x + 7, ey - 6, 6, 3);
    } else if (espr === 'dorme') {
      c.strokeStyle = K('#2b1d16'); c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 17, ey); c.lineTo(x - 7, ey); c.moveTo(x + 7, ey); c.lineTo(x + 17, ey); c.stroke();
    } else {
      ell(c, x - 12, ey, 3.6, 4.6, K('#22160f')); ell(c, x + 12, ey, 3.6, 4.6, K('#22160f'));
      circ(c, x - 11, ey - 1.5, 1.2, '#fff'); circ(c, x + 13, ey - 1.5, 1.2, '#fff');
      if (L.occhiali) { c.strokeStyle = K('#2b2b2b'); c.lineWidth = 2; c.strokeRect(x - 20, ey - 7, 15, 13); c.strokeRect(x + 5, ey - 7, 15, 13); c.beginPath(); c.moveTo(x - 5, ey - 2); c.lineTo(x + 5, ey - 2); c.stroke(); }
    }
    c.strokeStyle = K(L.colSopr || L.colCap || '#3b2a20'); c.lineWidth = 3.2; c.lineCap = 'round';
    const ang = espr === 'arrabbiato' ? 4 : espr === 'triste' ? -3 : 0;
    c.beginPath(); c.moveTo(x - 19, ey - 11 - ang); c.lineTo(x - 6, ey - 12 + ang); c.moveTo(x + 6, ey - 12 + ang); c.lineTo(x + 19, ey - 11 - ang); c.stroke();
    // naso
    c.strokeStyle = dark; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 1, y + 2); c.quadraticCurveTo(x + 5, y + 9, x - 2, y + 11); c.stroke();
    // bocca
    c.strokeStyle = K('#5a2a20'); c.lineWidth = 2.6;
    c.beginPath();
    if (espr === 'felice' || espr === 'ride') { c.arc(x, y + 14, 9, .2, Math.PI - .2); if (espr === 'ride') { c.fillStyle = K('#7a2a20'); c.fill(); } }
    else if (espr === 'triste' || espr === 'arrabbiato') c.arc(x, y + 25, 8, Math.PI + .4, -.4);
    else if (espr === 'beve') { c.ellipse(x, y + 19, 4, 3, 0, 0, Math.PI * 2); }
    else { c.moveTo(x - 7, y + 19); c.lineTo(x + 7, y + 19); }
    c.stroke();
    // capelli e cappelli
    const H = K(L.colCap || '#3b2a20');
    switch (L.capelli) {
      case 'corti': c.fillStyle = H; c.beginPath(); c.ellipse(x, y - 16, 32, 24, 0, Math.PI, 0); c.lineTo(x + 32, y - 8); c.quadraticCurveTo(x + 20, y - 22, x, y - 22); c.quadraticCurveTo(x - 20, y - 22, x - 32, y - 8); c.fill(); break;
      case 'lunghi': case 'caschetto': c.fillStyle = H; c.beginPath(); c.ellipse(x, y - 14, 34, 27, 0, Math.PI, 0); c.quadraticCurveTo(x + 8, y - 26, x - 10, y - 18); c.quadraticCurveTo(x - 26, y - 14, x - 34, y - 4); c.fill(); break;
      case 'chignon': c.fillStyle = H; circ(c, x, y - 40, 14, H); c.beginPath(); c.ellipse(x, y - 14, 32, 24, 0, Math.PI, 0); c.quadraticCurveTo(x, y - 26, x - 32, y - 10); c.fill(); break;
      case 'ricci': for (let a = Math.PI * .95; a < Math.PI * 2.05; a += .32) circ(c, x + Math.cos(a) * 28, y - 10 + Math.sin(a) * 30, 11, H); break;
      case 'brizzolati': c.fillStyle = H; c.beginPath(); c.ellipse(x, y - 14, 32, 20, 0, Math.PI, 0); c.fill(); break;
    }
    if (L.cappello === 'visiera') { c.fillStyle = K(L.colCappello); c.beginPath(); c.ellipse(x, y - 20, 33, 22, 0, Math.PI, 0); c.fill(); fr(c, K(L.colCappello), x - 6, y - 22, 46, 7); fr(c, 'rgba(0,0,0,.15)', x - 33, y - 23, 66, 4); }
    else if (L.cappello === 'fedora') { ell(c, x, y - 22, 48, 9, K(L.colCappello)); c.fillStyle = K(L.colCappello); rr(c, x - 28, y - 52, 56, 32, 10); c.fill(); fr(c, K('#1a1a1a'), x - 28, y - 30, 56, 7); }
    else if (L.cappello === 'berretto') { c.fillStyle = K(L.colCappello); c.beginPath(); c.ellipse(x, y - 18, 34, 30, 0, Math.PI, 0); c.fill(); fr(c, K(L.colCappello), x - 34, y - 22, 68, 12); c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = -30; i < 32; i += 6) c.fillRect(x + i, y - 22, 2, 12); }
  }

  function corpo(c, L, x, yf, o) {
    o = o || {};
    const fase = o.fase || 0, cam = !!o.cammina, sed = !!o.seduto;
    const hip = yf - 122, sh = yf - 212;
    // gambe
    if (!sed) {
      const s = cam ? Math.sin(fase) : 0;
      const lifts = [cam ? Math.max(0, s) * 10 : 0, cam ? Math.max(0, -s) * 10 : 0];
      [[-15, 0], [15, 1]].forEach(([dx, i]) => {
        const lx = x + dx + (cam ? (i ? -s : s) * 5 : 0);
        c.fillStyle = K(L.pantaloni); rr(c, lx - 13, hip, 26, 112 - lifts[i], 8); c.fill();
        c.fillStyle = K(L.scarpe || '#2b211b'); rr(c, lx - 15, yf - 14 - lifts[i], 32, 14, 6); c.fill();
      });
    }
    // braccia (dietro al busto quelle ferme)
    const M = K(L.maglia), Pp = K(L.pelle);
    const bdx = 44;
    const braccio = (lato, alza) => {
      const bx = x + lato * bdx;
      c.save(); c.translate(bx, sh + 12);
      const sw = cam ? Math.sin(fase + (lato > 0 ? Math.PI : 0)) * .18 : 0;
      c.rotate(alza ? lato * -2.1 : lato * .08 + sw);
      c.fillStyle = M; rr(c, -12, -6, 24, L.manica === 'lunga' ? 84 : 40, 10); c.fill();
      if (L.manica !== 'lunga') { c.fillStyle = Pp; rr(c, -10, 30, 20, 56, 9); c.fill(); }
      if (L.tatuaggio && lato < 0) { c.fillStyle = K('#3a3f48'); c.beginPath(); c.ellipse(0, 46, 6, 10, .2, 0, Math.PI * 2); c.fill(); }
      circ(c, 0, 88, 11, Pp);
      c.restore();
    };
    if (!o.mani) { braccio(-1, false); braccio(1, o.alza); }
    // busto
    c.fillStyle = M;
    c.beginPath(); c.moveTo(x - 40, sh + 4); c.quadraticCurveTo(x - 42, sh - 4, x - 30, sh - 6); c.lineTo(x + 30, sh - 6); c.quadraticCurveTo(x + 42, sh - 4, x + 40, sh + 4);
    c.lineTo(x + 36, hip + 6); c.lineTo(x - 36, hip + 6); c.closePath(); c.fill();
    if (L.motivo === 'righe') { c.fillStyle = K('#ffffff'); for (let yy = sh + 4; yy < hip; yy += 14) c.fillRect(x - 38, yy, 76, 6); }
    else if (L.motivo === 'fiori') { const cc = ['#f28c28', '#e94e3c', '#3fbf6f', '#f2c230']; let k = 0; for (let yy = sh + 10; yy < hip; yy += 20) for (let xx = x - 30; xx < x + 32; xx += 18) circ(c, xx + (k % 2) * 8, yy, 5, K(cc[(k++) % 4])); }
    else if (L.motivo === 'giacca') { fr(c, K('#ffffff'), x - 8, sh - 4, 16, 60); c.fillStyle = K(L.maglia); c.beginPath(); c.moveTo(x - 8, sh - 4); c.lineTo(x, sh + 40); c.lineTo(x + 8, sh - 4); c.fill(); }
    // colletto e collo
    fr(c, Pp, x - 10, sh - 20, 20, 18);
    c.strokeStyle = K(L.colletto || '#00000033'); c.lineWidth = 3; c.beginPath(); c.arc(x, sh - 8, 13, .3, Math.PI - .3); c.stroke();
    if (L.macchina) { c.strokeStyle = K('#222'); c.lineWidth = 3; c.beginPath(); c.moveTo(x - 30, sh); c.lineTo(x + 14, hip - 40); c.stroke(); fr(c, K('#222'), x + 4, hip - 46, 28, 20); circ(c, x + 18, hip - 36, 7, K('#555')); }
    // cintura
    fr(c, K(L.cintura || '#2b2b2b'), x - 36, hip - 2, 72, 8);
    return { sh, hip };
  }

  // bicchiere: {col, livello 0..1, tipo:'pinta'|'calice'|'bottiglia'|'lattina'}
  function bicchiere(c, x, y, b, s) {
    s = s || 1;
    c.save(); c.translate(x, y); c.scale(s, s);
    if (b.tipo === 'lattina') { fr(c, b.col2 || '#2a7ab0', -8, -30, 16, 30); fr(c, '#d9dde0', -8, -32, 16, 3); fr(c, '#ffffff', -6, -22, 12, 8); }
    else if (b.tipo === 'bottiglia') {
      c.fillStyle = b.vetro || '#5a3215';
      c.beginPath(); c.moveTo(-8, 0); c.lineTo(-8, -26); c.quadraticCurveTo(-8, -34, -3, -36); c.lineTo(-3, -46); c.lineTo(3, -46); c.lineTo(3, -36); c.quadraticCurveTo(8, -34, 8, -26); c.lineTo(8, 0); c.fill();
      fr(c, b.etichetta || '#f1e6c8', -8, -22, 16, 10);
    } else {
      const lv = Math.max(0, Math.min(1, b.livello == null ? 1 : b.livello));
      c.beginPath(); c.moveTo(-11, -40); c.lineTo(11, -40); c.lineTo(8, 0); c.lineTo(-8, 0); c.closePath();
      c.fillStyle = 'rgba(230,240,245,.35)'; c.fill();
      if (lv > 0) {
        const top = -40 + (1 - lv) * 36;
        c.save(); c.clip();
        fr(c, b.col, -12, top + 5, 24, 45);
        fr(c, '#fff8ea', -12, top, 24, 6);
        c.restore();
      }
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(-11, -40); c.lineTo(-8, 0); c.lineTo(8, 0); c.lineTo(11, -40); c.stroke();
    }
    c.restore();
  }

  function persona(c, L, x, yf, o) {
    o = o || {};
    const sed = !!o.seduto;
    const yy = sed ? yf + 66 : yf; // seduto: il corpo scende
    const bob = o.cammina ? Math.abs(Math.sin(o.fase || 0)) * -4 : 0;
    c.save();
    c.translate(0, bob);
    // ombra
    if (!sed) { c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(x, yf + 2, 40, 7, 0, 0, Math.PI * 2); c.fill(); }
    const { sh } = corpo(c, L, x, yy, { fase: o.fase, cammina: o.cammina, seduto: sed, alza: !!o.beve || !!o.saluta });
    testa(c, L, x, sh - 40, o.espr || 'ok', { occhiali: o.occhiali });
    if (o.beve && o.bicchiere) bicchiere(c, x + 40, sh - 6, o.bicchiere, 1.1);
    else if (o.bicchiere) bicchiere(c, x + 44, sh + 100, o.bicchiere, 1.1);
    c.restore();
  }

  /* Roberto: calvo, pizzetto scuro, maglietta grigia, jeans */
  const ROBERTO = { pelle: '#c68a5e', pelleOmbra: '#8f5a37', capelli: 'roberto', colSopr: '#2e2018', barba: 'pizzetto', maglia: '#8e9194', colletto: '#5f6164', pantaloni: '#3a4760', scarpe: '#2a201a', manica: 'corta', tatuaggio: true, cintura: '#3b2a1e' };
  function roberto(c, x, yf, o) {
    o = o || {};
    persona(c, ROBERTO, x, yf, { fase: o.fase, cammina: o.cammina, espr: o.espr || 'felice', occhiali: o.occhiali, saluta: o.saluta });
    // cosa ha in mano
    const sh = yf - 212 + (o.cammina ? Math.abs(Math.sin(o.fase || 0)) * -4 : 0);
    (o.mani || []).forEach((m, i) => {
      const hx = x + (i ? 46 : -46), hy = sh + 104;
      if (m.tipo === 'cibo') { piatto(c, hx, hy - 6, m); }
      else bicchiere(c, hx, hy, m.vis, 1.05);
    });
  }
  function piatto(c, x, y, m) {
    ell(c, x, y, 22, 6, '#f4f4f0'); ell(c, x, y - 1, 16, 4, '#e3e3dd');
    const col = m.bruciato ? '#3a2a1e' : { panino: '#d9a45a', piadina: '#ecd08f', focaccia: '#e3b35a', pulled: '#b5653a' }[m.cibo] || '#d9a45a';
    if (m.cibo === 'piadina') { c.fillStyle = col; c.beginPath(); c.moveTo(x - 14, y - 2); c.lineTo(x + 14, y - 12); c.lineTo(x + 14, y - 2); c.closePath(); c.fill(); fr(c, '#7fb04a', x - 4, y - 8, 12, 3); }
    else if (m.cibo === 'focaccia') { fr(c, col, x - 12, y - 10, 24, 8); circ(c, x - 5, y - 7, 2, '#f7e2a6'); circ(c, x + 4, y - 6, 2, '#f7e2a6'); }
    else { ell(c, x, y - 12, 15, 8, col); fr(c, m.cibo === 'pulled' ? '#8a3d1e' : '#c0392b', x - 14, y - 9, 28, 4); fr(c, '#7fb04a', x - 13, y - 6, 26, 2); ell(c, x, y - 4, 15, 4, col); }
  }

  /* =================== CANI =================== */
  function cane(c, tipo, x, yf, o) {
    o = o || {};
    const B = tipo === 'blanche';
    const sc = B ? 1 : .9;
    const corpoCol = K(B ? '#f2ead9' : '#86847e'), ombra = K(B ? '#e2cfa6' : '#5e5c57'), chiaro = K(B ? '#fffaf0' : '#a9a69e');
    c.save(); c.translate(x, yf); c.scale((o.dir || 1) * sc, sc);
    c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(0, 2, 62, 7, 0, 0, Math.PI * 2); c.fill();
    const t = o.t || 0, fase = o.fase || 0;
    const scruffy = (cx, cy, rx, ry, col, n) => { // pelo ispido ma morbido di Malthus
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2, j = ((i * 7919) % 7) / 7;
        const px = cx + Math.cos(a) * rx * (.9 + j * .12), py = cy + Math.sin(a) * ry * (.9 + j * .12);
        c.fillStyle = col; c.beginPath(); c.ellipse(px, py, 4 + j * 3, 3 + j * 2, a, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = col; c.lineWidth = 1.6;
      for (let i = 0; i < n * .6; i++) { const a = i * 2.4, r = .25 + ((i * 31) % 10) / 16; const px = cx + Math.cos(a) * rx * r, py = cy + Math.sin(a) * ry * r; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 4, py + 5); c.stroke(); }
    };
    const testaCane = (hy) => {
    ell(c, 50, hy, 24, 21, corpoCol);
    ell(c, 70, hy + 7, 15, 10, B ? chiaro : K('#9b9891'));
    circ(c, 84, hy + 4, 4.5, '#1a1a1a');
    if (o.dorme) { c.strokeStyle = '#1a1a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(52, hy - 4); c.lineTo(60, hy - 4); c.stroke(); }
    else { circ(c, 57, hy - 5, 3.6, '#1a1a1a'); circ(c, 58, hy - 6, 1.1, '#fff'); }
    if (o.lingua) { c.fillStyle = '#e77a8a'; c.beginPath(); c.ellipse(72, hy + 20, 6, 9, .2, 0, Math.PI * 2); c.fill(); }
    if (B) {
      c.fillStyle = corpoCol; c.beginPath(); c.moveTo(36, hy - 12); c.lineTo(38, hy - 40); c.lineTo(52, hy - 18); c.fill();    // orecchio dritto
      c.fillStyle = ombra; c.beginPath(); c.moveTo(54, hy - 18); c.quadraticCurveTo(66, hy - 34, 70, hy - 20); c.quadraticCurveTo(64, hy - 16, 58, hy - 12); c.fill(); // orecchio piegato
      c.fillStyle = '#f2b8b8'; c.beginPath(); c.moveTo(40, hy - 16); c.lineTo(41, hy - 32); c.lineTo(48, hy - 18); c.fill();
    } else {
      scruffy(50, hy, 24, 21, ombra, 22);
      c.fillStyle = K('#6a6863'); c.beginPath(); c.moveTo(34, hy - 10); c.lineTo(32, hy - 36); c.lineTo(48, hy - 16); c.fill();
      c.beginPath(); c.moveTo(54, hy - 16); c.lineTo(66, hy - 36); c.lineTo(66, hy - 12); c.fill();
      scruffy(70, hy + 14, 12, 9, K('#b5b2aa'), 14); // barba
      c.strokeStyle = K('#4b4a46'); c.lineWidth = 2.5; c.beginPath(); c.moveTo(50, hy - 12); c.lineTo(62, hy - 10); c.stroke(); // sopracciglio ispido
    }
    };
    if (o.posa === 'sdraiato') {
      c.strokeStyle = corpoCol; c.lineWidth = B ? 14 : 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-56, -20); c.quadraticCurveTo(-80, -14, -76, -4); c.stroke();
      ell(c, -6, -24, 56, 22, corpoCol);
      ell(c, -10, -36, 42, 8, B ? ombra : K('#6c6a65'));
      ell(c, 18, -26, 22, 20, B ? chiaro : corpoCol);
      ell(c, 52, -7, 24, 7, corpoCol); ell(c, 44, -5, 22, 6, ombra);
      if (!B) scruffy(-6, -24, 54, 18, ombra, 30);
      c.save(); c.translate(-14, 42); testaCane(-94); c.restore();
      c.restore();
      return;
    }
    const cam = !!o.cammina;
    const gambe = [[-40, 0], [-26, 1], [26, 1], [38, 0]];
    gambe.forEach(([lx, k], i) => {
      const sw = cam ? Math.sin(fase + k * Math.PI) * 9 : 0;
      c.fillStyle = i === 1 || i === 2 ? ombra : corpoCol;
      rr(c, lx - 6 + sw * (i < 2 ? 1 : -1) * .6, -48, 12, 46, 5); c.fill();
      ell(c, lx + 2 + sw * (i < 2 ? 1 : -1) * .6, -3, 9, 5, i === 1 || i === 2 ? ombra : corpoCol);
    });
    // coda
    const wag = Math.sin(t * (o.scodinzola ? 18 : 4)) * (o.scodinzola ? .45 : .15);
    c.save(); c.translate(-50, -60); c.rotate(-.5 + wag);
    c.strokeStyle = corpoCol; c.lineCap = 'round';
    if (B) { c.lineWidth = 18; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-20, -30, 4, -46); c.stroke(); c.lineWidth = 10; c.strokeStyle = chiaro; c.beginPath(); c.moveTo(-6, -14); c.quadraticCurveTo(-14, -30, 4, -42); c.stroke(); }
    else { c.lineWidth = 9; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-16, -18, -12, -36); c.stroke(); scruffy(-10, -20, 8, 16, ombra, 10); }
    c.restore();
    // corpo
    ell(c, -4, -60, 56, 26, corpoCol);
    ell(c, -6, -76, 44, 9, B ? ombra : K('#6c6a65'));
    ell(c, 34, -62, 24, 26, B ? chiaro : corpoCol);
    if (B) { // pettorina rossa
      c.strokeStyle = K('#c0392b'); c.lineWidth = 6; c.beginPath(); c.moveTo(26, -86); c.lineTo(22, -40); c.stroke();
      c.beginPath(); c.moveTo(-4, -84); c.quadraticCurveTo(0, -60, -6, -36); c.stroke();
    } else { scruffy(-4, -60, 56, 26, ombra, 60); scruffy(34, -62, 24, 26, chiaro, 24); }
    testaCane(o.posa === 'seduto' ? -104 : -94);
    c.restore();
  }

  window.TD = { W, Y0, Y1, CUT, FL, BL, sfondo, fronte, notte, notteFronte, persona, roberto, cane, bicchiere, piatto, luce, K, rr, ell, circ, fr, lg, rg, rng };
})();
