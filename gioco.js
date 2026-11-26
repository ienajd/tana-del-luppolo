/* Tana del Luppolo Game — il gioco. Si gioca come Roberto dietro al bancone. */
(function () {
  'use strict';
  const T = window.TD, D = window.TDATI;
  const { W, Y0, Y1, CUT, FL, BL } = T;
  const { TAG, COLORI, STILI, STILE, CIBI, SERATE, INFINITA } = D;
  const GAP = 1210, DOOR_E = 470, DOOR_I = 742;
  const TAPX = [880, 940, 1000, 1060], FRIGOX = 1158, CUCX = 1296;
  const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const $ = id => document.getElementById(id);
  const rnd = Math.random, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = a => a[(rnd() * a.length) | 0];

  /* ================= salvataggio ================= */
  const CHIAVE = 'tana-luppolo-v1';
  let SAVE = { stelle: {}, punti: {}, record: 0, album: {}, visti: {}, notte: false, musica: true, effetti: true };
  try { Object.assign(SAVE, JSON.parse(localStorage.getItem(CHIAVE) || '{}')); } catch (e) { }
  const salva = () => { try { localStorage.setItem(CHIAVE, JSON.stringify(SAVE)); } catch (e) { } };

  /* ================= audio ================= */
  const A = { ctx: null, master: null, mus: null, nextT: 0, step: 0, spina: null };
  function audioInit() {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    A.ctx = new AC(); A.master = A.ctx.createGain(); A.master.gain.value = .8; A.master.connect(A.ctx.destination);
    A.mus = A.ctx.createGain(); A.mus.gain.value = SAVE.musica ? .055 : 0; A.mus.connect(A.master);
    const n = A.ctx.sampleRate; A.noise = A.ctx.createBuffer(1, n, n); const d = A.noise.getChannelData(0); for (let i = 0; i < n; i++) d[i] = rnd() * 2 - 1;
    A.nextT = A.ctx.currentTime + .1;
    setInterval(musica, 60);
  }
  function tono(f, dur, tipo, vol, quando, f2, dest) {
    if (!A.ctx) return; const t = A.ctx.currentTime + (quando || 0);
    const o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
    o.connect(g); g.connect(dest || A.master); o.start(t); o.stop(t + dur + .05);
  }
  function rumore(dur, freq, q, vol, quando, tipo) {
    if (!A.ctx) return; const t = A.ctx.currentTime + (quando || 0);
    const s = A.ctx.createBufferSource(); s.buffer = A.noise; const f = A.ctx.createBiquadFilter(); f.type = tipo || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = A.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
    s.connect(f); f.connect(g); g.connect(A.master); s.start(t, rnd() * .5); s.stop(t + dur + .05);
  }
  function suono(n) {
    if (!SAVE.effetti || !A.ctx) return;
    switch (n) {
      case 'tin': tono(2350, .25, 'sine', .12); tono(3120, .2, 'sine', .08, .05); break;
      case 'monete': tono(988, .09, 'square', .05); tono(1319, .16, 'square', .05, .07); break;
      case 'porta': tono(1046, .5, 'sine', .07); tono(784, .7, 'sine', .07, .18); break;
      case 'bau': rumore(.12, 700, 1.2, .25); tono(320, .14, 'sawtooth', .07, 0, 170); rumore(.1, 700, 1.2, .2, .2); tono(300, .12, 'sawtooth', .06, .2, 160); break;
      case 'no': tono(200, .22, 'square', .05, 0, 120); break;
      case 'ok': tono(660, .08, 'triangle', .1); tono(990, .1, 'triangle', .08, .06); break;
      case 'tocco': tono(520, .05, 'triangle', .07); break;
      case 'sfrigola': rumore(.9, 4500, .6, .08, 0, 'highpass'); break;
      case 'arrabbiato': tono(240, .25, 'sawtooth', .05, 0, 150); tono(180, .3, 'sawtooth', .05, .15, 110); break;
      case 'combo': [784, 988, 1175, 1568].forEach((f, i) => tono(f, .14, 'triangle', .07, i * .06)); break;
      case 'fine': [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tono(f, .25, 'triangle', .09, i * .12)); break;
      case 'cuore': tono(880, .12, 'sine', .07); tono(1175, .18, 'sine', .07, .08); break;
    }
  }
  function spinaSuono(on, liv) {
    if (!A.ctx || !SAVE.effetti) return;
    if (on && !A.spina) {
      const s = A.ctx.createBufferSource(); s.buffer = A.noise; s.loop = true;
      const f = A.ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.5; f.frequency.value = 500;
      const g = A.ctx.createGain(); g.gain.value = .0; g.gain.linearRampToValueAtTime(.16, A.ctx.currentTime + .08);
      s.connect(f); f.connect(g); g.connect(A.master); s.start(); A.spina = { s, f, g };
    } else if (!on && A.spina) { const sp = A.spina; A.spina = null; sp.g.gain.linearRampToValueAtTime(0, A.ctx.currentTime + .06); sp.s.stop(A.ctx.currentTime + .1); }
    if (A.spina && liv != null) A.spina.f.frequency.value = 450 + liv * 900;
  }
  // musichetta da osteria: basso e accordi a contrattempo
  const ACC = [[196, [392, 494, 587]], [165, [330, 392, 494]], [131, [392, 523, 659]], [147, [370, 440, 587]]];
  const MEL = [784, 880, 988, 1175, 1319, 988, 880, 784];
  function musica() {
    if (!A.ctx) return;
    A.mus.gain.value = (SAVE.musica && S.fase !== 'pausa') ? .055 : 0;
    const bt = 60 / 116 / 2;
    while (A.nextT < A.ctx.currentTime + .25) {
      const st = A.step, bar = ((st / 8) | 0) % 4, b8 = st % 8, [bass, ch] = ACC[bar];
      if (b8 === 0 || b8 === 4) tono(b8 === 0 ? bass : bass * 1.5, .3, 'triangle', .5, A.nextT - A.ctx.currentTime, 0, A.mus);
      if (b8 === 2 || b8 === 6) ch.forEach(f => tono(f, .16, 'triangle', .16, A.nextT - A.ctx.currentTime, 0, A.mus));
      if ((st * 7) % 11 < 3 && b8 % 2 === 1) tono(MEL[(st * 5) % 8] * (bar === 1 ? .84 : 1), .18, 'sine', .18, A.nextT - A.ctx.currentTime, 0, A.mus);
      A.nextT += bt; A.step++;
    }
  }

  /* ================= stato ================= */
  const S = {
    fase: 'titolo', t: 0, idx: 0, ser: null, notte: !!SAVE.notte, nv: SAVE.notte ? 1 : 0,
    clienti: [], cani: [], fx: [], punti: 0, rec: [], combo: 1, persi: 0, serviti: 0, perfette: 0,
    spine: [], frigo: [], cibi: [], piastra: [null, null], pulled: 0, prossimo: 2, nave: 0, selCane: null,
    cam: { x: 200, man: 0 }, hit: [], nuoviAlbum: [], spill: null, fasePrima: null, idC: 1, chiusura: 0, migliori: {}
  };
  const R = { x: 1000, y: BL, zona: 'B', coda: [], az: null, mani: [], fase: 0, cammina: false, dir: 1, parla: null, alpha: 1, attesa: 0 };

  /* ================= posti ================= */
  const POSTI = [
    { tipo: 'banco', x: 850, sx: 850, sz: 'B' }, { tipo: 'banco', x: 985, sx: 985, sz: 'B' }, { tipo: 'banco', x: 1120, sx: 1120, sz: 'B' },
    { tipo: 'sala', x: 1440, sx: 1386, sz: 'I' }, { tipo: 'sala', x: 1640, sx: 1580, sz: 'I' }, { tipo: 'sala', x: 1520, sx: 1580, sz: 'I' }, { tipo: 'sala', x: 1720, sx: 1790, sz: 'I' },
    { tipo: 'fuori', x: 226, sx: 356, sz: 'E' }, { tipo: 'fuori', x: 292, sx: 356, sz: 'E' }
  ];
  POSTI.forEach((p, i) => { p.i = i; p.occ = null; p.attivo = false; });

  /* ================= percorsi (dietro al bancone B, dentro I, fuori E) ================= */
  const ORD = { B: 0, I: 1, E: 2 }, ZON = ['B', 'I', 'E'];
  function percorso(a, b) {
    const nodi = []; let z = ORD[a.zona];
    const zb = ORD[b.zona];
    while (z !== zb) {
      const nz = z + (zb > z ? 1 : -1), da = ZON[z], aa = ZON[nz];
      if (da === 'B' && aa === 'I') nodi.push({ x: GAP, zona: 'B' }, { x: GAP, zona: 'I' });
      if (da === 'I' && aa === 'B') nodi.push({ x: GAP, zona: 'I' }, { x: GAP, zona: 'B' });
      if (da === 'I' && aa === 'E') nodi.push({ x: DOOR_I, zona: 'I' }, { x: DOOR_E, zona: 'E', porta: 1 });
      if (da === 'E' && aa === 'I') nodi.push({ x: DOOR_E, zona: 'E' }, { x: DOOR_I, zona: 'I', porta: 1 });
      z = nz;
    }
    nodi.push({ x: b.x, zona: b.zona });
    return nodi;
  }
  function muovi(e, dt, vel) {
    if (!e.path || !e.path.length) { e.cammina = false; return true; }
    const n = e.path[0];
    if (n.zona !== e.zona) {
      e.zona = n.zona;
      if (n.porta) { e.x = n.x; e.alpha = 0; if (e === R || e.cliente) suono('porta'); }
      e.path.shift(); return false;
    }
    const d = n.x - e.x;
    if (Math.abs(d) < 2) { e.x = n.x; e.path.shift(); if (!e.path.length) { e.cammina = false; return true; } return false; }
    const s = Math.sign(d) * Math.min(Math.abs(d), vel * dt);
    e.x += s; e.dir = Math.sign(d); e.cammina = true; e.fase = (e.fase || 0) + dt * vel / 22;
    return false;
  }
  const yZona = z => z === 'B' ? BL : FL;

  /* ================= clienti ================= */
  const PELLI = ['#f1d2b6', '#e8c3a0', '#d9a57e', '#b87a52', '#8d5a3b', '#6b4029'];
  const CAPCOL = ['#2b1d16', '#4a2f1c', '#6b3e1f', '#c9a86a', '#1a1a1a', '#8a8a8a', '#b5502a', '#d9c39a'];
  const MAGLIE = ['#3b7dd8', '#d9534f', '#2f8f5b', '#f2c230', '#8e44ad', '#e67e22', '#2c3e50', '#16a085', '#c0392b', '#f5f5f5', '#7f8c8d', '#e84393', '#1f6f8b', '#a0522d'];
  const PANT = ['#2d3a55', '#334', '#3d3d3d', '#5b4a3a', '#1f2a44', '#7a6a55', '#e8e0cc', '#4a5d6e'];
  function aspetto(tipo) {
    const L = { pelle: pick(PELLI), capelli: pick(['corti', 'corti', 'lunghi', 'chignon', 'ricci', 'caschetto', 'brizzolati', 'calvo']), colCap: pick(CAPCOL), maglia: pick(MAGLIE), pantaloni: pick(PANT), manica: rnd() < .5 ? 'corta' : 'lunga' };
    L.pelleOmbra = '#7a4a2e';
    if (L.capelli === 'brizzolati') L.colCap = pick(['#8a8a8a', '#b0aca5', '#d6d3cc']);
    if (rnd() < .18) L.occhiali = true;
    if (rnd() < .15 && ['corti', 'calvo', 'brizzolati', 'ricci'].includes(L.capelli)) L.barba = 'piena';
    const r = rnd();
    if (r < .2) L.motivo = 'righe'; else if (r < .32) L.motivo = 'giacca';
    if (tipo === 'crociera') { L.cappello = 'visiera'; L.colCappello = pick(['#ffffff', '#f2c230', '#3b7dd8', '#e74c3c']); L.macchina = rnd() < .6; L.motivo = rnd() < .5 ? 'fiori' : null; L.manica = 'corta'; L.pantaloni = pick(['#e8e0cc', '#c9b48a', '#4a5d6e']); }
    else if (tipo === 'esperto') { L.cappello = 'fedora'; L.colCappello = '#3b3b3b'; L.occhiali = true; L.motivo = 'giacca'; L.maglia = pick(['#5b3a29', '#2c3e50', '#4a4a4a']); L.manica = 'lunga'; }
    else if (rnd() < .1) { L.cappello = 'berretto'; L.colCappello = pick(['#1f3a5f', '#8a1f24', '#2f4f3a']); L.motivo = 'righe'; L.maglia = '#1f3a5f'; }
    else if (rnd() < .07) { L.cappello = 'fedora'; L.colCappello = pick(['#3b3b3b', '#6b5a45']); }
    return L;
  }
  function pesoStile(s, p) { let w = 1; s.tags.forEach(t => w += (p[t] || 0)); w += (p[s.cat] || 0); return w * w; }
  function scegliPesato(arr, fw) { const ws = arr.map(fw), tot = ws.reduce((a, b) => a + b, 0); let r = rnd() * tot; for (let i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; } return arr[arr.length - 1]; }
  function disponibili() { return S.spine.filter(s => s.fusto > 0 || s.fusto === undefined).map(s => s.stile).concat(S.frigo.map(f => f.stile)); }
  function richiesta(tipo) {
    const ser = S.ser, p = (ser.prev && ser.prev.p) || {};
    const w = {};
    if (tipo === 'esperto') {
      const st = pick(disponibili().length ? disponibili() : STILI.map(s => s.id));
      return { esperto: true, stile: st };
    }
    // il cliente pensa a una birra: spesso tra quelle in carta, a volte no (conta aver scelto bene le spine)
    let base;
    const inCarta = disponibili().map(id => STILE[id]);
    if (ser.scelta && rnd() < .45) base = scegliPesato(STILI, s => pesoStile(s, p));
    else base = scegliPesato(inCarta.length ? inCarta : STILI, s => pesoStile(s, p));
    w.col = base.cat;
    w.tags = rnd() < (S.idx < 2 ? .5 : .3) ? [pick(base.tags)] : base.tags.slice();
    if (ser.cibo && rnd() < (ser.pulled ? .48 : .4)) {
      const lista = ser.cibo.slice(); if (ser.pulled) lista.push('pulled', 'pulled');
      w.cibo = pick(lista);
    }
    return w;
  }
  function match(stileId, w) {
    const s = STILE[stileId];
    if (w.esperto) return stileId === w.stile ? 1 : (s.cat === STILE[w.stile].cat ? .34 : 0);
    let ok = 0, tot = 1 + w.tags.length;
    if (s.cat === w.col) ok++;
    w.tags.forEach(t => { if (s.tags.includes(t)) ok++; });
    return ok / tot;
  }
  function nuovoCliente(tipo) {
    const liberi = POSTI.filter(p => p.attivo && !p.occ);
    if (!liberi.length) return false;
    // preferisce il bancone, poi la sala, poi fuori (di giorno fuori piace di più)
    const pref = p => (p.tipo === 'banco' ? 3 : p.tipo === 'sala' ? 2 : (S.notte ? 1 : 3)) + rnd() * 2;
    const posto = liberi.sort((a, b) => pref(b) - pref(a))[0];
    const c = { id: S.idC++, cliente: true, tipo: tipo || 'normale', L: aspetto(tipo), x: -70 - rnd() * 40, y: FL, zona: 'E', stato: 'arriva', posto, alpha: 1, fase: rnd() * 6, dir: 1,
      got: { birra: null, cibo: false }, paz: 1, pazDur: S.ser.paz * (.9 + rnd() * .25) * (tipo === 'esperto' ? 1.2 : 1), giri: 0, espr: 'felice', vel: 210 + rnd() * 40, bruciato: false, react: null };
    c.want = richiesta(tipo);
    posto.occ = c;
    c.path = percorso({ zona: 'E' }, { x: posto.x, zona: posto.tipo === 'fuori' ? 'E' : 'I' });
    S.clienti.push(c);
    return true;
  }
  function liberaPosto(c) { if (c.posto && c.posto.occ === c) c.posto.occ = null; }
  function vaVia(c, arrabbiato) {
    c.stato = 'esce'; c.espr = arrabbiato ? 'arrabbiato' : 'felice';
    liberaPosto(c);
    if (c.posto.tipo === 'sala') c.y = FL;
    c.path = percorso({ zona: c.zona }, { x: -90, zona: 'E' });
    if (S.selCane && S.selCane.target === c) S.selCane = null;
  }

  /* ================= serata ================= */
  function avvia(idx, spineScelte) {
    const ser = idx >= SERATE.length ? INFINITA : SERATE[idx];
    S.idx = idx; S.ser = ser; S.t = 0; S.punti = 0; S.rec = []; S.combo = 1; S.persi = 0; S.serviti = 0; S.perfette = 0; S.nuoviAlbum = []; S.chiusura = 0;
    S.clienti = []; S.fx = []; S.piastra = [null, null]; S.prossimo = 2.5; S.nave = ser.nave ? 30 + rnd() * 20 : Infinity; S.selCane = null; S.spill = null;
    S.esperti = 0; S.migliori = {};
    setNotte(ser.notte, true);
    POSTI.forEach(p => { p.occ = null; p.attivo = false; });
    POSTI.filter(p => p.tipo === 'banco').slice(0, ser.banco).forEach(p => p.attivo = true);
    POSTI.filter(p => p.tipo === 'sala').slice(0, ser.sala).forEach(p => p.attivo = true);
    POSTI.filter(p => p.tipo === 'fuori').slice(0, ser.fuori).forEach(p => p.attivo = true);
    const spine = spineScelte || ser.spine;
    S.spine = spine.map(id => ({ stile: id, fusto: ser.fusti || undefined }));
    // frigo: bottiglie e lattine tra gli stili non alla spina, un po' secondo le previsioni
    S.frigo = [];
    if (ser.frigo) {
      const resto = STILI.filter(s => !spine.includes(s.id)); const p = (ser.prev && ser.prev.p) || {};
      while (S.frigo.length < ser.frigo && resto.length) {
        const s = scegliPesato(resto, x => Math.sqrt(pesoStile(x, p))); resto.splice(resto.indexOf(s), 1);
        S.frigo.push({ stile: s.id, tipo: S.frigo.length % 2 ? 'lattina' : 'bottiglia' });
      }
    }
    S.cibi = (ser.cibo || []).slice();
    S.pulled = ser.pulled || 0;
    Object.assign(R, { x: 1000, y: BL, zona: 'B', coda: [], az: null, mani: [], parla: null, alpha: 1, cammina: false });
    // cani
    S.cani = ser.cani ? [nuovoCane('blanche', 1290), nuovoCane('malthus', 780)] : [];
    const n = ser.infinita ? 30 : ser.dur / ser.int * 1.05;
    const extra = ser.cibo ? 3 : 0;
    S.soglie = ser.infinita ? null : [Math.round(n * (9 + extra)), Math.round(n * (17 + extra)), Math.round(n * (25 + extra))];
    costruisciLavagna();
    S.fase = 'gioco';
    nascondiSchermo();
    layout();
    aggiornaHud(true);
    S.cam.man = 0; S.cam.x = R.x - vista().w / 2;
    tutorial('inizio');
  }
  function nuovoCane(tipo, x) { return { tipo, x, y: FL + 24, zona: 'I', stato: 'giro', t: 1 + rnd() * 3, dir: 1, path: [], fase: 0, cool: 0, alpha: 1, target: null }; }

  /* ================= azioni di Roberto ================= */
  const ICONA_AZ = { spina: '🍺', frigo: '🧊', cucina: '🔥', ritira: '🍽️', servi: '🛎️', fusto: '🛢️' };
  function accoda(az) {
    if (S.fase !== 'gioco') return;
    if (R.coda.length >= 4) { toast('Roberto ha già 5 cose da fare!'); suono('no'); return; }
    R.coda.push(az); suono('tocco');
  }
  function bersaglio(az) {
    switch (az.t) {
      case 'spina': case 'fusto': return { x: TAPX[az.i], zona: 'B' };
      case 'frigo': return { x: FRIGOX, zona: 'B' };
      case 'cucina': case 'ritira': return { x: CUCX, zona: 'B' };
      case 'servi': return { x: az.c.posto.sx, zona: az.c.posto.sz };
    }
  }
  function maniPiene() { if (R.mani.length >= 2) { toast('Roberto ha le mani piene! Servi o tocca una mano per posare.'); suono('no'); return true; } return false; }
  function iniziaAzione(az) {
    // controlli prima di partire
    if (az.t === 'spina') { const sp = S.spine[az.i]; if (sp.fusto === 0) { toast('Fusto finito: cambialo!'); suono('no'); return false; } if (maniPiene()) return false; }
    if (az.t === 'frigo' && maniPiene()) return false;
    if (az.t === 'cucina') {
      const cb = CIBI[az.cibo];
      if (cb.cuoce) { if (S.piastra.every(x => x)) { toast('La piastra è piena'); suono('no'); return false; } }
      else { if (maniPiene()) return false; if (az.cibo === 'pulled' && S.pulled <= 0) { toast('Pulled pork finito per stasera!'); suono('no'); return false; } }
    }
    if (az.t === 'ritira') { if (!S.piastra[az.slot]) return false; if (maniPiene()) return false; }
    if (az.t === 'servi') { if (!S.clienti.includes(az.c) || az.c.stato !== 'attende') return false; }
    R.az = az; az.fase = 'va'; R.path = percorso(R, bersaglio(az));
    return true;
  }
  function durata(az) { return { frigo: .45, cucina: az.cibo === 'pulled' ? CIBI.pulled.sfila : .5, ritira: .35, servi: .45, fusto: 2.2 }[az.t] || .3; }
  function aggiornaRoberto(dt) {
    if (R.parla) { R.parla.t -= dt; if (R.parla.t <= 0) R.parla = null; }
    R.alpha = Math.min(1, R.alpha + dt * 4);
    R.y += (yZona(R.zona) - R.y) * Math.min(1, dt * 12);
    if (!R.az) {
      while (R.coda.length && !R.az) { const az = R.coda.shift(); iniziaAzione(az); }
      if (!R.az) { R.cammina = false; return; }
    }
    const az = R.az;
    if (az.fase === 'va') {
      if (muovi(R, dt, 380)) {
        az.fase = 'fa'; az.tt = durata(az);
        if (az.t === 'spina') apriSpillatura(az);
        if (az.t === 'cucina' && CIBI[az.cibo].cuoce) suono('sfrigola');
        if (az.t === 'servi') R.dir = az.c.x > R.x ? 1 : -1;
      }
    } else if (az.fase === 'fa') {
      if (az.t === 'spina' && S.spill) return;   // aspetta il giocatore
      az.tt -= dt;
      if (az.tt <= 0) { completa(az); R.az = null; }
    }
  }
  function visBirra(id, tipo) { const s = STILE[id]; return tipo === 'bottiglia' ? { tipo, vetro: s.cat === 'chiara' ? '#3f6b2e' : '#5a3215', etichetta: s.hex } : tipo === 'lattina' ? { tipo, col2: s.hex } : { tipo: 'pinta', col: s.hex, livello: 1 }; }
  function completa(az) {
    switch (az.t) {
      case 'spina': break; // fatto in chiudiSpillatura
      case 'frigo': { const f = S.frigo[az.i]; R.mani.push({ tipo: 'birra', stile: f.stile, q: .85, vis: visBirra(f.stile, f.tipo) }); suono('tin'); break; }
      case 'cucina': {
        const cb = CIBI[az.cibo];
        if (cb.cuoce) { const i = S.piastra.findIndex(x => !x); if (i >= 0) S.piastra[i] = { cibo: az.cibo, t: 0 }; }
        else { if (az.cibo === 'pulled') S.pulled--; R.mani.push({ tipo: 'cibo', cibo: az.cibo, bruciato: false }); suono('ok'); }
        break;
      }
      case 'ritira': { const p = S.piastra[az.slot]; if (p) { const cb = CIBI[p.cibo]; if (p.t < cb.cuoce) { toast('Non è ancora pronto!'); R.coda.unshift(az); break; } R.mani.push({ tipo: 'cibo', cibo: p.cibo, bruciato: p.t > cb.cuoce + cb.brucia }); S.piastra[az.slot] = null; suono('ok'); } break; }
      case 'fusto': S.spine[az.i].fusto = S.ser.fusti; toast('Fusto nuovo attaccato!'); suono('ok'); break;
      case 'servi': servi(az.c); break;
    }
    aggiornaLavagna();
  }

  /* ================= spillatura ================= */
  function apriSpillatura(az) {
    S.spill = { az, liv: 0, premuto: false, iniziato: false, t: 0 };
    $('spilla').classList.add('su');
    const s = STILE[S.spine[az.i].stile];
    $('spNome').textContent = s.n;
    $('spLiv').style.background = s.hex;
    $('spLiv').style.height = '0%'; $('spSchiuma').style.bottom = '0%'; $('spSchiuma').style.height = '0%';
    const el = $('spilla'), sc = V.scena;
    el.style.left = Math.round(sc.x + sc.w / 2 - 95) + 'px';
    el.style.top = Math.round(Math.max(sc.y + 50, sc.y + sc.h - 250)) + 'px';
    tutorial('spilla');
  }
  function aggiornaSpillatura(dt) {
    const sp = S.spill; if (!sp) return;
    sp.t += dt;
    if (sp.premuto) { sp.iniziato = true; sp.liv += dt * .62; spinaSuono(true, sp.liv); }
    if (!sp.iniziato && sp.t > 6) { sp.liv = .78; chiudiSpillatura(); return; }
    if (sp.liv > 1.12) { chiudiSpillatura(); return; }
    const l = Math.min(sp.liv, 1), birra = l * 80, schiuma = (sp.liv > .03 ? l * 10 + 3 : 0) + Math.max(0, sp.liv - 1) * 40;
    $('spLiv').style.height = birra + '%';
    $('spSchiuma').style.bottom = birra + '%'; $('spSchiuma').style.height = Math.min(100 - birra, schiuma) + '%';
  }
  function chiudiSpillatura() {
    const sp = S.spill; if (!sp) return;
    spinaSuono(false);
    S.spill = null; $('spilla').classList.remove('su');
    const l = sp.liv; let q, msg;
    if (l >= .84 && l <= .98) { q = 1; msg = 'Spillatura perfetta!'; S.perfSpill = (S.perfSpill || 0) + 1; }
    else if (l >= .7 && l <= 1.04) { q = .7; msg = l < .84 ? 'Un po’ bassa' : 'Un filo di schiuma in più'; }
    else { q = .4; msg = l < .7 ? 'Bicchiere mezzo vuoto…' : 'Troppa schiuma!'; }
    const az = sp.az, spi = S.spine[az.i];
    if (spi.fusto !== undefined) spi.fusto--;
    R.mani.push({ tipo: 'birra', stile: spi.stile, q, vis: visBirra(spi.stile, 'pinta') });
    fxTesto(R.x, R.y - 300, msg, q === 1 ? '#7dff9a' : q > .5 ? '#ffe28a' : '#ff9a8a');
    suono('tin');
    az.tt = .2;
    aggiornaLavagna();
    tutorial('servi');
  }

  /* ================= servire ================= */
  function servi(c) {
    if (!S.clienti.includes(c) || c.stato !== 'attende') return;
    let dato = false;
    if (!c.got.birra) {
      let best = -1, bi = -1;
      R.mani.forEach((m, i) => { if (m.tipo === 'birra') { const sc = match(m.stile, c.want); if (sc > best) { best = sc; bi = i; } } });
      if (bi >= 0) { const m = R.mani.splice(bi, 1)[0]; c.got.birra = m; consegnaBirra(c, m, best); dato = true; }
    }
    if (c.want.cibo && !c.got.cibo) {
      const i = R.mani.findIndex(m => m.tipo === 'cibo' && m.cibo === c.want.cibo);
      if (i >= 0) {
        const m = R.mani.splice(i, 1)[0]; c.got.cibo = true; c.bruciato = m.bruciato; dato = true;
        const pt = m.bruciato ? 2 : CIBI[m.cibo].p; S.punti += pt;
        fxTesto(c.x, c.y - 330, (m.bruciato ? '🤢 ' : CIBI[m.cibo].e + ' ') + '+' + pt, m.bruciato ? '#ff9a8a' : '#ffe28a');
        if (m.cibo === 'pulled' && !m.bruciato) c.react = { e: '😋', t: 2 };
      }
    }
    if (!dato) {
      const haCibo = R.mani.some(m => m.tipo === 'cibo');
      toast(haCibo && c.want.cibo && !c.got.cibo ? 'Ha ordinato ' + CIBI[c.want.cibo].n.toLowerCase() + ', non questo!' : R.mani.length ? 'Non c’è niente per questo cliente' : 'Roberto ha le mani vuote: prima prendi qualcosa dalla lavagna');
      suono('no'); return;
    }
    const tutto = c.got.birra && (!c.want.cibo || c.got.cibo);
    if (tutto) { c.stato = 'beve'; c.bevi = 6 + rnd() * 3; c.beviDur = c.bevi; c.pazFinale = c.paz; }
    aggiornaLavagna();
  }
  function consegnaBirra(c, m, sc) {
    const s = STILE[m.stile];
    if (sc >= .99) { S.combo = Math.min(3, S.combo + .5); S.perfette++; if (S.combo >= 2) suono('combo'); }
    else S.combo = 1;
    const pt = Math.round((10 * sc + 4 * m.q) * (sc >= .99 ? S.combo : 1));
    S.punti += pt; c.match = sc; c.q = m.q;
    c.espr = sc >= .99 ? 'ride' : sc >= .6 ? 'felice' : sc > .3 ? 'ok' : 'triste';
    c.react = { e: sc >= .99 ? '😍' : sc >= .6 ? '🙂' : sc > .3 ? '😐' : '😕', t: 2.4 };
    fxTesto(c.x, c.y - 300, '+' + pt + (sc >= .99 && S.combo > 1 ? '  combo ×' + S.combo : ''), sc >= .99 ? '#7dff9a' : '#ffe28a');
    R.parla = { titolo: s.n + ' · ' + s.abv, testo: s.f, t: 3.6 };
    if (!SAVE.album[s.id]) { SAVE.album[s.id] = 1; S.nuoviAlbum.push(s.id); salva(); fxTesto(R.x, R.y - 340, '📖 Nuova nell’album!', '#9fd8ff'); }
    S.migliori[s.id] = (S.migliori[s.id] || 0) + 1;
    suono('tin');
    if (c.want.esperto) { if (sc >= .99) { S.punti += 15; fxTesto(c.x, c.y - 360, 'L’esperto approva! +15', '#7dff9a'); } }
    tutorial('spiega');
  }
  function paga(c) {
    const tip = Math.round(6 * (c.pazFinale || 0));
    S.punti += tip;
    let stelle = 1 + 3 * (c.match || 0) + ((c.pazFinale || 0) > .45 ? 1 : 0) - (c.bruciato ? 1 : 0);
    stelle = clamp(Math.round(stelle), 1, 5);
    S.rec.push(stelle); S.serviti++;
    fxTesto(c.x, c.y - 330, '🪙 +' + tip + '   ' + '★'.repeat(stelle), '#ffd76a');
    suono('monete');
  }

  /* ================= aggiornamento ================= */
  function aggiornaClienti(dt) {
    for (const c of S.clienti.slice()) {
      c.alpha = Math.min(1, c.alpha + dt * 3);
      if (c.react) { c.react.t -= dt; if (c.react.t <= 0) c.react = null; }
      if (c.stato === 'arriva') {
        if (muovi(c, dt, c.vel)) {
          c.stato = 'attende'; c.dir = 1;
          if (c.posto.tipo === 'sala') c.y = FL - 10; else if (c.posto.tipo === 'fuori') c.y = 634; else c.y = FL + 6;
          tutorial('cliente');
        }
      } else if (c.stato === 'attende') {
        c.paz -= dt / c.pazDur;
        if (c.paz < .3 && c.espr !== 'triste') c.espr = 'triste';
        if (c.paz > .3 && !c.react && c.espr === 'triste') c.espr = 'ok';
        if (c.paz < .35 && S.ser.cani) tutorial('pazienza');
        if (c.paz <= 0) {
          S.persi++; S.combo = 1; S.rec.push(c.got.birra ? 2 : 1);
          c.react = { e: '😠', t: 3 }; fxTesto(c.x, c.y - 320, 'Se n’è andato…', '#ff9a8a'); suono('arrabbiato');
          vaVia(c, true);
        }
      } else if (c.stato === 'beve') {
        c.bevi -= dt;
        if (c.got.birra && c.got.birra.vis.tipo === 'pinta') c.got.birra.vis.livello = .15 + .85 * clamp(c.bevi / c.beviDur, 0, 1);
        c.espr = (c.bevi % 2.4) < .7 ? 'beve' : (c.match >= .6 ? 'felice' : 'ok');
        if (c.bevi <= 0) {
          paga(c);
          const tempoResta = S.ser.infinita || S.t < S.ser.dur - 25;
          if (tempoResta && c.giri < 1 && rnd() < .3 && !c.want.esperto) {
            c.giri++; c.want = richiesta('normale'); c.got = { birra: null, cibo: false }; c.paz = 1; c.stato = 'attende'; c.espr = 'felice'; c.bruciato = false;
            c.react = { e: '🍺', t: 1.6 };
          } else vaVia(c, false);
        }
      } else if (c.stato === 'esce') {
        if (muovi(c, dt, c.vel)) { S.clienti.splice(S.clienti.indexOf(c), 1); }
      }
      if (c.stato !== 'attende' && c.stato !== 'beve') c.y += (FL - c.y) * Math.min(1, dt * 10);
    }
  }
  function aggiornaCani(dt) {
    for (const k of S.cani) {
      k.t -= dt; k.cool = Math.max(0, k.cool - dt); k.alpha = Math.min(1, k.alpha + dt * 3);
      if (k.stato === 'va') {
        const c = k.target;
        if (!c || !S.clienti.includes(c) || c.stato !== 'attende') { k.stato = 'giro'; k.target = null; k.path = []; continue; }
        if (muovi(k, dt, 260)) { k.stato = 'coccole'; k.t = 2.4; k.dir = c.x > k.x ? 1 : -1; c.paz = Math.min(1, c.paz + .55); c.espr = 'ride'; c.react = { e: '🥰', t: 2.2 }; fxTesto(c.x, c.y - 330, '❤️ coccole!', '#ff9ac0'); suono('cuore'); if (k.tipo === 'blanche' || rnd() < .5) suono('bau'); }
      } else if (k.stato === 'coccole') {
        if (k.t <= 0) { k.stato = 'riposo'; k.cool = 16; k.t = 16; }
      } else if (k.stato === 'riposo') {
        if (k.t <= 0) { k.stato = 'giro'; k.t = 1; }
      } else {
        // a spasso per il locale
        if (k.path && k.path.length) { muovi(k, dt, 90); }
        else if (k.t <= 0) {
          const r = rnd();
          if (r < .5) { k.stato = 'giro'; k.siede = false; const zona = S.ser && S.ser.fuori && rnd() < .2 && !S.notte ? 'E' : 'I'; const x = zona === 'E' ? 330 + rnd() * 300 : 790 + rnd() * 980; k.path = percorso(k, { x, zona }); k.t = 4 + rnd() * 5; }
          else if (r < .75) { k.stato = 'giro'; k.siede = true; k.t = 3 + rnd() * 4; }
          else { k.stato = 'riposo'; k.t = 5 + rnd() * 6; }
        }
        if (k.t > 0 && !k.path.length) k.cammina = false;
      }
      k.y = FL + 24 + (k.tipo === 'malthus' ? 8 : 0);
    }
  }
  function aggiornaPiastra(dt) {
    S.piastra.forEach(p => { if (p) { const prima = p.t, cb = CIBI[p.cibo]; p.t += dt; if (prima < cb.cuoce && p.t >= cb.cuoce) { suono('ok'); fxTesto(CUCX + 40, 400, cb.e + ' pronto!', '#7dff9a'); } if (prima < cb.cuoce + cb.brucia && p.t >= cb.cuoce + cb.brucia) toast(cb.n + ' bruciato!'); } });
  }
  function aggiornaGioco(dt) {
    S.t += dt;
    const ser = S.ser;
    // arrivi
    const aperto = ser.infinita || S.t < ser.dur;
    if (aperto) {
      S.prossimo -= dt;
      if (S.prossimo <= 0) {
        let int = ser.int;
        if (ser.infinita) int = Math.max(3.6, ser.int - S.t / 60);
        const esperto = ser.esperto && rnd() < .16;
        if (nuovoCliente(esperto ? 'esperto' : (ser.nave && rnd() < .3 ? 'crociera' : 'normale'))) S.prossimo = int * (.55 + rnd() * .8);
        else S.prossimo = 1;
      }
      S.nave -= dt;
      if (S.nave <= 0) { S.nave = 55 + rnd() * 25; toast('🚢 È arrivata una nave in Darsena: arrivano i crocieristi!'); let k = 0; const f = () => { if (k++ < 3 && S.fase === 'gioco') { nuovoCliente('crociera'); setTimeout(f, 1300); } }; f(); }
    }
    aggiornaClienti(dt); aggiornaRoberto(dt); aggiornaCani(dt); aggiornaPiastra(dt); aggiornaSpillatura(dt);
    // fine serata
    if (ser.infinita) { if (S.persi >= 5) fineSerata(); }
    else if (S.t >= ser.dur) {
      if (S.chiusura === 0) { toast('Ultimo giro! La Tana sta chiudendo.'); S.chiusura = 1; }
      if (!S.clienti.length || S.t > ser.dur + 40) fineSerata();
    }
  }
  function aggiornaFx(dt) { for (const f of S.fx) { f.t -= dt; f.y -= dt * 40; } S.fx = S.fx.filter(f => f.t > 0); }
  function fxTesto(x, y, testo, col) { S.fx.push({ x, y, testo, col, t: 1.8 }); }

  /* ================= vista e disegno ================= */
  const cv = $('cv'), cx = cv.getContext('2d');
  const V = { dpr: 1, sc: .5, scena: { x: 0, y: 0, w: 100, h: 100 }, w: 100, h: 100, bg: null, r: 0 };
  function vista() { return { w: V.scena.w / V.sc, h: V.scena.h / V.sc }; }
  function layout() {
    const w = innerWidth, h = innerHeight;
    V.dpr = Math.min(devicePixelRatio || 1, 2.5);
    cv.width = Math.round(w * V.dpr); cv.height = Math.round(h * V.dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const verticale = h > w * 1.05;
    document.body.classList.toggle('vert', verticale); document.body.classList.toggle('oriz', !verticale);
    const inGioco = S.fase === 'gioco' || S.fase === 'pausa';
    document.body.classList.toggle('ingioco', inGioco);
    let sc = { x: 0, y: 0, w, h };
    if (inGioco) {
      const lr = $('lav').getBoundingClientRect();
      if (verticale) sc.h = lr.top; else sc.w = lr.left;
    }
    if (S.fase === 'titolo') sc.h = h - Math.round(Math.min(Math.max(h * .27, 170), 250));
    V.scena = sc;
    if (verticale) V.sc = Math.min(sc.h / 740, sc.w / 560);
    else V.sc = Math.min(Math.max(sc.h / 800, sc.w / W), sc.w / 560);
    if (S.fase === 'titolo') V.sc = verticale ? Math.min(sc.h / 640, sc.w / 620) : Math.max(Math.min(sc.h / 900, 1.2), sc.w / W);
    const r = Math.min(V.sc * V.dpr, 1.7);
    if (!V.bg || Math.abs(r - V.r) > .15) preparaSfondi(r);
  }
  function preparaSfondi(r) {
    V.r = r;
    const mk = (fn) => { const c = document.createElement('canvas'); c.width = Math.ceil(W * r); c.height = Math.ceil((Y1 - Y0) * r); const x = c.getContext('2d'); x.scale(r, r); x.translate(0, -Y0); fn(x); return c; };
    V.bg = { g: mk(x => T.sfondo(x)), gf: mk(x => T.fronte(x)), n: null, nf: null };
    V.bg.n = mk(x => { T.sfondo(x); T.notte(x); });
    V.bg.nf = mk(x => { T.fronte(x); T.notteFronte(x); });
  }
  function aW(x, y) { return [V.scena.x + (x - S.cam.x) * V.sc, V.scena.y + V.scena.h - (Y1 - y) * V.sc]; }
  function dalloSchermo(sx, sy) { return [S.cam.x + (sx - V.scena.x) / V.sc, Y1 - (V.scena.y + V.scena.h - sy) / V.sc]; }
  function luceDi(x) { if (x < CUT) T.luce(.55 * S.nv, [27, 32, 64]); else T.luce(.13 * S.nv, [60, 36, 18]); }

  function aggiornaCamera(dt) {
    const v = vista();
    let tx;
    if (S.fase === 'titolo') tx = 430 - v.w / 2;
    else if (S.cam.man > 0) { S.cam.man -= dt; tx = S.cam.tx; }
    else tx = R.x - v.w / 2;
    if (v.w >= W) tx = (W - v.w) / 2; else tx = clamp(tx, 0, W - v.w);
    if (S.cam.man > 0 && S.cam.drag) S.cam.x = tx;
    else S.cam.x += (tx - S.cam.x) * Math.min(1, dt * 4);
    S.cam.tx = clamp(S.cam.tx == null ? tx : S.cam.tx, -200, W);
  }

  function disegna() {
    const c = cx, d = V.dpr, sc = V.scena;
    c.setTransform(d, 0, 0, d, 0, 0);
    c.fillStyle = '#2a1a10'; c.fillRect(0, 0, innerWidth, innerHeight);
    c.save(); c.beginPath(); c.rect(sc.x, sc.y, sc.w, sc.h); c.clip();
    c.fillStyle = S.nv > .5 ? '#151a33' : '#6fa8de'; c.fillRect(sc.x, sc.y, sc.w, sc.h);
    // cielo sopra il mondo, se la vista è alta
    const top = aW(0, Y0)[1];
    if (top > sc.y) { c.fillStyle = S.nv > .5 ? '#151a33' : '#6fa8de'; c.fillRect(sc.x, sc.y, sc.w, top - sc.y); }
    const [ox, oy] = aW(0, Y0);
    c.translate(ox, oy); c.scale(V.sc, V.sc); c.translate(0, -Y0);
    const v = vista();
    const sx0 = clamp(S.cam.x, 0, W), sx1 = clamp(S.cam.x + v.w + 2, 0, W);
    const blit = (img) => { if (!img || sx1 <= sx0) return; c.drawImage(img, sx0 * V.r, 0, (sx1 - sx0) * V.r, img.height, sx0, Y0, sx1 - sx0, Y1 - Y0); };
    if (S.nv < 1) blit(V.bg.g);
    if (S.nv > 0) { c.globalAlpha = S.nv; blit(V.bg.n); c.globalAlpha = 1; }
    lavagnaMuro(c);
    piastraVis(c);
    // dietro al bancone
    if (R.zona === 'B') disegnaRoberto(c);
    const seduti = S.clienti.filter(k => (k.stato === 'attende' || k.stato === 'beve') && k.posto.tipo !== 'banco');
    seduti.forEach(k => disegnaCliente(k));
    if (S.nv < 1) blit(V.bg.gf);
    if (S.nv > 0) { c.globalAlpha = S.nv; blit(V.bg.nf); c.globalAlpha = 1; }
    etichetteSpine(c);
    const davanti = S.clienti.filter(k => !seduti.includes(k)).sort((a, b) => a.y - b.y);
    davanti.forEach(k => disegnaCliente(k));
    if (R.zona !== 'B') disegnaRoberto(c);
    S.cani.forEach(k => disegnaCane(k));
    if (S.fase === 'titolo') titoloScena(c);
    // scritte che salgono
    c.textAlign = 'center';
    for (const f of S.fx) {
      c.globalAlpha = clamp(f.t / .6, 0, 1); c.font = '800 ' + Math.round(15 / V.sc) + 'px system-ui,' + EMOJI;
      c.lineWidth = 4 / V.sc; c.strokeStyle = 'rgba(0,0,0,.65)'; c.strokeText(f.testo, f.x, f.y); c.fillStyle = f.col; c.fillText(f.testo, f.x, f.y);
    }
    c.globalAlpha = 1;
    c.restore();
    // ---- interfaccia sopra la scena, in pixel dello schermo ----
    c.save(); c.beginPath(); c.rect(sc.x, sc.y, sc.w, sc.h); c.clip();
    S.hit = [];
    if (S.fase === 'gioco' || S.fase === 'pausa') {
      S.clienti.forEach(k => { if (k.stato === 'attende') nuvoletta(c, k); else if (k.react) reazione(c, k); });
      S.clienti.forEach(k => { if (k.stato !== 'attende' && k.react) reazione(c, k); });
      fumettoRoberto(c);
      indicatoriBordo(c);
      if (S.selCane) { const [x, y] = aW(S.selCane.x, S.selCane.y - 60); c.strokeStyle = '#ffe28a'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y + 60 * V.sc, 70 * V.sc, 18 * V.sc, 0, 0, Math.PI * 2); c.stroke(); }
      S.cani.forEach(k => { if (k.stato === 'riposo' && k.cool > 0) { const [x, y] = aW(k.x, k.y - 80); c.font = '700 14px system-ui'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('z z', x + 20 + Math.sin(S.tt * 2) * 3, y - (S.tt * 10 % 12)); } });
    }
    c.restore();
  }
  function lavagnaMuro(c) {
    // la lavagna fuori dalla porta: «Alla spina oggi», con le spine della serata
    luceDi(0);
    c.save(); c.fillStyle = T.K('#efe9dc'); c.textAlign = 'left';
    c.font = '700 10px "Chalkboard SE","Comic Sans MS",cursive';
    c.fillText('ALLA SPINA', 632, 362); c.fillText('OGGI', 632, 374);
    const sp = S.spine.length ? S.spine : SERATE[0].spine.map(stile => ({ stile }));
    c.font = '700 8.5px "Chalkboard SE","Comic Sans MS",cursive';
    sp.forEach((s, i) => { c.fillStyle = T.K('#efe9dc'); c.fillText('- ' + STILE[s.stile].n.toUpperCase().slice(0, 13), 630, 394 + i * 14); });
    c.fillStyle = T.K('#f2a65a'); c.fillText('DA MANGIARE', 632, 456);
    c.fillStyle = T.K('#efe9dc'); c.fillText('PULLED PORK', 632, 468);
    c.restore();
  }
  function etichetteSpine(c) {
    luceDi(1000);
    S.spine.forEach((s, i) => {
      const st = STILE[s.stile], x = TAPX[i];
      c.fillStyle = T.K(st.hex); T.rr(c, x - 9, 312, 18, 20, 4); c.fill();
      c.strokeStyle = T.K('#1b1b1b'); c.lineWidth = 2; c.stroke();
      if (s.fusto === 0) { c.fillStyle = '#d9534f'; c.font = '700 16px ' + EMOJI; c.textAlign = 'center'; c.fillText('✖', x, 304); }
    });
  }
  function piastraVis(c) {
    luceDi(1300);
    S.piastra.forEach((p, i) => {
      if (!p) return; const cb = CIBI[p.cibo], x = 1322 + i * 34, y = 432;
      const fatto = clamp(p.t / cb.cuoce, 0, 1), bru = p.t > cb.cuoce + cb.brucia;
      c.fillStyle = bru ? '#2b1d14' : T.K(['#f0dca8', '#e0b060', '#c8853a'][Math.min(2, (fatto * 2.5) | 0)]);
      T.rr(c, x - 14, y - 9, 28, 10, 4); c.fill();
      if (p.t > .3 && S.tt % .6 < .3) { c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x - 6 + Math.sin(S.tt * 5) * 4, y - 30, 3, 12); }
      if (bru) { c.fillStyle = 'rgba(60,60,60,.6)'; c.beginPath(); c.arc(x, y - 30 - (S.tt * 20 % 20), 8, 0, 7); c.fill(); }
    });
  }
  function disegnaRoberto(c) {
    luceDi(R.x);
    c.globalAlpha = R.alpha;
    const occhiali = R.zona === 'E' && S.nv < .5;
    let espr = 'felice';
    if (S.fase === 'titolo') espr = 'ride';
    T.roberto(c, R.x, R.y, { fase: R.fase, cammina: R.cammina, espr, occhiali, mani: R.mani.map(m => m.tipo === 'cibo' ? m : { tipo: 'birra', vis: m.vis }), saluta: S.fase === 'titolo' && (S.tt % 4) < 1.2 });
    c.globalAlpha = 1;
  }
  function disegnaCliente(k) {
    luceDi(k.x);
    cx.globalAlpha = k.alpha;
    const seduto = k.posto.tipo === 'sala' && (k.stato === 'attende' || k.stato === 'beve');
    const beve = k.stato === 'beve' && k.espr === 'beve';
    const bic = k.stato === 'beve' && k.got.birra ? k.got.birra.vis : null;
    T.persona(cx, k.L, k.x, k.y, { fase: k.fase, cammina: k.cammina, seduto, espr: k.espr, beve, bicchiere: bic });
    if (k.stato === 'beve' && k.got.cibo && !beve) T.piatto(cx, k.x - 46, k.y - (seduto ? 0 : 95) - (seduto ? 50 : 0), { cibo: k.want.cibo, bruciato: k.bruciato });
    cx.globalAlpha = 1;
  }
  function disegnaCane(k) {
    luceDi(k.x);
    cx.globalAlpha = k.alpha;
    const sdr = k.stato === 'riposo' || (S.fase === 'titolo' && k.tipo === 'malthus');
    T.cane(cx, k.tipo, k.x, k.y, { dir: k.dir, fase: k.fase, cammina: k.cammina, t: S.tt + (k.tipo === 'malthus' ? 1 : 0), posa: sdr ? 'sdraiato' : k.siede && !k.cammina ? 'seduto' : null, lingua: k.stato === 'coccole' || k.tipo === 'blanche', scodinzola: k.stato === 'coccole' || k.stato === 'va' || S.selCane === k, dorme: k.stato === 'riposo' });
    cx.globalAlpha = 1;
  }
  function titoloScena(c) { }

  /* ---- nuvolette ---- */
  function voci(k) {
    const v = [];
    if (!k.got.birra) {
      if (k.want.esperto) v.push({ testo: 'Hai una ' + STILE[k.want.stile].n + '?' });
      else { v.push({ col: k.want.col }); k.want.tags.forEach(t => v.push({ e: TAG[t].e })); }
    }
    if (k.want.cibo && !k.got.cibo) v.push({ e: CIBI[k.want.cibo].e });
    return v;
  }
  function nuvoletta(c, k) {
    const seduto = k.posto.tipo === 'sala';
    const [hx, hy] = aW(k.x, k.y - (seduto ? 230 : 296));
    const v = voci(k);
    const testo = v.find(x => x.testo);
    const cella = 30;
    let w = 40, h = 8 + v.length * cella;
    c.font = '700 13px system-ui';
    if (testo) { w = Math.max(40, c.measureText(testo.testo).width + 16); h = 8 + cella + (v.length - 1) * cella; }
    const x = clamp(hx - w / 2, V.scena.x + 2, V.scena.x + V.scena.w - w - 2), y = Math.max(V.scena.y + 46, hy - h - 14);
    const pulsa = k.paz < .3 ? 1 + Math.sin(S.tt * 12) * .04 : 1;
    c.save(); c.translate(x + w / 2, y + h / 2); c.scale(pulsa, pulsa); c.translate(-(x + w / 2), -(y + h / 2));
    c.fillStyle = k.want.esperto ? '#fff4d6' : '#fffdf7'; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.5;
    T.rr(c, x, y, w, h, 10); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(hx - 6, y + h - .5); c.lineTo(hx, y + h + 8); c.lineTo(hx + 6, y + h - .5); c.fill();
    let yy = y + 4;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const it of v) {
      if (it.testo) { c.fillStyle = '#3a2a1a'; c.font = '700 13px system-ui'; c.fillText(it.testo, x + w / 2, yy + cella / 2); }
      else if (it.col) {
        const col = COLORI[it.col].hex, gx = x + w / 2, gy = yy + cella / 2;
        c.beginPath(); c.moveTo(gx - 8, gy - 11); c.lineTo(gx + 8, gy - 11); c.lineTo(gx + 6, gy + 11); c.lineTo(gx - 6, gy + 11); c.closePath();
        c.fillStyle = col; c.fill(); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.2; c.stroke();
        c.fillStyle = '#fff8ea'; c.fillRect(gx - 8, gy - 11, 16, 4);
      } else { c.font = '20px ' + EMOJI; c.fillStyle = '#000'; c.fillText(it.e, x + w / 2, yy + cella / 2 + 1); }
      yy += cella;
    }
    // pazienza
    const pc = k.paz > .55 ? '#3fbf6f' : k.paz > .3 ? '#f0ad4e' : '#e74c3c';
    c.fillStyle = 'rgba(0,0,0,.25)'; T.rr(c, x + 4, y + h - 6, w - 8, 4, 2); c.fill();
    c.fillStyle = pc; T.rr(c, x + 4, y + h - 6, (w - 8) * clamp(k.paz, 0, 1), 4, 2); c.fill();
    c.restore();
    c.textBaseline = 'alphabetic';
    // area toccabile: nuvoletta + persona
    const [bx, by] = aW(k.x - 48, k.y - (seduto ? 230 : 296));
    S.hit.push({ x: Math.min(x, bx), y, w: Math.max(w, 96 * V.sc), h: Math.max(h + 16, aW(0, k.y)[1] - y), k });
    if (k.react) reazione(c, k, x + w + 2, y);
  }
  function reazione(c, k, px, py) {
    if (!k.react) return;
    const seduto = k.posto.tipo === 'sala' && k.stato !== 'esce' && k.stato !== 'arriva';
    const [hx, hy] = aW(k.x + 36, k.y - (seduto ? 250 : 316));
    c.font = '24px ' + EMOJI; c.textAlign = 'center'; c.globalAlpha = clamp(k.react.t / .4, 0, 1);
    c.fillText(k.react.e, px != null ? px + 12 : hx, py != null ? py + 20 : hy - (2.4 - k.react.t) * 8);
    c.globalAlpha = 1;
  }
  function fumettoRoberto(c) {
    const [hx, hy] = aW(R.x, R.y - 296);
    if (R.parla) {
      const p = R.parla, maxw = Math.min(250, V.scena.w - 20);
      c.font = '600 13px system-ui';
      const righe = aCapo(c, p.testo, maxw - 20);
      c.font = '800 13px system-ui';
      const w = Math.min(maxw, Math.max(c.measureText(p.titolo).width + 20, ...righe.map(r => { c.font = '600 13px system-ui'; return c.measureText(r).width + 20; })));
      const h = 26 + righe.length * 17;
      const x = clamp(hx - w / 2, V.scena.x + 4, V.scena.x + V.scena.w - w - 4), y = Math.max(V.scena.y + 46, hy - h - 16);
      c.globalAlpha = clamp(p.t / .3, 0, 1);
      c.fillStyle = 'rgba(35,25,18,.93)'; T.rr(c, x, y, w, h, 10); c.fill();
      c.beginPath(); c.moveTo(clamp(hx, x + 12, x + w - 12) - 7, y + h); c.lineTo(clamp(hx, x + 12, x + w - 12), y + h + 9); c.lineTo(clamp(hx, x + 12, x + w - 12) + 7, y + h); c.fill();
      c.textAlign = 'left'; c.fillStyle = '#ffd27a'; c.font = '800 13px system-ui'; c.fillText(p.titolo, x + 10, y + 18);
      c.fillStyle = '#fff'; c.font = '600 13px system-ui'; righe.forEach((r, i) => c.fillText(r, x + 10, y + 36 + i * 17));
      c.globalAlpha = 1;
    } else if (R.az || R.coda.length) {
      const az = [R.az, ...R.coda].filter(Boolean);
      const w = az.length * 26 + 8, x = hx - w / 2, y = Math.max(V.scena.y + 46, hy - 36);
      c.fillStyle = 'rgba(255,255,255,.85)'; T.rr(c, x, y, w, 28, 14); c.fill();
      c.font = '17px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle';
      az.forEach((a, i) => { c.globalAlpha = i ? .55 : 1; c.fillText(ICONA_AZ[a.t], x + 17 + i * 26, y + 15); });
      c.globalAlpha = 1; c.textBaseline = 'alphabetic';
    }
  }
  function aCapo(c, t, maxw) { const p = t.split(' '), out = []; let r = ''; for (const w of p) { const n = r ? r + ' ' + w : w; if (c.measureText(n).width > maxw && r) { out.push(r); r = w; } else r = n; } if (r) out.push(r); return out; }
  function indicatoriBordo(c) {
    const v = vista();
    for (const k of S.clienti) {
      if (k.stato !== 'attende') continue;
      const fuoriSx = k.x < S.cam.x + 30, fuoriDx = k.x > S.cam.x + v.w - 30;
      if (!fuoriSx && !fuoriDx) continue;
      const x = fuoriSx ? V.scena.x + 22 : V.scena.x + V.scena.w - 22, y = V.scena.y + V.scena.h * .45 + (k.id % 3) * 46;
      const pc = k.paz > .55 ? '#3fbf6f' : k.paz > .3 ? '#f0ad4e' : '#e74c3c';
      c.fillStyle = 'rgba(255,253,247,.95)'; c.beginPath(); c.arc(x, y, 19, 0, 7); c.fill();
      c.strokeStyle = pc; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 19, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k.paz); c.stroke();
      c.fillStyle = '#3a2a1a'; c.beginPath(); if (fuoriSx) { c.moveTo(x - 26, y); c.lineTo(x - 19, y - 6); c.lineTo(x - 19, y + 6); } else { c.moveTo(x + 26, y); c.lineTo(x + 19, y - 6); c.lineTo(x + 19, y + 6); } c.fill();
      c.font = '17px ' + EMOJI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(k.posto.tipo === 'fuori' ? '🌳' : '🍺', x, y + 1); c.textBaseline = 'alphabetic';
      S.hit.push({ x: x - 24, y: y - 24, w: 48, h: 48, bordo: k });
    }
  }

  /* ================= input ================= */
  let tocco = null;
  cv.addEventListener('pointerdown', e => { audioInit(); tocco = { x: e.clientX, y: e.clientY, cx: S.cam.x, mosso: false }; });
  cv.addEventListener('pointermove', e => {
    if (!tocco) return;
    const dx = e.clientX - tocco.x;
    if (Math.abs(dx) > 10 || tocco.mosso) {
      tocco.mosso = true;
      if (S.fase === 'gioco') { S.cam.man = 3; S.cam.drag = true; S.cam.tx = tocco.cx - dx / V.sc; }
    }
  });
  addEventListener('pointerup', e => {
    if (!tocco) return; const t = tocco; tocco = null; S.cam.drag = false;
    if (t.mosso || e.target !== cv) return;
    toccaScena(e.clientX, e.clientY);
  });
  function toccaScena(sx, sy) {
    if (S.fase !== 'gioco') return;
    for (const h of S.hit) if (sx >= h.x && sx <= h.x + h.w && sy >= h.y && sy <= h.y + h.h) {
      if (h.bordo) { S.cam.man = 3; S.cam.tx = h.bordo.x - vista().w / 2; return; }
      if (h.k) { toccaCliente(h.k); return; }
    }
    const [wx, wy] = dalloSchermo(sx, sy);
    // cani
    for (const k of S.cani) if (Math.abs(wx - k.x) < 75 && wy > k.y - 140 && wy < k.y + 15) { toccaCane(k); return; }
    // clienti (anche senza nuvoletta)
    for (const k of S.clienti) if (k.stato === 'attende' && Math.abs(wx - k.x) < 50 && wy > k.y - 300 && wy < k.y + 10) { toccaCliente(k); return; }
    if (S.selCane) { S.selCane = null; toast('Va bene, niente coccole'); }
  }
  function toccaCliente(k) {
    if (S.selCane) {
      const cane = S.selCane; S.selCane = null;
      cane.stato = 'va'; cane.target = k; cane.siede = false;
      const x = k.x + (k.posto.tipo === 'fuori' ? 90 : -80);
      cane.path = percorso(cane, { x: clamp(x, 330, W - 40), zona: k.posto.tipo === 'fuori' ? 'E' : 'I' });
      suono('bau'); return;
    }
    if (!R.mani.length && !R.coda.some(a => ['spina', 'frigo', 'ritira', 'cucina'].includes(a.t)) && !(R.az && ['spina', 'frigo', 'ritira', 'cucina'].includes(R.az.t))) {
      toast('Prima scegli dalla lavagna cosa dargli'); suono('no'); tutorial('cliente', true); return;
    }
    accoda({ t: 'servi', c: k });
  }
  function toccaCane(k) {
    if (k.cool > 0 || k.stato === 'va' || k.stato === 'coccole') { toast((k.tipo === 'blanche' ? 'Blanche' : 'Malthus') + ' si sta riposando 💤'); suono('no'); return; }
    S.selCane = k; suono('bau');
    toast('Ora tocca un cliente che aspetta: ' + (k.tipo === 'blanche' ? 'Blanche' : 'Malthus') + ' va a farsi coccolare');
  }
  addEventListener('keydown', e => {
    if (e.code === 'Space' && S.spill) { e.preventDefault(); if (!S.spill.premuto) { audioInit(); S.spill.premuto = true; } }
    if (e.code === 'Escape' && S.fase === 'gioco') pausa();
  });
  addEventListener('keyup', e => { if (e.code === 'Space' && S.spill && S.spill.premuto) chiudiSpillatura(); });
  const bsp = $('spBott');
  bsp.addEventListener('pointerdown', e => { e.preventDefault(); audioInit(); if (S.spill) S.spill.premuto = true; });
  const rilascia = () => { if (S.spill && S.spill.premuto) chiudiSpillatura(); };
  bsp.addEventListener('pointerup', rilascia); bsp.addEventListener('pointerleave', rilascia); bsp.addEventListener('pointercancel', rilascia);

  /* ================= lavagna (pannello) ================= */
  function carta(html, cls, fn) { const b = document.createElement('button'); b.className = 'carta ' + (cls || ''); b.innerHTML = html; b.addEventListener('click', () => { audioInit(); fn(); }); return b; }
  function tagsHtml(s) { return '<i class="col" style="--c:' + COLORI[s.cat].hex + '"></i>' + s.tags.map(t => TAG[t].e).join(''); }
  function costruisciLavagna() {
    const gs = $('gSpina'), gf = $('gFrigo'), gc = $('gCucina');
    gs.innerHTML = ''; gf.innerHTML = ''; gc.innerHTML = '';
    S.spine.forEach((sp, i) => {
      const s = STILE[sp.stile];
      const b = carta('<b>' + s.n + '</b><em>' + tagsHtml(s) + '</em><u class="fusto"><s></s></u>', 'birra', () => {
        if (sp.fusto === 0) accoda({ t: 'fusto', i }); else accoda({ t: 'spina', i });
      });
      b.style.setProperty('--b', s.hex); b.dataset.k = 'spina' + i; gs.appendChild(b);
    });
    S.frigo.forEach((f, i) => {
      const s = STILE[f.stile];
      const b = carta('<b>' + s.n + '</b><em>' + tagsHtml(s) + '</em><small>' + (f.tipo === 'bottiglia' ? 'bottiglia' : 'lattina') + '</small>', 'birra ' + f.tipo, () => accoda({ t: 'frigo', i }));
      b.style.setProperty('--b', s.hex); gf.appendChild(b);
    });
    S.cibi.forEach(id => {
      const cb = CIBI[id];
      const b = carta('<i class="em">' + cb.e + '</i><b>' + (cb.corto || cb.n) + '</b><small class="st"></small><u class="prog"><s></s></u>', 'cibo', () => {
        if (cb.cuoce) {
          const i = S.piastra.findIndex(p => p && p.cibo === id && p.t >= cb.cuoce && !R.coda.some(a => a.t === 'ritira' && a.slot === S.piastra.indexOf(p)));
          if (i >= 0) accoda({ t: 'ritira', slot: i }); else accoda({ t: 'cucina', cibo: id });
        } else accoda({ t: 'cucina', cibo: id });
      });
      b.dataset.k = 'cibo-' + id; gc.appendChild(b);
    });
    document.body.classList.toggle('conFrigo', S.frigo.length > 0);
    document.body.classList.toggle('conCibo', S.cibi.length > 0);
    $('sFrigo').style.display = S.frigo.length ? '' : 'none';
    $('sCucina').style.display = S.cibi.length ? '' : 'none';
    layout();
    aggiornaLavagna();
  }
  let ultimaLav = '';
  function aggiornaLavagna() {
    const key = JSON.stringify([S.spine.map(s => s.fusto), S.piastra.map(p => p && [p.cibo, Math.floor(p.t * 4)]), S.pulled, R.mani.map(m => m.stile || m.cibo + m.bruciato)]);
    if (key === ultimaLav) return; ultimaLav = key;
    S.spine.forEach((sp, i) => {
      const b = document.querySelector('[data-k="spina' + i + '"]'); if (!b) return;
      const u = b.querySelector('.fusto');
      if (sp.fusto === undefined) u.style.display = 'none';
      else { u.style.display = ''; u.firstChild.style.width = (sp.fusto / S.ser.fusti * 100) + '%'; }
      b.classList.toggle('vuoto', sp.fusto === 0);
      b.querySelector('b').textContent = sp.fusto === 0 ? '🛢️ Cambia fusto' : STILE[sp.stile].n;
    });
    S.cibi.forEach(id => {
      const b = document.querySelector('[data-k="cibo-' + id + '"]'); if (!b) return;
      const cb = CIBI[id], st = b.querySelector('.st'), pr = b.querySelector('.prog');
      let testo = '', perc = -1, cls = '';
      if (cb.cuoce) {
        const ps = S.piastra.filter(p => p && p.cibo === id);
        const pronto = ps.find(p => p.t >= cb.cuoce && p.t <= cb.cuoce + cb.brucia), bru = ps.find(p => p.t > cb.cuoce + cb.brucia), cuoce = ps.find(p => p.t < cb.cuoce);
        if (bru) { testo = 'Bruciato! tocca'; cls = 'bru'; }
        else if (pronto) { testo = 'Pronto! tocca'; cls = 'pronto'; perc = 100 - (pronto.t - cb.cuoce) / cb.brucia * 100; }
        else if (cuoce) { testo = 'Sulla piastra…'; perc = cuoce.t / cb.cuoce * 100; cls = 'cuoce'; }
        else testo = 'Piastra ' + cb.cuoce + ' s';
      } else if (id === 'pulled') { testo = S.pulled > 0 ? 'Ne restano ' + S.pulled : 'Finito!'; cls = S.pulled > 0 ? '' : 'finito'; }
      else testo = 'Pronta';
      st.textContent = testo; b.className = 'carta cibo ' + cls;
      pr.style.display = perc >= 0 ? '' : 'none'; if (perc >= 0) pr.firstChild.style.width = perc + '%';
    });
    // mani di Roberto
    [0, 1].forEach(i => {
      const m = R.mani[i], el = $('m' + i);
      if (!m) { el.innerHTML = '<span>—</span>'; el.classList.remove('pieno'); el.title = ''; return; }
      el.classList.add('pieno');
      if (m.tipo === 'cibo') el.innerHTML = '<span>' + (m.bruciato ? '🤢' : CIBI[m.cibo].e) + '</span><b>' + (CIBI[m.cibo].corto || CIBI[m.cibo].n) + '</b>';
      else { const s = STILE[m.stile]; el.innerHTML = '<i class="col" style="--c:' + s.hex + '"></i><b>' + s.n + '</b>'; }
    });
  }
  [0, 1].forEach(i => $('m' + i).addEventListener('click', () => {
    const m = R.mani[i]; if (!m || S.fase !== 'gioco') return;
    R.mani.splice(i, 1); toast('Posato sul bancone'); suono('tocco'); aggiornaLavagna();
  }));

  /* ================= HUD ================= */
  let hudKey = '';
  function aggiornaHud(forza) {
    if (!S.ser) return;
    const media = S.rec.length ? S.rec.reduce((a, b) => a + b, 0) / S.rec.length : 0;
    const prog = S.ser.infinita ? (5 - S.persi) / 5 : clamp(1 - S.t / S.ser.dur, 0, 1);
    const key = [S.punti, media.toFixed(1), Math.round(prog * 100), S.combo].join();
    if (key === hudKey && !forza) return; hudKey = key;
    $('hPunti').textContent = S.punti;
    $('hStelle').textContent = S.rec.length ? '★ ' + media.toFixed(1) : '★ –';
    $('hCombo').textContent = S.combo > 1 ? '×' + S.combo : '';
    $('hTempo').firstChild.style.width = (prog * 100) + '%';
    $('hTempo').classList.toggle('vite', !!S.ser.infinita);
    $('hNome').textContent = S.ser.n;
    // stelle della serata
    if (S.soglie) { const n = S.soglie.filter(s => S.punti >= s).length; $('hObiettivo').textContent = '☆☆☆'.split('').map((x, i) => i < n ? '★' : '☆').join(''); }
    else $('hObiettivo').textContent = '❤️'.repeat(Math.max(0, 5 - S.persi));
  }
  let toastT = 0;
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('su'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('su'), 2600); }

  /* ================= tutorial ================= */
  const AIUTI = {
    inizio: 'Arrivano i clienti dalla Darsena. Guarda cosa chiedono nella nuvoletta: colore della birra e gusti.',
    cliente: 'Tocca sulla lavagna una birra con gli stessi simboli (colore del bicchiere, 🌿 💧 ☕…). Poi tocca il cliente per servirlo.',
    spilla: 'Tieni premuto il pulsante e lascia quando la schiuma arriva nella fascia verde.',
    servi: 'Ora tocca il cliente: Roberto gli porta la birra e gliela spiega.',
    spiega: 'Roberto racconta ogni birra al cliente: ogni stile nuovo finisce nel tuo album!',
    cani: 'Blanche e Malthus sono di casa: se un cliente perde la pazienza, tocca un cane e poi il cliente. Una coccola e torna il sorriso!',
    pazienza: 'Questo cliente si spazientisce: manda Blanche o Malthus! Tocca il cane, poi il cliente.',
    scelta: 'Le spine le hai scelte tu: chi chiede una birra che non hai, si accontenta di una simile.',
    cibo: 'Panini e piadine vanno sulla piastra: tocca la carta per metterli a cuocere, ritoccala quando sono pronti. Non farli bruciare!',
    pulled: 'Il pulled pork di Roberto è la specialità: è già cotto, va solo sfilacciato. Ma le porzioni sono contate!',
    fusti: 'Con le navi in porto i fusti finiscono: quando una spina è vuota, tocca «Cambia fusto».',
    esperto: 'Il signore col cappello è un esperto: vuole proprio quello stile. Cercalo per nome sulla lavagna!'
  };
  function tutorial(id, forza) {
    if (!S.ser) return;
    if (id === 'inizio') { const t = S.ser.tut; if (t && t !== 'base' && !SAVE.visti[t]) { SAVE.visti[t] = 1; salva(); aiuto(AIUTI[t], 9); } if (t === 'base' && !SAVE.visti.inizio) aiuto(AIUTI.inizio, 6); return; }
    if (!AIUTI[id]) return;
    if (!forza && SAVE.visti[id]) return;
    if (['cliente', 'spilla', 'servi', 'spiega'].includes(id) && S.idx > 0 && !forza) return;
    if (id === 'pazienza' && !SAVE.visti.cani) return;
    SAVE.visti[id] = 1; salva(); aiuto(AIUTI[id], 7);
  }
  let aiutoT = 0;
  function aiuto(t, sec) { const el = $('aiuto'); el.innerHTML = '<span>💡</span>' + t; el.classList.add('su'); clearTimeout(aiutoT); aiutoT = setTimeout(() => el.classList.remove('su'), sec * 1000); }
  $('aiuto').addEventListener('click', () => $('aiuto').classList.remove('su'));

  /* ================= schermate ================= */
  const MAPPA = 'https://www.google.com/maps/search/?api=1&query=La+Tana+del+Luppolo+Via+del+Molo+12r+Savona';
  const PIEDE = '<div class="piede"><b>La Tana del Luppolo</b> · craft beer &amp; food<br>Via del Molo 12r, Savona · in Darsena<br><a href="' + MAPPA + '" target="_blank" rel="noopener">📍 Vieni ad assaggiarle davvero</a></div>';
  function schermo(html, cls) { setTimeout(layout, 0); $('aiuto').classList.remove('su'); $('toast').classList.remove('su'); const el = $('schermo'); el.className = 'su ' + (cls || ''); el.innerHTML = '<div class="box">' + html + '</div>'; el.scrollTop = 0; return el; }
  function nascondiSchermo() { $('schermo').className = ''; }
  function stelleHtml(n) { return '<span class="stelline">' + [0, 1, 2].map(i => i < n ? '★' : '☆').join('') + '</span>'; }
  function sbloccata(i) { return i === 0 || (SAVE.stelle[i - 1] || 0) > 0; }

  function titolo() {
    S.fase = 'titolo'; S.ser = null; S.spine = []; S.clienti = []; S.fx = [];
    POSTI.forEach(p => { p.occ = null; p.attivo = p.tipo === 'fuori'; });
    Object.assign(R, { x: 372, y: FL, zona: 'E', coda: [], az: null, mani: [], parla: null, dir: 1, cammina: false });
    S.cani = [Object.assign(nuovoCane('blanche', 560), { zona: 'E', dir: -1 }), Object.assign(nuovoCane('malthus', 650), { zona: 'E', dir: -1, stato: 'titolo' })];
    S.cani.forEach(k => k.stato = 'titolo');
    layout();
    const el = schermo(
      '<div class="logo"><small>LA TANA DEL</small><strong>LUPPOLO</strong><span>GAME</span></div>' +
      '<div class="motto">Dietro al bancone con Roberto, in Darsena a Savona</div>' +
      '<div class="pulsanti"><button id="bGioca" class="grande">▶ Gioca</button>' +
      '<button id="bAlbum">📖 Album delle birre <em>' + Object.keys(SAVE.album).length + '/' + STILI.length + '</em></button>' +
      '<button id="bNotte2">' + (S.notte ? '☀️ Giorno' : '🌙 Notte') + '</button></div>' + PIEDE, 'titolo');
    el.querySelector('#bGioca').onclick = () => { audioInit(); suono('ok'); serate(); };
    el.querySelector('#bAlbum').onclick = () => { audioInit(); album(); };
    el.querySelector('#bNotte2').onclick = () => { audioInit(); setNotte(!S.notte); };
  }
  function serate() {
    S.fase = 'menu';
    let h = '<h2>Le serate</h2><div class="serate">';
    SERATE.forEach((s, i) => {
      const ok = sbloccata(i), st = SAVE.stelle[i] || 0;
      h += '<button class="serata' + (ok ? '' : ' chiusa') + '" data-i="' + i + '"><em>' + (s.notte ? '🌙' : '☀️') + ' Serata ' + (i + 1) + '</em><b>' + s.n + '</b><small>' + s.s + '</small>' + (ok ? stelleHtml(st) : '<span class="lucchetto">🔒</span>') + '</button>';
    });
    const okInf = (SAVE.stelle[SERATE.length - 1] || 0) > 0;
    h += '<button class="serata infinita' + (okInf ? '' : ' chiusa') + '" data-i="' + SERATE.length + '"><em>🌙 Sfida</em><b>' + INFINITA.n + '</b><small>' + INFINITA.s + '</small>' + (okInf ? '<span class="rec">Record: ' + (SAVE.record || 0) + '</span>' : '<span class="lucchetto">🔒 dopo la serata 8</span>') + '</button>';
    h += '</div><div class="pulsanti"><button id="bIndietro">← Indietro</button></div>';
    const el = schermo(h, 'menu');
    el.querySelectorAll('.serata').forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      if (b.classList.contains('chiusa')) { suono('no'); return; }
      suono('ok');
      const ser = i >= SERATE.length ? INFINITA : SERATE[i];
      if (ser.scelta) selezione(i); else avvia(i);
    });
    el.querySelector('#bIndietro').onclick = titolo;
  }
  function selezione(i) {
    const ser = i >= SERATE.length ? INFINITA : SERATE[i];
    S.fase = 'menu';
    // arrivano 8 fusti: metà vicini alle previsioni, metà a caso
    const p = (ser.prev && ser.prev.p) || {};
    const pool = STILI.slice(), fusti = [];
    while (fusti.length < 8) { const s = fusti.length < 4 && Object.keys(p).length ? scegliPesato(pool, x => pesoStile(x, p)) : pick(pool); pool.splice(pool.indexOf(s), 1); fusti.push(s); }
    fusti.sort((a, b) => ['chiara', 'ambrata', 'scura'].indexOf(a.cat) - ['chiara', 'ambrata', 'scura'].indexOf(b.cat));
    const scelti = new Set();
    let h = '<h2>La selezione di Roberto</h2><p class="prev"><b>Stasera:</b> ' + ser.prev.t + '</p>';
    h += '<p class="istr">Sono arrivati 8 fusti. Scegli le <b>4 birre da mettere alla spina</b>: le altre restano in magazzino.</p><div class="fusti">';
    fusti.forEach(s => { h += '<button class="fustoc" data-id="' + s.id + '" style="--b:' + s.hex + '"><i class="bic"></i><b>' + s.n + '</b><em>' + tagsHtml(s) + '</em><small>' + COLORI[s.cat].n + ' · ' + s.tags.map(t => TAG[t].n).join(', ') + ' · ' + s.abv + '</small></button>'; });
    h += '</div><div class="pulsanti"><button id="bAuto">🎲 Scegli tu, Roberto</button><button id="bApri" class="grande" disabled>Apri la Tana (0/4)</button><button id="bIndietro">← Indietro</button></div>';
    const el = schermo(h, 'sel');
    const agg = () => { el.querySelectorAll('.fustoc').forEach(b => b.classList.toggle('si', scelti.has(b.dataset.id))); const bA = el.querySelector('#bApri'); bA.disabled = scelti.size !== 4; bA.textContent = 'Apri la Tana (' + scelti.size + '/4)'; };
    el.querySelectorAll('.fustoc').forEach(b => b.onclick = () => { const id = b.dataset.id; if (scelti.has(id)) scelti.delete(id); else if (scelti.size < 4) scelti.add(id); else { suono('no'); return; } suono('tocco'); agg(); });
    el.querySelector('#bAuto').onclick = () => { scelti.clear(); fusti.slice().sort((a, b) => pesoStile(b, p) - pesoStile(a, p) + (rnd() - .5) * 2).forEach(s => { if (scelti.size < 4 && ![...scelti].some(x => STILE[x].cat === s.cat && STILE[x].tags.join() === s.tags.join())) scelti.add(s.id); }); suono('ok'); agg(); };
    el.querySelector('#bApri').onclick = () => { suono('ok'); avvia(i, [...scelti]); };
    el.querySelector('#bIndietro').onclick = serate;
  }
  function fineSerata() {
    if (S.fase !== 'gioco') return;
    S.fase = 'fine'; spinaSuono(false); S.spill = null; $('spilla').classList.remove('su');
    const media = S.rec.length ? S.rec.reduce((a, b) => a + b, 0) / S.rec.length : 0;
    const inf = !!S.ser.infinita;
    let stelle = 0, nuovoRec = false;
    if (inf) { if (S.punti > (SAVE.record || 0)) { SAVE.record = S.punti; nuovoRec = true; } }
    else {
      stelle = S.soglie.filter(s => S.punti >= s).length;
      if (stelle > (SAVE.stelle[S.idx] || 0)) SAVE.stelle[S.idx] = stelle;
      if (S.punti > (SAVE.punti[S.idx] || 0)) SAVE.punti[S.idx] = S.punti;
    }
    salva(); suono('fine');
    const top = Object.entries(S.migliori).sort((a, b) => b[1] - a[1])[0];
    const frase = stelle === 3 ? 'Che serata! Il locale era pieno e tutti sono usciti contenti.' : stelle === 2 ? 'Bella serata! Qualche cliente lo puoi accontentare meglio.' : stelle === 1 ? 'Ce l’abbiamo fatta! Leggi bene le nuvolette: colore e gusti.' : inf ? 'Notte lunga! Chi riesce a fare di più?' : 'Serata dura… Riproviamo: guarda i simboli e usa i cani!';
    let h = '<h2>' + (inf ? 'La Tana chiude' : 'Serata finita!') + '</h2>';
    if (!inf) h += '<div class="grandi-stelle">' + [0, 1, 2].map(i => '<span class="' + (i < stelle ? 'on' : '') + '">★</span>').join('') + '</div>';
    h += '<div class="punti">' + S.punti + ' <small>punti</small>' + (nuovoRec ? '<em>Nuovo record!</em>' : '') + '</div>';
    h += '<p class="rob"><b>Roberto:</b> «' + frase + '»</p>';
    h += '<div class="stat"><span>👥 Serviti <b>' + S.serviti + '</b></span><span>😍 Birre perfette <b>' + S.perfette + '</b></span><span>★ Recensioni <b>' + (S.rec.length ? media.toFixed(1) : '–') + '</b></span><span>😠 Scontenti <b>' + S.persi + '</b></span></div>';
    if (top) h += '<p class="top">Birra della serata: <b>' + STILE[top[0]].n + '</b></p>';
    if (S.nuoviAlbum.length) h += '<p class="nuovi">📖 Nuove nell’album: ' + S.nuoviAlbum.map(id => STILE[id].n).join(', ') + '</p>';
    const prossima = !inf && S.idx + 1 < SERATE.length && stelle > 0;
    const sfida = !inf && S.idx + 1 === SERATE.length && stelle > 0;
    h += '<div class="pulsanti">' + (prossima ? '<button id="bAvanti" class="grande">Serata successiva ▶</button>' : '') + (sfida ? '<button id="bAvanti" class="grande">Notte infinita ▶</button>' : '') +
      '<button id="bRiprova">↻ Rigioca</button><button id="bCondividi">📤 Sfida un amico</button><button id="bMenu">Serate</button></div>' + PIEDE;
    const el = schermo(h, 'fine');
    const b = el.querySelector('#bAvanti');
    if (b) b.onclick = () => { const n = S.idx + 1; const ser = n >= SERATE.length ? INFINITA : SERATE[n]; ser.scelta ? selezione(n) : avvia(n); };
    el.querySelector('#bRiprova').onclick = () => { const ser = S.ser; ser.scelta ? selezione(S.idx) : avvia(S.idx); };
    el.querySelector('#bMenu').onclick = serate;
    el.querySelector('#bCondividi').onclick = () => condividi(inf ? 'Ho fatto ' + S.punti + ' punti nella Notte infinita della Tana del Luppolo Game! Fai di meglio?' : 'Ho chiuso «' + S.ser.n + '» alla Tana del Luppolo con ' + S.punti + ' punti e ' + stelle + ' stelle! Ci provi tu?');
    layout();
  }
  function condividi(testo) {
    const url = location.href.split('#')[0];
    if (navigator.share) navigator.share({ title: 'Tana del Luppolo Game', text: testo, url }).catch(() => { });
    else if (navigator.clipboard) navigator.clipboard.writeText(testo + ' ' + url).then(() => toast('Copiato! Incollalo dove vuoi.'));
    else toast(url);
  }
  function album() {
    const prima = S.fase; S.fase = 'menu';
    const n = Object.keys(SAVE.album).length;
    let h = '<h2>Album delle birre</h2><p class="istr">Ogni stile che servi entra nell’album, con quello che racconta Roberto. Ne hai trovati <b>' + n + ' su ' + STILI.length + '</b>.</p><div class="album">';
    STILI.forEach(s => {
      if (SAVE.album[s.id]) h += '<div class="figu" style="--b:' + s.hex + '"><i class="bic"></i><b>' + s.n + '</b><em>' + tagsHtml(s) + '</em><small class="abv">' + COLORI[s.cat].n + ' · ' + s.abv + '</small><p>' + s.f + '</p><small>' + s.cur + '</small></div>';
      else h += '<div class="figu chiusa"><i class="bic"></i><b>???</b><p>Servila a un cliente per scoprirla.</p></div>';
    });
    h += '</div><p class="leggenda">' + Object.values(TAG).map(t => t.e + ' ' + t.n).join(' · ') + '</p>';
    h += '<div class="crediti">Nel gioco ci sono Roberto, che alla Tana sceglie e spiega le birre, e i suoi cani <b>Blanche</b> e <b>Malthus</b>.<br>🐾 Malthus resta di casa alla Tana, per sempre.<br><small>Gli stili e le curiosità sono quelli classici della birra: le birre vere della serata le trovi alla Tana, e te le racconta Roberto.</small></div>';
    h += '<div class="pulsanti"><button id="bIndietro">← Indietro</button></div>';
    const el = schermo(h, 'albumS');
    el.querySelector('#bIndietro').onclick = () => { titolo(); };
  }
  function pausa() {
    if (S.fase !== 'gioco') return;
    S.fase = 'pausa'; spinaSuono(false);
    if (S.spill) S.spill.premuto = false;
    const el = schermo('<h2>Pausa</h2><div class="pulsanti col"><button id="bRip" class="grande">▶ Riprendi</button><button id="bRic">↻ Ricomincia la serata</button><button id="bSer">Torna alle serate</button>' +
      '<button id="bMus">' + (SAVE.musica ? '🎵 Musica: sì' : '🎵 Musica: no') + '</button><button id="bEff">' + (SAVE.effetti ? '🔊 Suoni: sì' : '🔇 Suoni: no') + '</button></div>', 'pausaS');
    el.querySelector('#bRip').onclick = riprendi;
    el.querySelector('#bRic').onclick = () => { const ser = S.ser; S.fase = 'gioco'; ser.scelta ? selezione(S.idx) : avvia(S.idx); };
    el.querySelector('#bSer').onclick = () => { S.fase = 'menu'; serate(); };
    el.querySelector('#bMus').onclick = e => { SAVE.musica = !SAVE.musica; salva(); e.target.textContent = SAVE.musica ? '🎵 Musica: sì' : '🎵 Musica: no'; };
    el.querySelector('#bEff').onclick = e => { SAVE.effetti = !SAVE.effetti; salva(); e.target.textContent = SAVE.effetti ? '🔊 Suoni: sì' : '🔇 Suoni: no'; };
  }
  function riprendi() { if (S.fase !== 'pausa') return; S.fase = 'gioco'; nascondiSchermo(); }
  function setNotte(n, subito) { S.notte = n; SAVE.notte = n; salva(); if (subito) S.nv = n ? 1 : 0; const b = $('bNotte'); if (b) b.textContent = n ? '☀️' : '🌙'; const b2 = $('bNotte2'); if (b2) b2.textContent = n ? '☀️ Giorno' : '🌙 Notte'; }
  $('bNotte').onclick = () => { audioInit(); setNotte(!S.notte); };
  $('bPausa').onclick = () => { audioInit(); S.fase === 'pausa' ? riprendi() : pausa(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.fase === 'gioco') pausa(); });

  /* ================= ciclo ================= */
  S.tt = 0;
  let ultimo = performance.now();
  function passo(dt) {
    S.tt += dt;
    S.nv += ((S.notte ? 1 : 0) - S.nv) * Math.min(1, dt * 2.5);
    if (Math.abs(S.nv - (S.notte ? 1 : 0)) < .002) S.nv = S.notte ? 1 : 0;
    if (S.fase === 'gioco') { aggiornaGioco(dt); aggiornaFx(dt); aggiornaHud(); aggiornaLavagna(); }
    else if (S.fase === 'titolo') aggiornaTitolo(dt);
    aggiornaCamera(dt);
  }
  function aggiornaTitolo(dt) {
    // un po' di vita davanti alla Tana: clienti che entrano, cani che scodinzolano
    S.titoloT = (S.titoloT || 2) - dt;
    if (S.titoloT <= 0) {
      S.titoloT = 4 + rnd() * 4;
      const c = { id: S.idC++, cliente: true, L: aspetto(rnd() < .3 ? 'crociera' : 'normale'), x: -60, y: FL, zona: 'E', stato: 'arriva', posto: { tipo: 'banco', x: 900 }, alpha: 1, fase: 0, dir: 1, got: {}, want: {}, vel: 150 + rnd() * 40, espr: 'felice' };
      c.path = percorso({ zona: 'E' }, { x: 900, zona: 'I' });
      S.clienti.push(c);
    }
    for (const c of S.clienti.slice()) { c.alpha = Math.min(1, c.alpha + dt * 3); if (muovi(c, dt, c.vel) || c.zona === 'I') S.clienti.splice(S.clienti.indexOf(c), 1); }
    R.dir = 1;
  }
  function ciclo(ora) {
    const dt = Math.min(.05, (ora - ultimo) / 1000); ultimo = ora;
    passo(dt); disegna();
    requestAnimationFrame(ciclo);
  }
  addEventListener('resize', () => setTimeout(layout, 50));
  // per le prove: far avanzare il gioco a mano (la pagina nascosta non anima)
  window.__tana = { S, R, POSTI, avvia, passi: (n, dt) => { for (let i = 0; i < (n || 1); i++) passo(dt || 1 / 30); disegna(); }, titolo, serate, selezione, album, fineSerata, accoda, toccaCliente, toccaCane, chiudiSpillatura, nuovoCliente, layout, setNotte };
  titolo();
  requestAnimationFrame(ciclo);
})();
