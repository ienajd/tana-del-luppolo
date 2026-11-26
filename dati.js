/* Tana del Luppolo Game — dati: stili di birra, cucina, serate. */
(function () {
  'use strict';
  const TAG = {
    L: { e: '🌿', n: 'luppolata' },
    M: { e: '🍯', n: 'maltata' },
    A: { e: '🍋', n: 'acida' },
    F: { e: '🍓', n: 'fruttata' },
    T: { e: '☕', n: 'tostata' },
    D: { e: '💧', n: 'leggera' },
    X: { e: '🔥', n: 'forte' },
    W: { e: '🌾', n: 'di frumento' },
    P: { e: '🌸', n: 'speziata' },
    K: { e: '🥓', n: 'affumicata' }
  };
  const COLORI = {
    chiara: { n: 'chiara', hex: '#f3c94a' },
    ambrata: { n: 'ambrata', hex: '#c46a1f' },
    scura: { n: 'scura', hex: '#2a140a' }
  };
  // f = come la spiega Roberto al bancone; cur = curiosità dell'album
  const STILI = [
    { id: 'pils', n: 'Pils', cat: 'chiara', hex: '#f2c43c', tags: ['L', 'D'], abv: '4,5–5,5%', f: 'Chiara, secca, luppolo erbaceo: la regina della sete.', cur: 'Nasce a Plzeň, in Boemia, nel 1842: la prima birra chiara e limpida a fare il giro del mondo.' },
    { id: 'helles', n: 'Helles', cat: 'chiara', hex: '#f0c048', tags: ['M', 'D'], abv: '4,5–5,5%', f: 'Morbida, sa di pane, poco amara: la bionda di Monaco.', cur: 'Nata a Monaco di Baviera nel 1894, per rispondere al successo delle Pils boeme.' },
    { id: 'kolsch', n: 'Kölsch', cat: 'chiara', hex: '#f3d36b', tags: ['D', 'F'], abv: '4,5–5%', f: 'Leggera, con un filo di frutta: si beve nel bicchierino stretto.', cur: 'È di Colonia, in Germania. Si serve nella «Stange», un bicchiere alto e stretto da 0,2 litri.' },
    { id: 'weizen', n: 'Weizen', cat: 'chiara', hex: '#eebd4e', tags: ['W', 'F'], abv: '5–5,5%', f: 'Frumento e lievito: sa di banana e chiodi di garofano!', cur: 'Almeno metà del malto è di frumento. Il profumo di banana lo fa il lievito, non la frutta.' },
    { id: 'blanche', n: 'Blanche', cat: 'chiara', hex: '#f3dc95', tags: ['W', 'P'], abv: '4,5–5,5%', f: 'Come la nostra Blanche: chiara e morbida, con coriandolo e arancia.', cur: 'Stile belga di Hoegaarden, rinato negli anni ’60 grazie a Pierre Celis. Si fa con frumento crudo, coriandolo e scorza d’arancia.' },
    { id: 'apa', n: 'American Pale Ale', cat: 'chiara', hex: '#e3a338', tags: ['L', 'F'], abv: '4,5–6%', f: 'Luppoli americani: pompelmo, agrumi e un amaro fresco.', cur: 'Lo stile con cui è partita la rivoluzione della birra artigianale americana, negli anni ’80.' },
    { id: 'ipa', n: 'IPA', cat: 'chiara', hex: '#dd9a2c', tags: ['L', 'X'], abv: '6–7,5%', f: 'Tanto luppolo: resina, agrumi e un amaro deciso.', cur: 'India Pale Ale: nell’Ottocento gli inglesi la spedivano in India. Oggi la versione americana è la più bevuta tra le artigianali.' },
    { id: 'neipa', n: 'NEIPA', cat: 'chiara', hex: '#f0c25a', tags: ['F', 'X'], abv: '6–7,5%', f: 'Torbida e succosa: frutta tropicale, quasi niente amaro.', cur: 'New England IPA: viene dal nord-est degli Stati Uniti ed è esplosa negli anni 2010. È velata apposta: avena, frumento e tanto luppolo aggiunto a fine fermentazione.' },
    { id: 'saison', n: 'Saison', cat: 'chiara', hex: '#e9b545', tags: ['P', 'D'], abv: '5–7%', f: 'Secca e speziata: la birra dei contadini belgi.', cur: 'Viene dalla Vallonia: si faceva d’inverno per dissetare d’estate i braccianti stagionali, i «saisonniers».' },
    { id: 'tripel', n: 'Tripel', cat: 'chiara', hex: '#e8ad35', tags: ['X', 'P'], abv: '7,5–9,5%', f: 'Dorata ma forte: spezie e frutta dal lievito belga.', cur: 'La resero famosa i monaci trappisti di Westmalle negli anni ’30. Il bicchiere giusto è un calice.' },
    { id: 'gose', n: 'Gose', cat: 'chiara', hex: '#f1d37a', tags: ['A', 'P'], abv: '4–5%', f: 'Acidula, con sale e coriandolo: strana e dissetante!', cur: 'Nata a Goslar e diventata famosa a Lipsia. Il sale ricorda l’acqua salmastra della zona.' },
    { id: 'berliner', n: 'Berliner Weisse', cat: 'chiara', hex: '#f4df8e', tags: ['A', 'D'], abv: '3–4%', f: 'Leggerissima e aspra: la «champagne del Nord».', cur: 'Si racconta che furono i soldati di Napoleone a chiamarla «champagne del Nord».' },
    { id: 'iga', n: 'Italian Grape Ale', cat: 'ambrata', hex: '#b9572a', tags: ['F', 'X'], abv: '6–9%', f: 'Birra e mosto d’uva: uno stile tutto italiano!', cur: 'È lo stile italiano riconosciuto nelle guide internazionali: durante la produzione si aggiunge uva o mosto.' },
    { id: 'redale', n: 'Irish Red Ale', cat: 'ambrata', hex: '#9c3b1a', tags: ['M', 'T'], abv: '4–5%', f: 'Rossa, caramello e un tocco tostato: facile da bere.', cur: 'Il colore rubino viene da una piccola dose di orzo tostato.' },
    { id: 'marzen', n: 'Märzen', cat: 'ambrata', hex: '#b96424', tags: ['M', 'D'], abv: '5–6%', f: 'Ambrata e rotonda: la birra dell’Oktoberfest di una volta.', cur: 'Si faceva a marzo (März) e si teneva al fresco in cantina fino all’autunno.' },
    { id: 'bock', n: 'Bock', cat: 'ambrata', hex: '#8e4a1c', tags: ['M', 'X'], abv: '6–7,5%', f: 'Lager forte e maltata: pane tostato e caramello.', cur: 'Nasce a Einbeck. A Monaco «Einbeck» diventò «ein Bock», un caprone: ecco perché in etichetta c’è spesso una capra.' },
    { id: 'rauch', n: 'Rauchbier', cat: 'ambrata', hex: '#7a3516', tags: ['K', 'M'], abv: '5–6%', f: 'Malto affumicato col legno di faggio: sa di speck!', cur: 'È la specialità di Bamberga, in Franconia: il malto si asciuga sul fumo di legna di faggio.' },
    { id: 'kriek', n: 'Kriek', cat: 'ambrata', hex: '#8a1f24', tags: ['A', 'F'], abv: '4–6%', f: 'Acida e piena di amarene: un lambic belga.', cur: 'Le amarene macerano nel lambic, birra a fermentazione spontanea della zona di Bruxelles.' },
    { id: 'barley', n: 'Barley Wine', cat: 'ambrata', hex: '#8a3d14', tags: ['X', 'M'], abv: '8–12%', f: '«Vino d’orzo»: densa, caramello e frutta secca. Piano!', cur: 'Si chiama vino perché ha la gradazione di un vino. Migliora invecchiando, come certi vini.' },
    { id: 'porter', n: 'Porter', cat: 'scura', hex: '#2e160b', tags: ['T', 'M'], abv: '4,5–6%', f: 'Scura e morbida: cioccolato, caffè, pane tostato.', cur: 'Londra, Settecento: era la birra dei facchini del porto, i «porters». Una birra da porto, come la Darsena!' },
    { id: 'stout', n: 'Dry Stout', cat: 'scura', hex: '#1c0f08', tags: ['T', 'D'], abv: '4–5%', f: 'Nera ma leggera: caffè tostato e schiuma cremosa.', cur: 'Quella irlandese è più leggera di quanto sembri: spesso ha meno alcol di una Pils.' },
    { id: 'imperial', n: 'Imperial Stout', cat: 'scura', hex: '#120a05', tags: ['T', 'X'], abv: '8–12%', f: 'Nera, densa, fortissima: da sorseggiare piano.', cur: 'Si dice che nel Settecento gli inglesi la producessero per la corte degli zar di Russia.' },
    { id: 'quad', n: 'Quadrupel', cat: 'scura', hex: '#4a1f0e', tags: ['X', 'F'], abv: '9–12%', f: 'Scura e potente: uvetta, prugna e caramello.', cur: 'La più forte della famiglia d’abbazia belga, dopo Dubbel e Tripel.' }
  ];
  const STILE = {}; STILI.forEach(s => STILE[s.id] = s);

  const CIBI = {
    panino: { id: 'panino', n: 'Panino', e: '🥪', cuoce: 5, brucia: 7, p: 8 },
    piadina: { id: 'piadina', n: 'Piadina', e: '🌯', cuoce: 4, brucia: 6, p: 8 },
    focaccia: { id: 'focaccia', n: 'Focaccia di patate', corto: 'Focaccia', e: '🫓', cuoce: 0, p: 6 },
    pulled: { id: 'pulled', n: 'Pulled pork', e: '🍖', cuoce: 0, sfila: 1.4, p: 12 }
  };

  const TUTTI_CIBI = ['panino', 'piadina', 'focaccia', 'pulled'];
  const SERATE = [
    { n: 'Si apre!', s: 'La prima sera dietro al bancone', notte: false, dur: 95, int: 8.5, paz: 36, banco: 3, sala: 0, fuori: 0, frigo: 0, spine: ['pils', 'weizen', 'ipa', 'stout'], tut: 'base' },
    { n: 'Blanche e Malthus', s: 'I cani di casa danno una zampa', notte: true, dur: 110, int: 7.5, paz: 33, banco: 3, sala: 2, fuori: 0, frigo: 4, cani: true, spine: ['helles', 'apa', 'redale', 'porter'], tut: 'cani' },
    { n: 'La selezione di Roberto', s: 'Scegli tu le spine della sera', notte: false, dur: 120, int: 7, paz: 31, banco: 3, sala: 2, fuori: 2, frigo: 4, cani: true, scelta: true, prev: { t: 'In Darsena è attraccata una nave da crociera: i turisti hanno caldo e chiedono birre chiare e leggere.', p: { D: 3, chiara: 3, F: 1 } }, tut: 'scelta' },
    { n: 'Panini e piadine', s: 'Si accende la piastra', notte: true, dur: 130, int: 7.5, paz: 33, banco: 3, sala: 4, fuori: 2, frigo: 4, cani: true, scelta: true, cibo: ['panino', 'piadina', 'focaccia'], prev: { t: 'Serata fresca: chi viene a cena cerca birre maltate e ambrate.', p: { M: 3, ambrata: 3, T: 1 } }, tut: 'cibo' },
    { n: 'Il pulled pork', s: 'La specialità di Roberto, finché dura', notte: true, dur: 135, int: 7, paz: 31, banco: 3, sala: 4, fuori: 2, frigo: 4, cani: true, scelta: true, cibo: TUTTI_CIBI, pulled: 8, prev: { t: 'Stasera tutti vogliono il pulled pork: ci stanno bene birre tostate, scure e forti.', p: { T: 3, scura: 2, X: 2 } }, tut: 'pulled' },
    { n: 'Nave in porto', s: 'Arrivano i crocieristi, tutti insieme', notte: false, dur: 140, int: 7.4, paz: 31, banco: 3, sala: 4, fuori: 2, frigo: 4, cani: true, scelta: true, cibo: TUTTI_CIBI, pulled: 8, fusti: 8, nave: true, prev: { t: 'Due navi in porto e un gran caldo: luppolo e frumento vanno a ruba.', p: { L: 2, W: 2, chiara: 2, D: 1 } }, tut: 'fusti' },
    { n: 'L’esperto', s: 'Un intenditore mette alla prova Roberto', notte: true, dur: 140, int: 6.8, paz: 30, banco: 3, sala: 4, fuori: 2, frigo: 4, cani: true, scelta: true, cibo: TUTTI_CIBI, pulled: 8, fusti: 7, esperto: true, prev: { t: 'Raduno di appassionati: cercano birre acide, speziate e particolari.', p: { A: 3, P: 2, K: 2, F: 1 } }, tut: 'esperto' },
    { n: 'Sabato alla Tana', s: 'La sera più piena della settimana', notte: true, dur: 160, int: 5.6, paz: 29, banco: 3, sala: 4, fuori: 2, frigo: 4, cani: true, scelta: true, cibo: TUTTI_CIBI, pulled: 10, fusti: 8, nave: true, esperto: true, prev: { t: 'È sabato: arriva un po’ di tutto. Meglio avere spine diverse tra loro!', p: {} } }
  ];
  const INFINITA = { n: 'Notte infinita', s: 'Si serve finché regge Roberto: 5 clienti scontenti e si chiude', notte: true, dur: Infinity, int: 7, paz: 30, banco: 3, sala: 4, fuori: 2, frigo: 4, cani: true, scelta: true, cibo: TUTTI_CIBI, pulled: 12, fusti: 8, nave: true, esperto: true, infinita: true, prev: { t: 'Una notte che non finisce: varietà prima di tutto.', p: {} } };

  window.TDATI = { TAG, COLORI, STILI, STILE, CIBI, SERATE, INFINITA };
})();
