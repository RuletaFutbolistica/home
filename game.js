(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const rnd = Math.random,
    ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const SG = (x) => 1 / (1 + Math.exp(-x));
  const KEY = 'ruleta-carrera-v1',
    SKEY = 'ruleta-ajustes-v1';
  const POS = { POR: 'Arquero', DEF: 'Defensor', MED: 'Mediocampista', DEL: 'Delantero' };
  const TL = { 1: 'Club grande', 2: 'Club mediano', 3: 'Club chico' };
  const SKN = [
    ['Definición', 'Pase', 'Regate', 'Defensa', 'Liderazgo'],
    ['Reflejos', 'Achique', 'Juego con los pies', 'Comando del área', 'Liderazgo'],
  ];
  const TRK = ['a', 'b', 'c', 'd', 's', 'e'];
  const trNames = (gk) => {
    const n = SKN[gk ? 1 : 0];
    return [n[0], n[1], n[2], n[3], 'Resistencia', n[4]];
  };
  const TRH = [
    [
      'Más goles',
      'Más asistencias',
      'Más goles y asistencias, y mejor lugar en el equipo',
      'Mejor lugar en el equipo y mejores resultados del club',
      'Menos lesiones',
      'Más minutos y mejores resultados del club',
    ],
    [
      'Más atajadas',
      'Más vallas invictas',
      'Mejor lugar en el equipo',
      'Mejor lugar en el equipo y mejores resultados del club',
      'Menos lesiones',
      'Más minutos y mejores resultados del club',
    ],
  ];

  const NATS = [
    'Argentina',
    'Brasil',
    'Uruguay',
    'Colombia',
    'Chile',
    'México',
    'Paraguay',
    'Perú',
    'Ecuador',
    'Venezuela',
    'Bolivia',
    'Estados Unidos',
    'Canadá',
    'España',
    'Portugal',
    'Francia',
    'Italia',
    'Alemania',
    'Inglaterra',
    'Países Bajos',
    'Bélgica',
    'Croacia',
    'Serbia',
    'Polonia',
    'Dinamarca',
    'Suecia',
    'Suiza',
    'Turquía',
    'Marruecos',
    'Senegal',
    'Nigeria',
    'Costa de Marfil',
    'Camerún',
    'Ghana',
    'Egipto',
    'Japón',
    'Corea del Sur',
    'Australia',
    'Arabia Saudita',
  ];
  const NT1 = [
    'Argentina',
    'Brasil',
    'Francia',
    'España',
    'Inglaterra',
    'Alemania',
    'Portugal',
    'Italia',
    'Países Bajos',
  ];
  const NT3 = [
    'Venezuela',
    'Bolivia',
    'Perú',
    'Canadá',
    'Australia',
    'Arabia Saudita',
    'Ghana',
    'Camerún',
  ];
  const NT = (n) => (NT1.includes(n) ? 1 : NT3.includes(n) ? 3 : 2);
  const REGN = {
    'Eurocopa': [
      'España',
      'Portugal',
      'Francia',
      'Italia',
      'Alemania',
      'Inglaterra',
      'Países Bajos',
      'Bélgica',
      'Croacia',
      'Serbia',
      'Polonia',
      'Dinamarca',
      'Suecia',
      'Suiza',
      'Turquía',
    ],
    'Copa América': [
      'Argentina',
      'Brasil',
      'Uruguay',
      'Colombia',
      'Chile',
      'Paraguay',
      'Perú',
      'Ecuador',
      'Venezuela',
      'Bolivia',
    ],
    'Copa Oro': ['México', 'Estados Unidos', 'Canadá'],
    'Copa Africana de Naciones': [
      'Marruecos',
      'Senegal',
      'Nigeria',
      'Costa de Marfil',
      'Camerún',
      'Ghana',
      'Egipto',
    ],
    'Copa Asiática': ['Japón', 'Corea del Sur', 'Arabia Saudita', 'Australia'],
  };
  const regOf = (n) => Object.keys(REGN).find((k) => REGN[k].includes(n)) || 'Copa regional';

  // país: [multiplicador de sueldos, clubes [nombre, nivel 1 grande / 2 mediano / 3 chico]]
  const LG = {
    'Argentina': [
      0.5,
      [
        ['River Plate', 1],
        ['Boca Juniors', 1],
        ['Racing Club', 2],
        ['Independiente', 2],
        ['San Lorenzo', 2],
        ['Vélez Sarsfield', 2],
        ['Estudiantes', 2],
        ['Talleres', 2],
        ['Lanús', 3],
        ['Banfield', 3],
        ['Argentinos Juniors', 3],
        ['Platense', 3],
        ['Atlético Tucumán', 3],
      ],
    ],
    'España': [
      1.2,
      [
        ['Real Madrid', 1],
        ['FC Barcelona', 1],
        ['Atlético de Madrid', 1],
        ['Sevilla', 2],
        ['Real Sociedad', 2],
        ['Villarreal', 2],
        ['Athletic Club', 2],
        ['Valencia', 2],
        ['Real Betis', 2],
        ['Girona', 2],
        ['Getafe', 3],
        ['Osasuna', 3],
        ['Rayo Vallecano', 3],
        ['Celta de Vigo', 3],
      ],
    ],
    'Inglaterra': [
      1.5,
      [
        ['Manchester City', 1],
        ['Liverpool', 1],
        ['Arsenal', 1],
        ['Chelsea', 1],
        ['Manchester United', 1],
        ['Tottenham', 1],
        ['Newcastle', 2],
        ['Aston Villa', 2],
        ['West Ham', 2],
        ['Brighton', 2],
        ['Everton', 3],
        ['Brentford', 3],
        ['Fulham', 3],
        ['Crystal Palace', 3],
      ],
    ],
    'Italia': [
      1.1,
      [
        ['Inter', 1],
        ['Milan', 1],
        ['Juventus', 1],
        ['Napoli', 1],
        ['Roma', 2],
        ['Lazio', 2],
        ['Atalanta', 2],
        ['Fiorentina', 2],
        ['Bologna', 3],
        ['Torino', 3],
        ['Udinese', 3],
        ['Genoa', 3],
      ],
    ],
    'Alemania': [
      1.15,
      [
        ['Bayern Múnich', 1],
        ['Borussia Dortmund', 1],
        ['Bayer Leverkusen', 1],
        ['RB Leipzig', 2],
        ['Eintracht Fráncfort', 2],
        ['Stuttgart', 2],
        ['Wolfsburgo', 3],
        ['Maguncia', 3],
        ['Augsburgo', 3],
        ['Friburgo', 3],
        ['Werder Bremen', 3],
      ],
    ],
    'Francia': [
      1.1,
      [
        ['Paris Saint-Germain', 1],
        ['Olympique de Marsella', 2],
        ['Olympique de Lyon', 2],
        ['Mónaco', 2],
        ['Lille', 2],
        ['Niza', 3],
        ['Rennes', 3],
        ['Lens', 3],
        ['Nantes', 3],
        ['Toulouse', 3],
        ['Estrasburgo', 3],
      ],
    ],
    'Portugal': [
      0.8,
      [
        ['Benfica', 1],
        ['Porto', 1],
        ['Sporting de Lisboa', 1],
        ['Braga', 2],
        ['Vitória de Guimarães', 3],
        ['Famalicão', 3],
        ['Gil Vicente', 3],
        ['Rio Ave', 3],
      ],
    ],
    'Países Bajos': [
      0.9,
      [
        ['Ajax', 1],
        ['PSV', 1],
        ['Feyenoord', 1],
        ['AZ Alkmaar', 2],
        ['Twente', 2],
        ['Utrecht', 3],
        ['Heerenveen', 3],
        ['Groningen', 3],
      ],
    ],
    'Turquía': [
      1,
      [
        ['Galatasaray', 1],
        ['Fenerbahçe', 1],
        ['Beşiktaş', 1],
        ['Trabzonspor', 2],
        ['Başakşehir', 3],
        ['Konyaspor', 3],
        ['Sivasspor', 3],
      ],
    ],
    'Brasil': [
      0.6,
      [
        ['Flamengo', 1],
        ['Palmeiras', 1],
        ['Fluminense', 2],
        ['Atlético Mineiro', 2],
        ['São Paulo', 2],
        ['Corinthians', 2],
        ['Grêmio', 2],
        ['Internacional', 2],
        ['Botafogo', 2],
        ['Santos', 3],
        ['Bahia', 3],
        ['Fortaleza', 3],
        ['Vasco da Gama', 3],
      ],
    ],
    'Uruguay': [
      0.35,
      [
        ['Peñarol', 1],
        ['Nacional (URU)', 1],
        ['Defensor Sporting', 2],
        ['Danubio', 3],
        ['Liverpool (URU)', 3],
        ['Montevideo Wanderers', 3],
      ],
    ],
    'Colombia': [
      0.35,
      [
        ['Atlético Nacional', 1],
        ['Millonarios', 1],
        ['América de Cali', 2],
        ['Junior de Barranquilla', 2],
        ['Santa Fe', 2],
        ['Once Caldas', 3],
        ['Deportivo Cali', 3],
        ['Envigado', 3],
      ],
    ],
    'México': [
      0.7,
      [
        ['Club América', 1],
        ['Chivas', 1],
        ['Tigres', 1],
        ['Monterrey', 1],
        ['Cruz Azul', 2],
        ['Pumas UNAM', 2],
        ['Toluca', 2],
        ['Pachuca', 2],
        ['León', 3],
        ['Santos Laguna', 3],
        ['Querétaro', 3],
        ['Necaxa', 3],
      ],
    ],
    'Estados Unidos': [
      1.1,
      [
        ['Inter Miami', 1],
        ['LA Galaxy', 2],
        ['Los Angeles FC', 2],
        ['Seattle Sounders', 2],
        ['Atlanta United', 3],
        ['Austin FC', 3],
        ['Columbus Crew', 3],
        ['Portland Timbers', 3],
        ['New York City FC', 3],
      ],
    ],
    'Arabia Saudita': [
      2.2,
      [
        ['Al-Hilal', 1],
        ['Al-Nassr', 1],
        ['Al-Ittihad', 1],
        ['Al-Ahli', 2],
        ['Al-Shabab', 3],
        ['Al-Taawoun', 3],
        ['Al-Fateh', 3],
      ],
    ],
    'Japón': [
      0.8,
      [
        ['Vissel Kobe', 2],
        ['Kawasaki Frontale', 2],
        ['Yokohama F. Marinos', 2],
        ['Urawa Reds', 2],
        ['Gamba Osaka', 3],
        ['Cerezo Osaka', 3],
        ['Nagoya Grampus', 3],
      ],
    ],
  };
  // liga, copa y confederación (E europa, S sudamérica, C concacaf, A asia)
  const CMP = {
    'Argentina': ['Liga Profesional', 'Copa Argentina', 'S'],
    'España': ['LaLiga', 'Copa del Rey', 'E'],
    'Inglaterra': ['Premier League', 'FA Cup', 'E'],
    'Italia': ['Serie A', 'Coppa Italia', 'E'],
    'Alemania': ['Bundesliga', 'DFB-Pokal', 'E'],
    'Francia': ['Ligue 1', 'Copa de Francia', 'E'],
    'Portugal': ['Primeira Liga', 'Taça de Portugal', 'E'],
    'Países Bajos': ['Eredivisie', 'KNVB Beker', 'E'],
    'Turquía': ['Süper Lig', 'Copa de Turquía', 'E'],
    'Brasil': ['Brasileirão', 'Copa do Brasil', 'S'],
    'Uruguay': ['Campeonato Uruguayo', 'Copa Uruguay', 'S'],
    'Colombia': ['Liga colombiana', 'Copa Colombia', 'S'],
    'México': ['Liga MX', 'Copa MX', 'C'],
    'Estados Unidos': ['MLS Cup', 'US Open Cup', 'C'],
    'Arabia Saudita': ['Saudi Pro League', 'Copa del Rey de Arabia', 'A'],
    'Japón': ['J1 League', 'Copa del Emperador', 'A'],
  };
  const CN = {
    cl: 'Champions League',
    el: 'Europa League',
    ecl: 'Conference League',
    lib: 'Copa Libertadores',
    sud: 'Copa Sudamericana',
    cc: 'Concachampions',
    acl: 'Champions League de Asia',
  };

  function qual(c, pos) {
    const k = CMP[c][2];
    if (k === 'E') return pos <= 3 ? 'cl' : pos <= 6 ? 'el' : pos <= 9 ? 'ecl' : null;
    if (k === 'S') return pos <= 4 ? 'lib' : pos <= 8 ? 'sud' : null;
    if (k === 'C') return pos <= 4 ? 'cc' : null;
    return pos <= 3 ? 'acl' : null;
  }

  function qualByTier(c, t) {
    const k = CMP[c][2],
      top = { E: 'cl', S: 'lib', C: 'cc', A: 'acl' }[k],
      sec = { E: 'el', S: 'sud', C: 'cc', A: 'acl' }[k],
      thr = { E: 'ecl', S: 'sud', C: null, A: null }[k];
    return t === 1 ? top : t === 2 ? (rnd() < 0.7 ? sec : null) : rnd() < 0.25 ? thr : null;
  }
  const RIV = {
    'River Plate': 'Boca Juniors',
    'Boca Juniors': 'River Plate',
    'Racing Club': 'Independiente',
    'Independiente': 'Racing Club',
    'Real Madrid': 'FC Barcelona',
    'FC Barcelona': 'Real Madrid',
    'Atlético de Madrid': 'Real Madrid',
    'Sevilla': 'Real Betis',
    'Real Betis': 'Sevilla',
    'Manchester City': 'Manchester United',
    'Manchester United': 'Manchester City',
    'Liverpool': 'Everton',
    'Everton': 'Liverpool',
    'Arsenal': 'Tottenham',
    'Tottenham': 'Arsenal',
    'Inter': 'Milan',
    'Milan': 'Inter',
    'Roma': 'Lazio',
    'Lazio': 'Roma',
    'Bayern Múnich': 'Borussia Dortmund',
    'Borussia Dortmund': 'Bayern Múnich',
    'Paris Saint-Germain': 'Olympique de Marsella',
    'Olympique de Marsella': 'Paris Saint-Germain',
    'Benfica': 'Sporting de Lisboa',
    'Sporting de Lisboa': 'Benfica',
    'Ajax': 'Feyenoord',
    'Feyenoord': 'Ajax',
    'Galatasaray': 'Fenerbahçe',
    'Fenerbahçe': 'Galatasaray',
    'Flamengo': 'Fluminense',
    'Fluminense': 'Flamengo',
    'Palmeiras': 'Corinthians',
    'Corinthians': 'Palmeiras',
    'Peñarol': 'Nacional (URU)',
    'Nacional (URU)': 'Peñarol',
    'Atlético Nacional': 'Millonarios',
    'Millonarios': 'Atlético Nacional',
    'Club América': 'Chivas',
    'Chivas': 'Club América',
    'Al-Hilal': 'Al-Nassr',
    'Al-Nassr': 'Al-Hilal',
    'LA Galaxy': 'Los Angeles FC',
    'Los Angeles FC': 'LA Galaxy',
  };

  const ALL = [];
  for (const c in LG) LG[c][1].forEach(([n, t]) => ALL.push({ n, t, c }));
  const LV = { 1: 84, 2: 74, 3: 64 },
    TM = { 1: 1.6, 2: 1, 3: 0.55 };
  const RETIRE = ['Arabia Saudita', 'Estados Unidos', 'Japón', 'México'];

  let SET = { sound: true, fast: false };
  try {
    Object.assign(SET, JSON.parse(localStorage.getItem(SKEY) || '{}'));
  } catch (e) {}

  function saveSet() {
    try {
      localStorage.setItem(SKEY, JSON.stringify(SET));
    } catch (e) {}
  }
  let G = null;
  try {
    G = JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch (e) {
    G = null;
  }

  function migrate() {
    if (!G) return;
    G.trust = Math.max(0, G.trust || 0);
    G.stam = Math.max(0, G.stam || 0);
    G.sk = Object.assign({ a: 0, b: 0, c: 0, d: 0, e: 0 }, G.sk || {});
    G.trophies = G.trophies || [];
    G.caps = G.caps || 0;
    G.ntg = G.ntg || 0;
    G.nta = G.nta || 0;
    G.form = G.form || 0;
    if (G.queue) {
      G.queue = G.queue.flatMap((q) =>
        q === 'team'
          ? ['league', 'cupstart']
          : q === 'cup'
            ? ['cupstart']
            : q === 'contin'
              ? ['contstart']
              : q === 'ntres'
                ? []
                : [q],
      );
    }
    if (G.cur && ['team', 'ntres', 'cup', 'contin'].includes(G.cur.id)) {
      G.cur = null;
      G.phase !== 'ended' && G.queue && (G.qi = Math.min(G.qi, G.queue.length));
    }
  }
  migrate();

  function save() {
    try {
      if (G) localStorage.setItem(KEY, JSON.stringify(G));
      else localStorage.removeItem(KEY);
    } catch (e) {}
  }

  /* ---------- utilidades de ruleta ---------- */

  /* Cada resultado posible es UNA porción de la ruleta y su ancho es proporcional
     a su probabilidad (p, de 0 a 1). No se repiten porciones.
     - Las porciones menores a MIN_VISIBLE se descartan.
     - En las ruletas con `min: true` se agrandan hasta ese mínimo para que siempre se vean. */
  const MIN_VISIBLE = 0.03;

  function buildSlots(entries, minOne) {
    let list = entries.filter((e) => e.w > 0);
    let tot = list.reduce((s, e) => s + e.w, 0);
    list = list.map((e) => ({ l: e.l, v: e.v, p: e.w / tot }));
    if (minOne) {
      list.forEach((s) => {
        s.p = Math.max(s.p, MIN_VISIBLE);
      });
    } else {
      const visibles = list.filter((s) => s.p >= MIN_VISIBLE);
      if (visibles.length) list = visibles;
    }
    tot = list.reduce((s, x) => s + x.p, 0);
    list.forEach((s) => {
      s.p /= tot;
    });
    return list;
  }

  function gridEntries(E, sd) {
    const m = new Map();
    for (let k = -1.6; k < 1.7; k += 0.8) {
      const v = Math.max(0, Math.round(E + k * sd));
      m.set(v, (m.get(v) || 0) + Math.exp(-0.5 * Math.pow((v - E) / sd, 2)));
    }
    return [...m].map(([v, w]) => ({ l: String(v), v, w }));
  }

  function pickW(items, wf) {
    let t = 0;
    const w = items.map((i) => {
      const x = Math.max(0, wf(i));
      t += x;
      return x;
    });
    let r = rnd() * t;
    for (let i = 0; i < items.length; i++) {
      r -= w[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  /* ---------- reglas del juego ---------- */
  const blankS = () => ({
    games: 0,
    g: 0,
    a: 0,
    sv: 0,
    cs: 0,
    res: '',
    award: '',
    role: '',
    bg: 0,
    bs: 0,
    nw: 0,
    lg: '',
    cp: '',
    ct: '',
    pos: 0,
  });

  function muAge(a, pos) {
    const t = {
      16: 4.6,
      17: 4.4,
      18: 4,
      19: 3.5,
      20: 3,
      21: 2.5,
      22: 2,
      23: 1.5,
      24: 1,
      25: 0.5,
      26: 0.2,
      27: 0,
      28: -0.2,
      29: -0.5,
      30: -1,
      31: -1.3,
      32: -1.6,
      33: -1.8,
    };
    let m = a <= 16 ? 4.6 : a >= 34 ? -2 : t[a];
    if (pos === 'POR' && a >= 30) m += 0.6;
    return m;
  }

  function roleE(d, age, trust, stam) {
    if (age < 19) d -= 2;
    d += 2 + (trust || 0) * 1.5;
    const s1 = SG((d - 3) / 3.2),
      s2 = SG((d + 4) / 4),
      s3 = SG((d + 12) / 4.5),
      inj = (age > 33 ? 0.1 : 0.06) * (1 - clamp((stam || 0) * 0.06, 0, 0.55));
    return [
      { l: 'Figura', v: 37, w: Math.max(0.04, s1) },
      { l: 'Titular', v: 32, w: Math.max(0.09, s2 - s1) },
      { l: 'Rotación', v: 21, w: Math.max(0.1, s3 - s2) },
      { l: 'Suplente', v: 9, w: Math.max(0.04, 1 - s3) },
      { l: 'Lesión', v: 7, w: inj },
    ];
  }

  function expectRole(ovr, t, age) {
    const e = roleE(ovr - LV[t], age, 0, 0).slice(0, 4);
    e.sort((a, b) => b.w - a.w);
    return e[0].l;
  }

  function wage(ovr, c) {
    return Math.max(
      12000,
      Math.round((35000 * Math.pow(1.17, ovr - 45) * TM[c.t] * LG[c.c][0]) / 1000) * 1000,
    );
  }

  function money(x) {
    if (x >= 1e6) return 'US$ ' + (x / 1e6).toFixed(x >= 1e7 ? 0 : 1).replace('.', ',') + ' M';
    return 'US$ ' + Math.round(x / 1000) + ' mil';
  }

  function seasonLabel(y) {
    return y + '/' + String((y + 1) % 100).padStart(2, '0');
  }
  const natThr = () => ({ 1: 80, 2: 73, 3: 66 })[NT(G.nat)];

  function seasonQueue() {
    const q = ['role', 'train'];
    if (G.pos === 'POR') q.push('saves', 'clean');
    else q.push('goals', 'assists');
    q.push('league', 'cupstart');
    if (G.contQ) q.push('contstart');
    if (G.ovr >= natThr() - 12) q.push('natl');
    if (G.ovr >= 83) q.push('award');
    q.push('progress');
    return q;
  }

  /* ---------- eventos de temporada ----------
   Cada elección tiene dos desenlaces. w = peso; o media; t confianza del DT; s resistencia; g partidos; a, b, c habilidades (definición/pase/regate, o reflejos/achique/juego con los pies) */
  const EV = [
    {
      roles: ['Titular', 'Rotación', 'Suplente'],
      t: 'Una oportunidad inesperada',
      x: 'Uno de los jugadores titulares se lesionó. Tenés la oportunidad de demostrar tu potencial.',
      c: [
        [
          'Entrenar a fondo',
          'Puede subir tu media, pero el cuerpo se resiente.',
          [
            { w: 60, l: 'Mejora', n: 'Se nota el esfuerzo en cada práctica.', o: 1, t: 1 },
            {
              w: 40,
              l: 'Sobrecarga',
              n: 'Te pasás de rosca y el cuerpo te pasa factura.',
              s: -1,
              g: -4,
            },
          ],
        ],
        [
          'Conversar con los demás',
          'Ganás experiencia, aunque podés perder foco.',
          [
            {
              w: 65,
              l: 'Aprendés',
              n: 'Los veteranos te explican cómo leer los partidos.',
              o: 1,
              t: 1,
            },
            { w: 35, l: 'Distraído', n: 'Pasás más tiempo charlando que entrenando.', t: -1 },
          ],
        ],
        [
          'Tomarlo con calma',
          'Cuidás el físico, pero el DT puede dudar de tus ganas.',
          [
            { w: 55, l: 'Fresco', n: 'Llegás descansado y sin presión.', s: 1, g: 2 },
            { w: 45, l: 'Poco ganas', n: 'El DT te ve poco comprometido.', t: -1, g: -4 },
          ],
        ],
        [
          'Entrenar doble turno',
          'Alto riesgo, alta recompensa.',
          [
            { w: 50, l: 'A full', n: 'Entrenaste como loco.', o: 2, t: 1, s: -1 },
            { w: 50, l: 'Lesión', n: 'Te lesionás por el exceso de carga.', o: -1, t: 1, g: -6 },
          ],
        ],
      ],
    },
    {
      roles: ['Figura', 'Titular'],
      t: 'Llega un refuerzo a tu puesto',
      x: 'El club contrató a un jugador de tu posición. Tu lugar ya no está asegurado.',
      c: [
        [
          'Demostrar que merecés seguir',
          'Podés ganarte al DT o pasarte de revoluciones.',
          [
            { w: 55, l: 'Respondés', n: 'Respondés en cada práctica y el DT lo nota.', o: 1, t: 1 },
            { w: 45, l: 'Te quemás', n: 'Querés tanto que te sobrecargás.', s: -1, g: -3 },
          ],
        ],
        [
          'Pedirle consejos al refuerzo',
          'Aprendés, pero cedés terreno.',
          [
            {
              w: 60,
              l: 'Aprendés',
              n: 'El recién llegado te muestra detalles que no conocías.',
              o: 1,
              s: 1,
            },
            {
              w: 40,
              l: 'Cedés',
              n: 'Quedás un paso atrás en la consideración del DT.',
              t: -1,
              g: -3,
            },
          ],
        ],
        [
          'Ignorarlo y seguir igual',
          'Sin cambios, con algo de riesgo.',
          [
            { w: 50, l: 'Todo igual', n: 'Seguís con tu rutina y nada cambia.' },
            { w: 50, l: 'Perdés terreno', n: 'El DT empieza a probar al refuerzo.', t: -1, g: -4 },
          ],
        ],
        [
          'Hablar con el DT',
          'Ganás claridad, pero podés llegar en mal momento.',
          [
            { w: 55, l: 'Te escucha', n: 'El DT valora que le pongas la cara.', t: 2 },
            { w: 45, l: 'Mal momento', n: 'Lo agarrás justo en un mal momento.', t: -1 },
          ],
        ],
      ],
    },
    {
      t: 'Pretemporada dura',
      x: 'Arrancó la pretemporada y el cuerpo técnico exige mucho.',
      c: [
        [
          'Dar el máximo',
          'Podés llegar volando o llegar roto.',
          [
            { w: 55, l: 'Volás', n: 'Llegás a la temporada en tu mejor forma.', o: 1, s: 1 },
            { w: 45, l: 'Te rompés', n: 'El cuerpo no aguanta el ritmo.', s: -1, g: -5 },
          ],
        ],
        [
          'Cuidarte',
          'Menos riesgo, menos crecimiento.',
          [
            { w: 70, l: 'Sin riesgos', n: 'Evitás problemas y llegás entero.', s: 1 },
            { w: 30, l: 'Corto', n: 'Llegás un poco atrás del resto.', o: -1 },
          ],
        ],
        [
          'Gimnasio extra',
          'Más fuerza, menos frescura.',
          [
            { w: 55, l: 'Más fuerte', n: 'Ganás fuerza y se nota en los choques.', o: 1, t: 1 },
            { w: 45, l: 'Cargado', n: 'Llegás con las piernas pesadas.', g: -3 },
          ],
        ],
        [
          'Ayudar a los juveniles',
          'Sumás confianza, pero perdés ritmo propio.',
          [
            { w: 60, l: 'Referente', n: 'El DT te ve como un líder del vestuario.', t: 2, e: 1 },
            { w: 40, l: 'Sin ritmo', n: 'Perdés ritmo de competencia.', o: -1 },
          ],
        ],
      ],
    },
    {
      pos: 'F',
      t: 'Tarde de práctica libre',
      x: 'Terminó el entrenamiento y la cancha quedó libre. Tenés tiempo para trabajar una sola cosa.',
      c: [
        [
          'Remates desde afuera del área',
          'Puede mejorar tu definición, o frustrarte.',
          [
            { w: 60, l: 'Clavás', n: 'Metés remates en los ángulos una y otra vez.', a: 1 },
            {
              w: 40,
              l: 'Frustración',
              n: 'Todo se te va desviado y te vas con bronca.',
              a: 1,
              t: -1,
            },
          ],
        ],
        [
          'Pases largos y cambios de frente',
          'Más visión de juego, con riesgo de cargarte.',
          [
            { w: 45, l: 'Preciso', n: 'Los cambios de frente te salen como con la mano.', b: 2 },
            { w: 55, l: 'Cargado', n: 'Mejorás, pero te cargás el aductor.', b: 1, s: -1 },
          ],
        ],
        [
          'Gambetas contra un compañero',
          'Ganás desequilibrio, pero el DT puede dudar.',
          [
            {
              w: 55,
              l: 'Desequilibrio',
              n: 'Le sacás la pelota a todos y te animás más.',
              c: 1,
              t: 1,
            },
            { w: 45, l: 'Te complicás', n: 'Te pasás de gambeta y el DT lo ve.', c: 1, t: -1 },
          ],
        ],
        [
          'Pedir un plan personalizado',
          'Depende de que el DT tenga tiempo para vos.',
          [
            { w: 50, l: 'Plan a medida', n: 'El DT arma un plan solo para vos.', a: 1, b: 1, t: 1 },
            { w: 50, l: 'Sin tiempo', n: 'El DT no puede dedicarte tiempo.', t: -1 },
          ],
        ],
      ],
    },
    {
      pos: 'F',
      t: 'Sesión de video',
      x: 'El cuerpo técnico te muestra videos de tus últimos partidos y de tus próximos rivales.',
      c: [
        [
          'Estudiar a los arqueros rivales',
          'Puede afinar tu definición.',
          [
            { w: 60, l: 'Ves el hueco', n: 'Detectás qué lado le cuesta al arquero.', a: 1 },
            { w: 40, l: 'Sobreanalizás', n: 'Pensás de más y llegás tenso.', s: -1, a: 1 },
          ],
        ],
        [
          'Mirar tus propios errores',
          'Podés crecer o desanimarte.',
          [
            { w: 55, l: 'Corregís', n: 'Ves tus errores y los corregís.', o: 1 },
            { w: 45, l: 'Desanimado', n: 'Te hundís en lo que hiciste mal.', t: -1 },
          ],
        ],
        [
          'Estudiar a los mediocampistas',
          'Ganás lectura del juego.',
          [
            { w: 60, l: 'Lectura', n: 'Aprendés a leer cómo reparten el juego.', b: 1 },
            { w: 40, l: 'Nada nuevo', n: 'No encontrás nada nuevo.' },
          ],
        ],
        [
          'Pedir ver videos de cracks',
          'Inspiración con poco resultado inmediato.',
          [
            { w: 50, l: 'Inspirado', n: 'Copiás un movimiento y te sale.', c: 1, a: 1 },
            { w: 50, l: 'Te ilusionás', n: 'Querés imitar todo y el DT te baja a tierra.', t: -1 },
          ],
        ],
      ],
    },
    {
      pos: 'F',
      t: 'Tiros libres después de la práctica',
      x: 'Un compañero te desafía a ver quién la pone mejor en un tiro libre.',
      c: [
        [
          'Aceptar y apostar fuerte',
          'Podés ganar respeto o quedar en ridículo.',
          [
            { w: 50, l: 'Crack', n: 'Clavás tres en el ángulo y todos te aplauden.', t: 1, a: 1 },
            { w: 50, l: 'Papelón', n: 'Las tirás a la tribuna y te cargan una semana.', t: -1 },
          ],
        ],
        [
          'Practicar con calma',
          'Más técnica, menos adrenalina.',
          [
            { w: 65, l: 'Técnica', n: 'Repetís el golpeo hasta que sale limpio.', a: 1 },
            { w: 35, l: 'Aburrido', n: 'Te cansás y lo dejás a mitad.' },
          ],
        ],
        [
          'Pedirle consejos a un veterano',
          'Aprendés un truco y ganás confianza.',
          [
            { w: 60, l: 'Truco', n: 'El veterano te enseña cómo apoyar el pie.', a: 1, b: 1 },
            { w: 40, l: 'Cargada', n: 'El veterano te cargó y no te enseñó nada.', t: -1 },
          ],
        ],
        [
          'No participar',
          'Cuidás el cuerpo y perdés una oportunidad.',
          [
            { w: 60, l: 'Entero', n: 'Evitás un tirón y te vas a casa.', s: 1 },
            {
              w: 40,
              l: 'Pasás de largo',
              n: 'Los demás hablan de eso toda la semana y vos no estuviste.',
              t: -1,
            },
          ],
        ],
      ],
    },
    {
      pos: 'G',
      t: 'Trabajo específico de arqueros',
      x: 'El entrenador de arqueros te propone una sesión de lo que quieras mejorar.',
      c: [
        [
          'Reflejos a quemarropa',
          'Más reflejos, con riesgo de golpes.',
          [
            {
              w: 60,
              l: 'Más rápido',
              n: 'Atajás pelotas a dos metros y cada vez más rápido.',
              a: 1,
            },
            { w: 40, l: 'Golpe', n: 'Te comés un pelotazo en la mano.', a: 1, s: -1 },
          ],
        ],
        [
          'Salidas por arriba',
          'Mejora el achique, con riesgo de errar el cálculo.',
          [
            { w: 55, l: 'Dominás el área', n: 'Te sentís dueño del área.', b: 1 },
            { w: 45, l: 'Mal cálculo', n: 'Te pasás de salida varias veces.', b: 1, t: -1 },
          ],
        ],
        [
          'Juego con los pies',
          'Más participación, pero el DT puede dudar.',
          [
            { w: 55, l: 'Buen pie', n: 'Salís jugando con comodidad.', c: 1, t: 1 },
            { w: 45, l: 'Te complicás', n: 'Regalás una pelota en práctica.', c: 1, t: -1 },
          ],
        ],
        [
          'Charla con el entrenador de arqueros',
          'Aprendés con calma.',
          [
            { w: 65, l: 'Aprendés', n: 'Te explica cómo posicionarte.', a: 1, b: 1 },
            { w: 35, l: 'Charla larga', n: 'La charla se hace eterna y no entrenás.' },
          ],
        ],
      ],
    },
    {
      pos: 'G',
      t: 'Práctica de penales',
      x: 'Los compañeros te tiran penales al final del entrenamiento.',
      c: [
        [
          'Tirarte siempre al mismo lado',
          'Podés leerlos o ser previsible.',
          [
            { w: 45, l: 'Los adivinás', n: 'Adivinás varios y se ríen de tu suerte.', a: 1, t: 1 },
            { w: 55, l: 'Previsible', n: 'Te la meten del otro lado y te cargan.', t: -1 },
          ],
        ],
        [
          'Esperar hasta último momento',
          'Más difícil, pero te da lectura.',
          [
            { w: 50, l: 'Lectura', n: 'Aprendés a esperar el último gesto.', a: 2 },
            { w: 50, l: 'Tarde', n: 'Llegás tarde a casi todas.', s: -1 },
          ],
        ],
        [
          'Preguntarles a los tiradores',
          'Ganás confianza del grupo.',
          [
            { w: 60, l: 'Información', n: 'Los compañeros te cuentan cómo patean.', b: 1, t: 1 },
            { w: 40, l: 'Mentiras', n: 'Te mienten para confundirte.' },
          ],
        ],
        [
          'Cambiar de técnica',
          'Riesgo alto de salir peor.',
          [
            { w: 40, l: 'Funciona', n: 'Tu nueva técnica sorprende a todos.', a: 1, c: 1 },
            { w: 60, l: 'Confusión', n: 'Te desordenás y fallás varias.', t: -1 },
          ],
        ],
      ],
    },
    {
      t: 'Hinchas en la puerta del club',
      x: 'Un grupo de hinchas te espera a la salida del entrenamiento.',
      c: [
        [
          'Sacarte fotos con todos',
          'Ganás cariño, pero perdés descanso.',
          [
            { w: 60, l: 'Querido', n: 'Los hinchas te agradecen el gesto.', t: 1 },
            { w: 40, l: 'Cansado', n: 'Llegás tarde a casa y dormís poco.', s: -1 },
          ],
        ],
        [
          'Saludar y seguir',
          'Equilibrado.',
          [
            { w: 70, l: 'Todo bien', n: 'Saludás y te vas tranquilo.', s: 1 },
            { w: 30, l: 'Críticas', n: 'Alguien te grita que juegues mejor.', t: -1 },
          ],
        ],
        [
          'Salir por la otra puerta',
          'Cuidás tu descanso y quedás mal con los hinchas.',
          [
            { w: 55, l: 'Descansado', n: 'Llegás a casa a tiempo.', s: 1 },
            { w: 45, l: 'Mala prensa', n: 'Se enteran y te critican.', t: -1 },
          ],
        ],
        [
          'Pedirles que te alienten',
          'Presión extra.',
          [
            { w: 50, l: 'Aliento', n: 'Te cantan durante toda la semana.', o: 1, t: 1 },
            { w: 50, l: 'Presión', n: 'La presión te pesa más de lo esperado.', o: -1 },
          ],
        ],
      ],
    },
  ];

  function evPool(role) {
    return EV.filter(
      (e) =>
        (!e.roles || e.roles.includes(role)) && (!e.pos || (e.pos === 'G') === (G.pos === 'POR')),
    );
  }

  function applyFx(o) {
    const g = G,
      s = g.s,
      e = {};
    const st = (k, cur, d, lo, hi) => {
      const v = clamp((cur || 0) + (d || 0), lo, hi);
      e[k] = v - (cur || 0);
      return v;
    };
    if (o.o) {
      const v = st('o', g.ovr, o.o, 35, 99);
      g.ovr = v;
      g.peak = Math.max(g.peak, v);
    }
    g.trust = st('t', g.trust, o.t, 0, 5);
    g.stam = st('s', g.stam, o.s, 0, 10);
    s.games = st('g', s.games, o.g, 0, 38);
    g.sk = Object.assign({ a: 0, b: 0, c: 0, d: 0, e: 0 }, g.sk || {});
    ['a', 'b', 'c', 'd', 'e'].forEach((k) => {
      g.sk[k] = st(k, g.sk[k], o[k], 0, 10);
    });
    return e;
  }

  function fx(e) {
    const sg = (n) => (n > 0 ? '+' : '') + n,
      N = SKN[G.pos === 'POR' ? 1 : 0],
      p = [];
    if (e.o) p.push(sg(e.o) + ' de media');
    ['a', 'b', 'c', 'd', 'e'].forEach((k, i) => {
      if (e[k]) p.push(sg(e[k]) + ' de ' + N[i].toLowerCase());
    });
    if (e.t) p.push(sg(e.t) + ' de confianza del DT');
    if (e.s) p.push(sg(e.s) + ' de resistencia');
    if (e.g) p.push(sg(e.g) + (Math.abs(e.g) === 1 ? ' partido' : ' partidos'));
    return p.join(', ');
  }

  /* ---------- ruletas ---------- */

  function spec(id) {
    const g = G,
      ov = g.ovr,
      t = g.club.t,
      gf = g.s.games / 36,
      o = (ov || 50) - 50,
      sk = Object.assign({ a: 0, b: 0, c: 0, d: 0, e: 0 }, g.sk || {});
    const tc = t === 1 ? 1.1 : t === 3 ? 0.92 : 1;
    switch (id) {
      case 'pot':
        return {
          t: 'Ruleta de potencial',
          h: 'Marca hasta dónde podés llegar. Nadie lo sabe de antemano.',
          min: true,
          e: [
            { l: 'Suplente', v: 68, w: 18 },
            { l: 'Regular', v: 75, w: 30 },
            { l: 'Buen nivel', v: 81, w: 24 },
            { l: 'Crack', v: 86, w: 15 },
            { l: 'Estrella', v: 91, w: 9 },
            { l: 'Leyenda', v: 96, w: 4 },
          ],
        };
      case 'ovr0': {
        const e = [];
        for (let v = 44; v <= 62; v += 2)
          e.push({ l: String(v), v, w: Math.exp(-0.5 * Math.pow((v - 52) / 4.5, 2)) });
        return {
          t: 'Ruleta de media inicial',
          h: 'Tu nivel el día del debut. A los 16 casi todos arrancan abajo.',
          e,
        };
      }
      case 'role':
        return {
          t: 'Ruleta de minutos',
          h: `Tu media de ${ov} frente a un plantel de nivel ${LV[t]} define cuánto jugás en ${g.club.n}. Confianza del DT: ${g.trust || 0}.`,
          e: roleE(ov - LV[t] + 0.5 * sk.c + 0.3 * sk.d + 0.4 * sk.e, g.age, g.trust, g.stam),
        };
      case 'trainres': {
        const nm = trNames(g.pos === 'POR')[g.trk];
        return {
          t: 'Ruleta de entrenamiento',
          min: true,
          h: `Trabajás ${nm} toda la temporada. La ruleta va de -1 a +5.`,
          e: [
            [-1, 5],
            [0, 10],
            [1, 30],
            [2, 28],
            [3, 17],
            [4, 7],
            [5, 3],
          ].map(([v, w]) => ({ l: (v > 0 ? '+' : '') + v, v, w })),
        };
      }
      case 'evres': {
        const ch = EV[g.evi].c[g.evc];
        return {
          t: 'Ruleta del resultado',
          h: `Elegiste “${ch[0]}”. La ruleta decide cómo sale.`,
          e: ch[2].map((o, i) => ({ l: o.l, v: i, w: o.w })),
        };
      }
      case 'goals': {
        const r =
          g.pos === 'DEL' ? 3 + o * 0.62 : g.pos === 'MED' ? 0.8 + o * 0.27 : 0.4 + o * 0.11;
        const E = Math.max(0.2, r * tc * gf * (1 + 0.07 * sk.a + 0.03 * sk.c));
        g.s.ex = Object.assign(g.s.ex || {}, { g: E }); // lo esperable, para comparar en la liga
        return {
          t: 'Ruleta de goles',
          h: `Con media ${ov}, ${g.s.games} partidos y definición ${sk.a}, lo esperable ronda los ${Math.round(E)}.`,
          e: gridEntries(E, Math.sqrt(E) * 1.1 + 0.8),
        };
      }
      case 'assists': {
        const r = g.pos === 'DEL' ? 1 + o * 0.2 : g.pos === 'MED' ? 1.5 + o * 0.36 : 0.5 + o * 0.13;
        const E = Math.max(0.2, r * tc * gf * (1 + 0.08 * sk.b + 0.03 * sk.c));
        g.s.ex = Object.assign(g.s.ex || {}, { a: E });
        return {
          t: 'Ruleta de asistencias',
          h: `Con pase ${sk.b}, lo esperable para tu posición ronda las ${Math.round(E)}.`,
          e: gridEntries(E, Math.sqrt(E) * 1.1 + 0.8),
        };
      }
      case 'saves': {
        const E = Math.max(
          5,
          (80 + o * 1.1) * { 1: 0.85, 2: 1, 3: 1.1 }[t] * gf * (1 + 0.04 * sk.a),
        );
        g.s.ex = Object.assign(g.s.ex || {}, { sv: E });
        return {
          t: 'Ruleta de atajadas',
          h: `En ${g.s.games} partidos y con reflejos ${sk.a}, lo esperable ronda las ${Math.round(E)} atajadas.`,
          e: gridEntries(E, Math.sqrt(E) * 1.3),
        };
      }
      case 'clean': {
        const p = clamp(
          0.14 + o * 0.0065 + { 1: 0.07, 2: 0.02, 3: -0.02 }[t] + 0.012 * sk.b,
          0.08,
          0.6,
        );
        const E = g.s.games * p;
        g.s.ex = Object.assign(g.s.ex || {}, { cs: E });
        return {
          t: 'Ruleta de vallas invictas',
          h: `Lo esperable ronda las ${Math.round(E)} vallas invictas.`,
          e: gridEntries(Math.max(0.2, E), Math.sqrt(E * (1 - p)) * 1.1 + 0.7),
        };
      }
      case 'league': {
        // Probabilidad base de cada tramo (Campeón, Top 3, Top 6, Top 9, Mitad, Zona baja)
        // según el tamaño del club.
        const W = {
          1: [30, 38, 22, 6, 3, 1],
          2: [7, 16, 26, 22, 21, 8],
          3: [2, 6, 14, 20, 36, 22],
        }[t];
        const f = g.form || 0;

        // Rendimiento de TU temporada comparado con lo esperable para tu media:
        // goles y asistencias (o atajadas y vallas invictas si sos arquero).
        const ex = g.s.ex || {},
          ratios = [];
        if (g.pos === 'POR') {
          if (ex.sv > 0) ratios.push(g.s.sv / ex.sv);
          if (ex.cs > 0) ratios.push((g.s.cs + 1) / (ex.cs + 1));
        } else {
          if (ex.g > 0.5) ratios.push((g.s.g + 1) / (ex.g + 1));
          if (ex.a > 0.5) ratios.push((g.s.a + 1) / (ex.a + 1));
        }
        const perf = ratios.length
            ? Math.log(ratios.reduce((a, b) => a + b, 0) / ratios.length)
            : 0,
          played = clamp(g.s.games / 30, 0, 1), // jugar poco resta peso a tu rendimiento
          perfM = Math.exp(1.2 * clamp(perf, -0.5, 0.8) * played),
          roleM =
            { Figura: 1.25, Titular: 1.1, Rotación: 0.95, Suplente: 0.75, Lesión: 0.7 }[g.s.role] ||
            1;

        // Multiplicador total: momento del club x tu rol x tu rendimiento x habilidades x media.
        const tf = clamp(
          Math.exp(0.35 * f) *
            roleM *
            perfM *
            (1 + 0.03 * (sk.d + sk.e)) *
            Math.exp((ov - LV[t]) / 60),
          0.4,
          3.5,
        );

        // El título sube más que el Top 3, y el Top 3 más que el Top 6.
        const mult = [Math.pow(tf, 1.5), Math.pow(tf, 1.2), Math.pow(tf, 0.9), 1, 1 / tf, 1 / tf];
        const L = ['Campeón', 'Top 3', 'Top 6', 'Top 9', 'Mitad', 'Zona baja'],
          mood =
            f >= 1.5
              ? 'en gran momento'
              : f >= 0.5
                ? 'en buen momento'
                : f > -0.5
                  ? 'con altibajos'
                  : 'en mal momento',
          nota =
            perf * played > 0.15
              ? ' Tu gran temporada le suma chances.'
              : perf * played < -0.15
                ? ' Tu temporada pesó en contra.'
                : '';
        return {
          t: 'Ruleta de ' + CMP[g.club.c][0],
          h: `${g.club.n} llega ${mood}.${nota} Campeón, Top 3 (copas grandes), Top 6, Top 9 o más abajo.`,
          e: L.map((l, i) => ({ l, v: i, w: W[i] * mult[i] })),
        };
      }
      case 'cm': {
        const ct = g.ct,
          i = ct.i,
          ko = ct.kind === 'cup' || i >= 3,
          ki = ct.kind === 'cup' ? i : i - 3,
          conf = CMP[g.club.c][2],
          topC = ct.kind === 'cont' && ['cl', 'lib', 'cc', 'acl'].includes(g.contQ);
        const pool = (
          ct.kind === 'cup'
            ? ALL.filter((x) => x.c === g.club.c)
            : ALL.filter((x) => CMP[x.c][2] === conf)
        ).filter((x) => x.n !== g.club.n && !ct.used.includes(x.n));
        const opp = pickW(pool, (x) =>
          ct.kind === 'cup'
            ? x.t === 1
              ? 1 + ki
              : x.t === 2
                ? 2
                : Math.max(0.6, 2.2 - ki * 0.3)
            : topC
              ? x.t === 1
                ? 3
                : x.t === 2
                  ? 2
                  : 1
              : x.t === 1
                ? 1
                : 2,
        );
        ct.used.push(opp.n);
        const me =
            LV[t] +
            (ov - LV[t]) * 0.25 +
            (g.form || 0) * 1.2 +
            (sk.d + sk.e) * 0.2 +
            (g.pb || 0) * 7,
          so = LV[opp.t] + ri(-3, 3) + (ko ? Math.max(0, ki) * 0.7 : 0),
          d = me - so;
        const pd = (ko ? 0.2 : 0.22) * Math.exp(-Math.pow(d / 12, 2)),
          pw = (1 - pd) * SG(d / 6),
          pl = Math.max(0, 1 - pd - pw);
        const rp = { Figura: 0.97, Titular: 0.93, Rotación: 0.6, Suplente: 0.25 }[g.s.role],
          start = rnd() < (rp == null ? 0.5 : rp);
        ct.m = { opp: opp.n, start, d };
        return {
          t: `${ct.name} · ${ct.st[i]}`,
          h:
            `${g.club.n} vs ${opp.n}. ${start ? 'Sos titular.' : 'Arrancás desde el banco.'}` +
            ((g.pb || 0) > 0
              ? ' Tu penal le dio ventaja al equipo.'
              : (g.pb || 0) < 0
                ? ' El penal fallado pesa en el equipo.'
                : ''),
          e: [
            { l: 'Gana', v: 'w', w: pw },
            { l: ko ? 'Penales' : 'Empata', v: 'd', w: pd },
            { l: 'Pierde', v: 'l', w: pl },
          ],
        };
      }
      case 'natl': {
        const cs = ov - natThr() - (g.age < 19 ? 4 : 0),
          pc = SG((cs + 2) / 4),
          yt = (g.year + 1) % 4,
          wc = yt === 2,
          rg = yt === 0,
          reg = regOf(g.nat);
        const e = [
          { l: 'No convocado', v: 'no', w: 1 - pc },
          { l: 'Amistosos', v: 'fr', w: pc * (wc || rg ? 0.35 : 1) },
        ];
        if (wc) e.push({ l: 'Mundial', v: 'wc', w: pc * 0.65 });
        else if (rg) e.push({ l: 'Copa regional', v: 'cup', w: pc * 0.65 });
        return {
          t: 'Ruleta de la selección',
          h: wc
            ? `Este año se juega el Mundial. ¿Te convoca ${g.nat}?`
            : rg
              ? `Este año se juega la ${reg}. ¿Te convoca ${g.nat}?`
              : `Sin torneos grandes este año: solo amistosos con ${g.nat}.`,
          e,
        };
      }
      case 'ntm': {
        const nt = g.nt,
          i = nt.i,
          ko = nt.kind !== 'fr' && i >= 3,
          SS = { 1: 80, 2: 72, 3: 64 };
        const pool = ko
          ? NATS.filter((n) => n !== g.nat && NT(n) <= 2)
          : NATS.filter((n) => n !== g.nat);
        const opp = pool[ri(0, pool.length - 1)],
          So = SS[NT(opp)] + ri(-3, 3),
          St = SS[NT(g.nat)],
          d = St + (ov - St) * 0.12 - So + (g.pb || 0) * 7;
        const pd = (ko ? 0.2 : 0.22) * Math.exp(-Math.pow(d / 12, 2)),
          pw = (1 - pd) * SG(d / 6),
          pl = Math.max(0, 1 - pd - pw);
        const start = rnd() < clamp(SG((ov - natThr() + 3) / 4), 0.1, 0.97);
        nt.m = { opp, start, d };
        return {
          t: nt.kind === 'fr' ? `Amistoso ${i + 1} de ${nt.n}` : `${nt.comp} · ${nt.st[i]}`,
          h: `${g.nat} vs ${opp}. ${start ? 'Sos titular.' : 'Arrancás desde el banco.'}`,
          e: [
            { l: 'Gana', v: 'w', w: pw },
            { l: ko ? 'Penales' : 'Empata', v: 'd', w: pd },
            { l: 'Pierde', v: 'l', w: pl },
          ],
        };
      }
      case 'award': {
        const bdo = ov >= 89 ? (ov >= 94 ? 2 : 1) : 0,
          xi = clamp(Math.round(3 + (ov - 83) * 0.7), 3, 10);
        return {
          t: 'Ruleta de premios',
          h: 'Con tu nivel, los premios individuales entran en juego.',
          e: [
            { l: 'Mejor del mundo', v: 'bdo', w: bdo },
            { l: 'Equipo ideal', v: 'xi', w: xi },
            { l: 'Nada', v: 'no', w: 20 - bdo - xi },
          ],
        };
      }
      case 'progress': {
        const mu0 = muAge(g.age, g.pos);
        let mu = mu0;
        if (g.age < 29) {
          const room = g.pot - ov;
          if (room <= 0) mu = Math.min(mu, 0.3);
          else if (room < 3) mu = Math.min(mu, 1);
          else if (room > 10) mu += 0.6;
        }
        const sg = g.age < 24 ? 1.8 : 1.5,
          e = [];
        for (let d = -5; d <= 7; d++)
          e.push({
            l: (d > 0 ? '+' : '') + d,
            v: d,
            w: Math.exp(-0.5 * Math.pow((d - mu) / sg, 2)),
          });
        return {
          t: 'Ruleta de evolución',
          h:
            g.age < 24
              ? 'Todavía estás creciendo.'
              : g.age < 30
                ? 'Estás en tu mejor momento.'
                : 'El físico empieza a pesar.',
          e,
        };
      }
      case 'offers': {
        const A =
          ov -
          55 -
          (g.pos === 'POR' ? Math.max(0, g.age - 34) * 2 : Math.max(0, g.age - 31) * 2.5) +
          (g.age < 22 ? (22 - g.age) * 3 : 0) +
          Math.min(3, g.scout || 0) * 4;
        const w0 = 1 / (1 + Math.exp((A + 4) / 5));
        const c = [
            Math.max(6, 40 - A * 0.9),
            30,
            Math.max(4, 8 + A * 0.5),
            Math.max(1, A * 0.35 - 3),
          ],
          cs = c.reduce((a, b) => a + b, 0);
        const e = [{ l: 'Sin ofertas', v: 0, w: w0 * 100 }];
        c.forEach((x, i) =>
          e.push({
            l: i + 1 + (i ? ' ofertas' : ' oferta'),
            v: i + 1,
            w: ((1 - w0) * 100 * x) / cs,
          }),
        );
        return {
          t: 'Ruleta de contratos',
          h: `Se terminó tu contrato. A los ${g.age} años y con media ${ov}, la ruleta dice cuántos clubes te llaman. Si sale “Sin ofertas”, se acaba la carrera.`,
          e,
        };
      }
    }
  }

  function addTrophy(n, y, nt) {
    G.trophies.push({ n, y, nt: nt ? 1 : 0, club: nt ? '' : G.club.n });
  }

  function apply(id, sl) {
    const g = G,
      s = g.s;
    switch (id) {
      case 'pot':
        g.pot = sl.v;
        g.potL = sl.l;
        return 'Potencial: ' + sl.l;
      case 'ovr0':
        g.ovr = sl.v;
        g.peak = sl.v;
        return 'Debutás con media ' + sl.v;
      case 'role':
        {
          s.games = sl.v;
          s.role = sl.l;
          const ex = [];
          if (sl.l !== 'Lesión') {
            const ok = evPool(sl.l);
            if (ok.length && rnd() < 0.75) {
              g.evi = EV.indexOf(ok[ri(0, ok.length - 1)]);
              ex.push('event');
            }
            if (sl.v >= 9 && rnd() < 0.55) {
              g.rival = RIV[g.club.n] || '';
              ex.push('clasico');
            }
          }
          if (ex.length) g.queue.splice(g.qi + 1, 0, ...ex);
        }
        return sl.l === 'Lesión' ? `Lesión grave: ${sl.v} partidos` : `${sl.l}: ${sl.v} partidos`;
      case 'evres': {
        const o = EV[g.evi].c[g.evc][2][sl.v],
          e = applyFx(o);
        return o.n + (fx(e) ? ' ' + fx(e) + '.' : '');
      }
      case 'trainres': {
        const k = TRK[g.trk],
          o = {};
        o[k] = sl.v;
        applyFx(o);
        const now = k === 's' ? g.stam : g.sk[k];
        return `${trNames(g.pos === 'POR')[g.trk]}: ${sl.v > 0 ? '+' : ''}${sl.v} (ahora ${now})`;
      }
      case 'goals':
        s.g = sl.v + (s.bg || 0);
        return `${s.g} ${s.g === 1 ? 'gol' : 'goles'}` + (s.bg ? ' (con el de tiro libre)' : '');
      case 'assists':
        s.a = sl.v;
        return `${sl.v} ${sl.v === 1 ? 'asistencia' : 'asistencias'}`;
      case 'saves':
        s.sv = sl.v + (s.bs || 0);
        return `${s.sv} atajadas`;
      case 'clean':
        s.cs = sl.v;
        return `${sl.v} ${sl.v === 1 ? 'valla invicta' : 'vallas invictas'}`;
      case 'league': {
        const B = [
            [1, 1],
            [2, 3],
            [4, 6],
            [7, 9],
            [10, 14],
            [15, 18],
          ][sl.v],
          pos = ri(B[0], B[1]),
          lg = CMP[g.club.c][0];
        s.pos = pos;
        s.lg = pos === 1 ? 'Campeón: ' + lg : pos + '° en ' + lg;
        if (pos === 1) addTrophy(lg, seasonLabel(g.year));
        g.contNext = qual(g.club.c, pos);
        g.form = clamp(
          (g.form || 0) * 0.5 +
            (pos === 1 ? 2 : pos <= 3 ? 1 : pos <= 9 ? 0 : pos <= 14 ? -0.5 : -1.5),
          -3,
          3,
        );
        if (s.role !== 'Lesión' && rnd() < 0.35) {
          const ok = evPool(s.role);
          if (ok.length) {
            g.evi = EV.indexOf(ok[ri(0, ok.length - 1)]);
            g.queue.splice(g.qi + 1, 0, 'event');
          }
        }
        return (
          (pos === 1 ? `¡Campeón de ${lg}!` : `Terminaste ${pos}° en ${lg}.`) +
          (g.contNext
            ? ` Clasificás a ${CN[g.contNext]}.`
            : ' No clasificás a copas internacionales.')
        );
      }
      case 'cm': {
        const ct = g.ct,
          m = ct.m,
          i = ct.i,
          ko = ct.kind === 'cup' || i >= 3,
          gk = g.pos === 'POR',
          pick = (a) => a[ri(0, a.length - 1)];
        let res = sl.v,
          pens = '',
          gf,
          ga;
        if (res === 'd' && ko) {
          const win = rnd() < clamp(0.5 + m.d / 50, 0.25, 0.75);
          res = win ? 'w' : 'l';
          pens = win ? ' (ganan por penales)' : ' (pierden por penales)';
        }
        if (pens) gf = ga = pick([0, 1, 1, 2]);
        else if (res === 'w') {
          gf = pick([1, 1, 2, 2, 2, 3, 4]);
          ga = ri(0, gf - 1);
        } else if (res === 'l') {
          ga = pick([1, 1, 2, 2, 2, 3, 4]);
          gf = ri(0, ga - 1);
        } else {
          gf = ga = pick([0, 0, 1, 1, 2]);
        }
        const games = Math.max(1, s.games),
          lam = clamp(s.g / games, 0, 1.3),
          lamA = clamp(s.a / games, 0, 1.3),
          f = m.start ? 1 : 0.5;
        let myG = 0,
          myA = 0,
          parts = [];
        if (!gk) {
          for (let k = 0; k < gf; k++) {
            if (rnd() < clamp(lam / 1.6, 0.02, 0.7) * f) myG++;
            else if (rnd() < clamp(lamA / 1.6, 0.02, 0.5) * f) myA++;
          }
          if (myG) parts.push(myG + (myG === 1 ? ' gol' : ' goles'));
          if (myA) parts.push(myA + (myA === 1 ? ' asistencia' : ' asistencias'));
          if (!parts.length) parts.push('sin aportes');
        } else if (m.start) {
          parts.push(
            ga === 0 ? 'valla invicta' : ga + (ga === 1 ? ' gol en contra' : ' goles en contra'),
          );
          parts.push(ri(1, 6) + ' atajadas');
        } else parts.push('sin minutos de peso');
        ct.pts += res === 'w' ? 3 : res === 'd' ? 1 : 0;
        ct.i++;
        let more = false,
          tail = '',
          out = '';
        if (ct.kind === 'cont' && i < 3) {
          if (ct.i < 3) more = true;
          else if (ct.pts >= 4 || (ct.pts === 3 && rnd() < 0.35)) {
            more = true;
            tail = ` Pasan de fase con ${ct.pts} puntos: ${ct.st[3].toLowerCase()}.`;
          } else {
            tail = ` Eliminados en fase de grupos con ${ct.pts} puntos.`;
            out = 'fase de grupos';
          }
        } else if (res === 'l') {
          tail = ` Eliminados en ${ct.st[i].toLowerCase()}.`;
          out = ct.st[i] === 'Final' ? 'finalista' : 'eliminado en ' + ct.st[i].toLowerCase();
        } else if (i === ct.st.length - 1) {
          addTrophy(ct.name, seasonLabel(g.year));
          tail = ` ¡Campeones de ${ct.name}!`;
          out = 'campeon';
        } else {
          more = true;
          tail = ` Pasan a ${ct.st[i + 1].toLowerCase()}.`;
        }
        (g.ntlog = g.ntlog || []).push({
          label: ct.st[i],
          opp: m.opp,
          txt: `${gf}-${ga}${pens ? ' (pen.)' : ''}`,
          res: res === 'w' ? 'V' : res === 'l' ? 'D' : 'E',
          note: parts.join(', '),
        });
        g.pb = 0;
        g.penSeen = false;
        if (more) g.queue.splice(g.qi + 1, 0, 'cm');
        else {
          const key = ct.kind === 'cup' ? 'cp' : 'ct';
          s[key] = out === 'campeon' ? 'Campeón: ' + ct.name : `${ct.name}: ${out}`;
          g.ct = null;
        }
        return `${res === 'w' ? 'Victoria' : res === 'l' ? 'Derrota' : 'Empate'} ${gf}-${ga} vs ${m.opp}${pens}. ${m.start ? 'Titular' : 'Suplente'}: ${parts.join(', ')}.${tail}`;
      }
      case 'natl': {
        if (sl.v === 'no') return 'No te convocaron a la selección';
        const kind = sl.v,
          comp = kind === 'fr' ? 'Amistosos' : kind === 'wc' ? 'Copa del Mundo' : regOf(g.nat);
        const grp = ['Fase de grupos 1', 'Fase de grupos 2', 'Fase de grupos 3'],
          KO = ['Octavos de final', 'Cuartos de final', 'Semifinal', 'Final'];
        const n = kind === 'fr' ? ri(2, 3) : 0;
        g.nt = {
          comp,
          kind,
          i: 0,
          pts: 0,
          n,
          m: null,
          st: kind === 'fr' ? [] : kind === 'wc' ? grp.concat(KO) : grp.concat(KO.slice(1)),
        };
        g.ntlog = [];
        g.ntT = g.nat + ' · ' + comp;
        g.queue.splice(g.qi + 1, 0, 'ntm');
        return kind === 'fr'
          ? `Convocado para ${n} amistosos con ${g.nat}`
          : `Convocado a ${kind === 'wc' ? 'la Copa del Mundo' : 'la ' + comp}`;
      }
      case 'ntm': {
        const nt = g.nt,
          m = nt.m,
          i = nt.i,
          ko = nt.kind !== 'fr' && i >= 3,
          gk = g.pos === 'POR',
          pick = (a) => a[ri(0, a.length - 1)];
        let res = sl.v,
          pens = '',
          gf,
          ga;
        if (res === 'd' && ko) {
          const win = rnd() < clamp(0.5 + m.d / 50, 0.25, 0.75);
          res = win ? 'w' : 'l';
          pens = win ? ' (ganan por penales)' : ' (pierden por penales)';
        }
        if (pens) {
          gf = ga = pick([0, 1, 1, 2]);
        } else if (res === 'w') {
          gf = pick([1, 1, 2, 2, 2, 3, 4]);
          ga = ri(0, gf - 1);
        } else if (res === 'l') {
          ga = pick([1, 1, 2, 2, 2, 3, 4]);
          gf = ri(0, ga - 1);
        } else {
          gf = ga = pick([0, 0, 1, 1, 2]);
        }
        const games = Math.max(1, s.games),
          lam = clamp(s.g / games, 0, 1.3),
          lamA = clamp(s.a / games, 0, 1.3),
          f = m.start ? 1 : 0.5;
        let myG = 0,
          myA = 0,
          parts = [];
        if (!gk) {
          for (let k = 0; k < gf; k++) {
            if (rnd() < clamp(lam / 1.6, 0.02, 0.7) * f) myG++;
            else if (rnd() < clamp(lamA / 1.6, 0.02, 0.5) * f) myA++;
          }
          if (myG) parts.push(myG + (myG === 1 ? ' gol' : ' goles'));
          if (myA) parts.push(myA + (myA === 1 ? ' asistencia' : ' asistencias'));
          if (!parts.length) parts.push('sin aportes');
        } else if (m.start) {
          parts.push(
            ga === 0 ? 'valla invicta' : ga + (ga === 1 ? ' gol en contra' : ' goles en contra'),
          );
          parts.push(ri(1, 6) + ' atajadas');
        } else parts.push('sin minutos de peso');
        g.caps++;
        g.ntg += myG;
        g.nta += myA;
        nt.pts += res === 'w' ? 3 : res === 'd' ? 1 : 0;
        nt.i++;
        let more = false,
          tail = '';
        if (nt.kind === 'fr') more = nt.i < nt.n;
        else if (i < 3) {
          if (nt.i < 3) more = true;
          else if (nt.pts >= 4 || (nt.pts === 3 && rnd() < 0.35)) {
            more = true;
            tail = ` Pasan de fase con ${nt.pts} puntos: ${nt.st[3]}.`;
          } else tail = ` Eliminados en fase de grupos con ${nt.pts} puntos.`;
        } else if (res === 'l') tail = ` Eliminados en ${nt.st[i].toLowerCase()}.`;
        else if (i === nt.st.length - 1) {
          addTrophy(nt.comp, String(g.year + 1), 1);
          tail = ` ¡Campeones de la ${nt.comp}!`;
        } else {
          more = true;
          tail = ` Pasan a ${nt.st[i + 1].toLowerCase()}.`;
        }
        (g.ntlog = g.ntlog || []).push({
          label: nt.kind === 'fr' ? `Amistoso ${i + 1}` : nt.st[i],
          opp: m.opp,
          txt: `${gf}-${ga}${pens ? ' (pen.)' : ''}`,
          res: res === 'w' ? 'V' : res === 'l' ? 'D' : 'E',
          note: parts.join(', '),
        });
        g.pb = 0;
        g.penSeen = false;
        if (more) g.queue.splice(g.qi + 1, 0, 'ntm');
        else g.nt = null;
        return `${res === 'w' ? 'Victoria' : res === 'l' ? 'Derrota' : 'Empate'} ${gf}-${ga} vs ${m.opp}${pens}. ${m.start ? 'Titular' : 'Suplente'}: ${parts.join(', ')}.${tail}`;
      }
      case 'award':
        if (sl.v === 'bdo') {
          g.tot.bdo++;
          s.award = 'Mejor del mundo';
        } else if (sl.v === 'xi') {
          g.tot.xi++;
          s.award = 'Equipo ideal';
        }
        return sl.v === 'no' ? 'Sin premios este año' : s.award;
      case 'progress': {
        const b = g.ovr,
          d = sl.v,
          T = g.tot;
        g.ovr = clamp(b + d, 35, 99);
        g.peak = Math.max(g.peak, g.ovr);
        T.pj += s.games;
        T.g += s.g;
        T.a += s.a;
        T.sv += s.sv;
        T.cs += s.cs;
        g.earn += g.contract.sal;
        s.res = [s.lg, s.cp, s.ct].filter(Boolean).join(' · ');
        g.hist.push({
          y: g.year,
          age: g.age,
          club: g.club.n,
          c: g.club.c,
          b,
          a: g.ovr,
          pj: s.games,
          g: s.g,
          as: s.a,
          sv: s.sv,
          cs: s.cs,
          res: s.res,
          aw: s.award,
          role: s.role,
        });
        g.lastRole = s.role;
        g.contQ = g.contNext || null;
        g.contNext = null;
        g.ntlog = null;
        g.age++;
        g.year++;
        g.season++;
        g.contract.y--;
        g.after = g.contract.y <= 0 ? 'offers' : 'season';
        return `Media ${b} → ${g.ovr} (${d > 0 ? '+' : ''}${d})`;
      }
      case 'offers':
        g.k = sl.v;
        g.scout = 0;
        return sl.v ? `${sl.l}` : 'Sin ofertas';
    }
  }

  function startCT(kind) {
    const g = G,
      name = kind === 'cup' ? CMP[g.club.c][1] : CN[g.contQ];
    const KO = ['Octavos de final', 'Cuartos de final', 'Semifinal', 'Final'];
    g.ct = {
      kind,
      name,
      i: 0,
      pts: 0,
      used: [],
      m: null,
      st:
        kind === 'cup'
          ? KO
          : ['Fase de grupos 1', 'Fase de grupos 2', 'Fase de grupos 3'].concat(KO),
    };
    g.ntlog = [];
    g.ntT = name;
  }

  function applyPenal(res) {
    const g = G,
      s = g.s,
      gk = g.pos === 'POR',
      nt = g.penCtx === 'nt';
    let o = {},
      txt = '',
      extra = '';
    if (gk) {
      if (res === 'save') {
        g.pb = 1;
        o = { t: 1 };
        txt = '¡Atajaste el penal!';
        if (!nt) {
          s.sv += 1;
          extra = ' +1 atajada.';
        }
      } else if (res === 'goal') {
        g.pb = -1;
        txt = 'Te convirtieron el penal.';
      } else {
        g.pb = 0;
        txt = 'El penal se fue afuera.';
      }
    } else {
      if (res === 'goal') {
        g.pb = 1;
        o = { t: 1 };
        txt = '¡Gol de penal!';
        if (nt) {
          g.ntg++;
          extra = ' +1 gol con la selección.';
        } else {
          s.g += 1;
          extra = ' +1 gol.';
        }
      } else {
        g.pb = -1;
        o = { t: -1 };
        txt =
          {
            save: 'El arquero atajó el penal.',
            wide: 'El penal se fue afuera.',
            short: 'El penal se quedó corto.',
          }[res] || 'Fallaste el penal.';
      }
    }
    const e = applyFx(o);
    return (
      txt +
      (fx(e) ? ' ' + fx(e) + '.' : '') +
      extra +
      (g.pb > 0
        ? ' Tu equipo llega con ventaja al partido.'
        : g.pb < 0
          ? ' Tu equipo lo siente en el partido.'
          : '')
    );
  }

  /* resultado del partido clave (clásico) */

  function applyMini(res) {
    const g = G,
      s = g.s,
      gk = g.pos === 'POR';
    let o = {},
      txt = '',
      extra = '';
    if (gk) {
      if (res === 'save') {
        s.bs = (s.bs || 0) + 1;
        o = { t: 1 };
        txt = '¡Atajaste el penal en el clásico!';
        extra = ' +1 atajada.';
      } else if (res === 'goal') {
        o = { t: -1 };
        txt = 'Te hicieron el gol de penal.';
      } else txt = 'El penal se fue afuera.';
    } else {
      if (res === 'goal') {
        s.bg = (s.bg || 0) + 1;
        o = { t: 1 };
        txt = '¡Gol de tiro libre en el clásico!';
        extra = ' +1 gol.';
      } else {
        o = { t: -1 };
        txt =
          {
            wall: 'La pelota pegó en la barrera.',
            save: 'El arquero la sacó.',
            wide: 'Se fue afuera.',
            short: 'Se quedó corta.',
          }[res] || 'No salió.';
      }
    }
    const e = applyFx(o);
    return txt + (fx(e) ? ' ' + fx(e) + '.' : '') + extra;
  }

  /* ---------- noticias (pop-up de diario) ----------
   Salen como máximo 2 por temporada (G.s.nw). Las noticias "extra" (clásico y
   convocatoria a la selección) no cuentan para ese tope.
   Cada noticia viene como [titular, bajada, cuerpo]; {llaves} se reemplazan en fill(). */
  const PAPERS = [
    'La Crónica Deportiva',
    'El Vestuario',
    'Diario Pelota',
    'Tribuna del Hincha',
    'La Voz del Fútbol',
    'Gol & Pizarra',
  ];
  const SCOUT = 'llamando la atención de ojeadores de importantes clubes locales y de otros países';
  const NW = {
    doblete: [
      [
        '¡{who} marcó un doblete ante {rival}!',
        'Se destacó en la victoria y ya suena fuerte en el mercado.',
        'Con dos goles frente a {rival}, {name} fue la figura de la cancha de {club}, ' +
          SCOUT +
          '.',
      ],
      [
        'Doblete de {name} y {club} festeja',
        '{rival} no pudo con el juvenil de la fecha.',
        'Dos goles, mucha personalidad y una actuación que no pasó desapercibida: {name} se destacó ante {rival}, ' +
          SCOUT +
          '.',
      ],
    ],
    goleador: [
      [
        '{name} ya lleva {g} goles y no para',
        'El goleador de {club} es la sensación de la {liga}.',
        'Con {g} tantos en la temporada, {name} se instaló entre los máximos artilleros y ahora lo siguen ojeadores de varios países.',
      ],
    ],
    asist: [
      [
        '{name}, el socio perfecto: {a} asistencias',
        'Cada pase suyo parece gol.',
        'La temporada de {name} en {club} deslumbra por su visión de juego: {a} asistencias, ' +
          SCOUT +
          '.',
      ],
    ],
    atajadas: [
      [
        '¡{name} es una muralla! Ya suma {sv} atajadas',
        'El arco de {club} está en las mejores manos.',
        'Con {sv} atajadas en la temporada, {name} se volvió el gran protagonista de {club}, ' +
          SCOUT +
          '.',
      ],
    ],
    vallas: [
      [
        '{name} dejó su arco en cero ante {rival}',
        '{cs} vallas invictas y contando.',
        'Otra tarde sin goles en contra para {club}. {name} acumula {cs} vallas invictas, ' +
          SCOUT +
          '.',
      ],
    ],
    titular: [
      [
        '{name} se adueñó del puesto en {club}',
        'Ya nadie discute su lugar en el equipo.',
        'El cuerpo técnico lo tiene claro: {name} es una de las figuras de {club} y su confianza crece partido a partido.',
      ],
    ],
    lesion: [
      [
        'Mala noticia: {name} sufrió una lesión grave',
        'Estará varios partidos afuera.',
        'El parte médico de {club} confirmó que {name} se perderá buena parte de la temporada. Ahora llega el momento de recuperarse.',
      ],
    ],
    titulo: [
      [
        '¡{club} campeón! {name} levantó el trofeo',
        '{trofeo}: una noche para el recuerdo.',
        'Festejo total. {club} se quedó con {trofeo} y {name} fue parte de la gloria, ' +
          SCOUT +
          '.',
      ],
      [
        '{name} ya tiene su primera gran página en la historia',
        'Campeón de {trofeo}.',
        'Con {club} se quedaron con {trofeo} y el nombre de {name} se escucha cada vez más lejos.',
      ],
    ],
    titulo_nt: [
      [
        '¡{nat} campeón! {name} es parte de la historia',
        '{trofeo}: el país entero lo festeja.',
        'Con {name} en el plantel, {nat} se quedó con {trofeo}. Un título que ningún hincha va a olvidar.',
      ],
    ],
    crisis: [
      [
        'Temporada para el olvido en {club}',
        'El equipo terminó en la zona baja de la {liga}.',
        'Los hinchas de {club} piden cambios. {name} tendrá que demostrar que puede dar un paso adelante.',
      ],
    ],
    proyeccion: [
      [
        '{name}, la gran proyección de la {liga}',
        'Dio un salto enorme este año.',
        'Los especialistas coinciden: {name} creció muchísimo en esta temporada, ' + SCOUT + '.',
      ],
    ],
    declive: [
      [
        '{name} bajó su nivel y preocupa',
        'Una temporada con más dudas que certezas.',
        'En {club} esperan que {name} se recupere pronto: su rendimiento cayó respecto del año pasado.',
      ],
    ],
    clasico_ok: [
      [
        '¡{name} fue héroe en el clásico ante {rival}!',
        'La tarde que {club} no va a olvidar.',
        'En el partido más caliente del año, {name} se vistió de figura y la gente de {club} lo ovacionó de pie.',
      ],
    ],
    clasico_mal: [
      [
        'Clásico amargo para {name}',
        '{rival} se llevó el partido de los nervios.',
        'Una chance clave se escapó en el clásico ante {rival}. {name} dejó la cancha en silencio.',
      ],
    ],
    natl_wc: [
      [
        '¡{name} fue convocado al Mundial con {nat}!',
        'Sueño cumplido.',
        'El técnico de {nat} confirmó la lista: {name} viajará a la Copa del Mundo. Todo el país sigue de cerca su camino.',
      ],
    ],
    natl_reg: [
      [
        '{name} fue llamado a la selección de {nat}',
        'Va a disputar la {copa}.',
        'El cuerpo técnico de {nat} lo incluyó en la lista para la {copa}. Su carrera da un nuevo paso.',
      ],
    ],
    natl_fr: [
      [
        '{name} recibió su llamado a la selección de {nat}',
        'Estará en los próximos amistosos.',
        'Con buenas actuaciones en {club}, {name} se ganó una convocatoria con {nat}.',
      ],
    ],
  };
  const NOUN = { DEL: 'delantero', MED: 'mediocampista', DEF: 'defensor', POR: 'arquero' };
  const pk = (a) => a[ri(0, a.length - 1)];

  function randClub(local) {
    const pool = ALL.filter((c) => c.n !== G.club.n && (!local || c.c === G.club.c));
    return pk(pool.length ? pool : ALL.filter((c) => c.n !== G.club.n)).n;
  }

  function fill(str, v) {
    return str.replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  }

  /* Crea una noticia. extra: no cuenta para el tope de 2 por temporada.
   scout: suma interés de ojeadores (más chances en la ruleta de contratos).
   trust: cambio de confianza del DT. */
  function pushNews(type, extra, year, v0, o) {
    const g = G,
      s = g.s,
      v = Object.assign(
        {
          name: g.name,
          club: g.club.n,
          rival: randClub(true),
          nat: g.nat,
          liga: CMP[g.club.c][0],
          who:
            (g.age <= 21 ? 'El joven ' : g.age >= 33 ? 'El veterano ' : 'El ' + NOUN[g.pos] + ' ') +
            g.name,
        },
        v0 || {},
      );
    o = o || {};
    const t = pk(NW[type]),
      lines = [];
    if (o.scout) {
      g.scout = Math.min(3, (g.scout || 0) + 1);
      lines.push('Ojeadores te siguen: más chances en la próxima ruleta de contratos.');
    }
    if (o.trust) {
      const e = applyFx({ t: o.trust });
      if (fx(e)) lines.push(fx(e) + '.');
    }
    if (!extra) s.nw = (s.nw || 0) + 1;
    g.news = g.news || [];
    g.news.push({
      extra: extra ? 1 : 0,
      paper: pk(PAPERS),
      date: 'Edición ' + seasonLabel(year),
      h: fill(t[0], v),
      d: fill(t[1], v),
      b: fill(t[2], v),
      fx: lines.join(' '),
    });
  }

  /* Decide si el último paso merece una noticia. tb = cantidad de trofeos antes del paso.
   Las noticias "menores" necesitan que no haya salido ninguna en la temporada;
   las "mayores" (títulos, lesión, saltos grandes) entran hasta completar las 2. */
  function newsAfter(id, sl, tb) {
    const g = G,
      s = g.s,
      ex = s.ex || {},
      nw = s.nw || 0,
      minor = nw < 1,
      major = nw < 2,
      yr = id === 'progress' ? g.year - 1 : g.year;
    const go = (type, extra, v, o) => pushNews(type, extra, yr, v, o);

    // Selección y clásico: noticias extra.
    if (id === 'natl' && sl.v !== 'no') {
      const k = sl.v;
      return go(k === 'wc' ? 'natl_wc' : k === 'fr' ? 'natl_fr' : 'natl_reg', true, {
        copa: g.nt ? g.nt.comp : 'selección',
      });
    }
    if (id === 'clasico') {
      const ok = g.pos === 'POR' ? sl.res === 'save' : sl.res === 'goal';
      return go(ok ? 'clasico_ok' : 'clasico_mal', true, { rival: g.rival || randClub(true) });
    }

    // Títulos: los más importantes.
    if (g.trophies.length > tb && major) {
      const t = g.trophies[g.trophies.length - 1];
      return go(t.nt ? 'titulo_nt' : 'titulo', false, { trofeo: t.n }, { scout: !t.nt });
    }
    if (id === 'role' && s.role === 'Lesión' && major && rnd() < 0.9) return go('lesion', false);
    if (id === 'league' && sl.v === 5 && major && rnd() < 0.8)
      return go('crisis', false, null, { trust: -1 });
    if (id === 'progress') {
      if (sl.v >= 3 && g.age <= 25 && major && rnd() < 0.8)
        return go('proyeccion', false, null, { scout: true });
      if (sl.v <= -3 && major && rnd() < 0.7) return go('declive', false);
    }

    // Menores: rendimiento de la temporada.
    if (!minor) return;
    if (id === 'goals' && g.pos !== 'POR' && s.g >= 2 && (s.g >= 6 || s.g >= (ex.g || 99) * 1.3)) {
      if (rnd() < 0.7)
        return go(s.g >= 12 ? 'goleador' : 'doblete', false, { g: s.g }, { scout: true });
    }
    if (id === 'assists' && s.a >= 6 && s.a >= (ex.a || 99) * 1.3 && rnd() < 0.5)
      return go('asist', false, { a: s.a }, { scout: true });
    if (id === 'saves' && s.sv >= (ex.sv || 999) * 1.15 && rnd() < 0.5)
      return go('atajadas', false, { sv: s.sv }, { scout: true });
    if (id === 'clean' && s.cs >= Math.max(4, (ex.cs || 99) * 1.25) && rnd() < 0.7)
      return go('vallas', false, { cs: s.cs }, { scout: true });
    if (id === 'role' && s.role === 'Figura' && rnd() < 0.5)
      return go('titular', false, null, { trust: 1 });
  }

  function showNews() {
    const n = G.news[0];
    $('#news-paper').textContent = n.paper;
    $('#news-date').textContent = n.date;
    $('#news-tag').hidden = !n.extra;
    $('#news-h').textContent = n.h;
    $('#news-d').textContent = n.d;
    $('#news-b').textContent = n.b;
    $('#news-fx').textContent = n.fx;
    $('#news-fx').hidden = !n.fx;
    $('#news').hidden = false;
    $('#news-close').focus();
  }

  function closeNews() {
    if ($('#news').hidden) return;
    $('#news').hidden = true;
    G.news.shift();
    save();
    next();
  }

  function genOffers(k) {
    const g = G,
      cur = ALL.find((c) => c.n === g.club.n),
      picked = [];
    const pr =
      { Figura: 0.55, Titular: 0.4, Rotación: 0.25, Suplente: 0.1, Lesión: 0.15 }[g.lastRole] ||
      0.3;
    if (k >= 1 && rnd() < pr) picked.push(cur);
    const pool = ALL.filter((c) => c !== cur);
    let guard = 0;
    while (picked.length < k && guard++ < 300) {
      const c = pickW(pool, (c) => {
        if (picked.includes(c)) return 0;
        const d = g.ovr - LV[c.t];
        let w = Math.exp(-Math.pow((d + 2) / 9, 2));
        if (g.age >= 33 && RETIRE.includes(c.c)) w *= 3;
        return w;
      });
      if (!picked.includes(c)) picked.push(c);
    }
    const yrs = () => (g.age < 31 ? ri(2, 5) : g.age < 35 ? ri(1, 3) : ri(1, 2));
    return picked.map((c) => ({ n: c.n, c: c.c, t: c.t, y: yrs(), sal: wage(g.ovr, c) }));
  }

  /* ---------- flujo ---------- */

  function showStep() {
    if (G.qi >= G.queue.length) return afterQueue();
    const id = G.queue[G.qi];
    if (id === 'cupstart' || id === 'contstart') {
      if (G.s.role === 'Lesión') {
        G.qi++;
        return showStep();
      }
      startCT(id === 'cupstart' ? 'cup' : 'cont');
      G.queue[G.qi] = 'cm';
      return showStep();
    }
    if ((id === 'cm' || id === 'ntm') && !G.penSeen) {
      G.penSeen = true;
      G.sincePen = (G.sincePen || 0) + 1;
      const pf = { DEL: 1, MED: 0.8, DEF: 0.45, POR: 0.7 }[G.pos] || 0.6;
      if (rnd() < clamp((0.04 + 0.035 * (G.sincePen - 1)) * pf, 0, 0.45)) {
        G.sincePen = 0;
        G.penCtx = id === 'ntm' ? 'nt' : 'cl';
        G.queue.splice(G.qi, 0, 'penal');
        return showStep();
      }
    }
    if (id === 'penal') {
      G.cur = {
        id,
        t: '¡Penal!',
        h:
          G.pos === 'POR'
            ? 'Penal en contra durante el partido. Elegí hacia dónde tirarte: si lo atajás, tu equipo gana confianza.'
            : 'Te cobran un penal a favor durante el partido. Trazá la línea de la pelota hacia el arco: si lo metés, tu equipo arranca mejor.',
        slots: [],
        idx: null,
        text: null,
      };
      save();
      return;
    }
    if (id === 'event') {
      const ev = EV[G.evi];
      G.cur = { id, t: ev.t, h: ev.x, slots: [], idx: null, text: null };
      save();
      return;
    }
    if (id === 'train') {
      G.cur = {
        id,
        t: 'Entrenamiento de la temporada',
        h: 'Elegí qué querés trabajar este año. La ruleta decide cuánto mejorás: va de -1 a +5.',
        slots: [],
        idx: null,
        text: null,
      };
      save();
      return;
    }
    if (id === 'clasico') {
      const vs = G.rival ? ' contra ' + G.rival : '';
      G.cur = {
        id,
        t: 'Partido clave',
        h:
          G.pos === 'POR'
            ? `Clásico${vs}. Penal en el último minuto: elegí hacia dónde tirarte.`
            : `Clásico${vs}. Tiro libre al borde del área: trazá vos la línea de la pelota y rodeá la barrera.`,
        slots: [],
        idx: null,
        text: null,
      };
      save();
      return;
    }
    const sp = spec(id);
    G.cur = {
      id,
      t: sp.t,
      h: sp.h,
      slots: buildSlots(sp.e, sp.min),
      idx: null,
      text: null,
    };
    save();
  }

  function pickEvent(i) {
    G.evc = i;
    G.queue.splice(G.qi + 1, 0, 'evres');
    G.qi++;
    showStep();
    render();
  }

  function pickTrain(i) {
    G.trk = i;
    G.queue.splice(G.qi + 1, 0, 'trainres');
    G.qi++;
    showStep();
    render();
  }

  function trainHTML() {
    const gk = G.pos === 'POR',
      nm = trNames(gk),
      sk = G.sk || {},
      cur = [sk.a, sk.b, sk.c, sk.d, G.stam, sk.e];
    return nm
      .map(
        (n, i) =>
          `<article class="offer"><div><h4>${esc(n)} <span class="tag" style="background:var(--line);color:var(--ink)">${cur[i] || 0}</span></h4><p>${TRH[gk ? 1 : 0][i]}</p></div><button class="btn small" type="button" data-tr="${i}">Entrenar</button></article>`,
      )
      .join('');
  }

  function retry() {
    const c = G.cur;
    if (
      !c ||
      c.idx == null ||
      !(G.rs > 0) ||
      spinning ||
      !c.snap ||
      c.id === 'event' ||
      c.id === 'train' ||
      c.id === 'clasico' ||
      c.id === 'penal'
    )
      return;
    const keep = { id: c.id, t: c.t, h: c.h, slots: c.slots, idx: null, text: null, snap: null };
    G = JSON.parse(c.snap);
    G.rs = 0;
    G.cur = keep;
    save();
    renderGame();
    spin();
  }

  function afterQueue() {
    if (G.debut) {
      G.debut = false;
      G.contract = { y: 2, sal: wage(G.ovr, G.club) };
      G.queue = seasonQueue();
    } else if (G.after === 'offers') G.queue = ['offers'];
    else {
      G.queue = seasonQueue();
      G.rs = 1;
    }
    if (G.debut === false && G.queue[0] === 'role') G.rs = 1;
    G.qi = 0;
    G.s = blankS();
    showStep();
  }

  function next() {
    if (G.news && G.news.length) return showNews();
    if (G.cur.id === 'offers') {
      if (G.k === 0)
        return endCareer(`Nadie te ofreció contrato. Colgaste los botines a los ${G.age} años.`);
      G.phase = 'choose';
      G.offers = genOffers(G.k);
      save();
      return render();
    }
    G.qi++;
    showStep();
    render();
  }

  function choose(i) {
    const o = G.offers[i];
    if (o.n !== G.club.n) {
      G.trust = 0;
      G.contQ = qualByTier(o.c, o.t);
    }
    G.club = { n: o.n, c: o.c, t: o.t };
    G.contract = { y: o.y, sal: o.sal };
    G.phase = 'play';
    G.offers = [];
    G.rs = 1;
    G.queue = seasonQueue();
    G.qi = 0;
    G.s = blankS();
    showStep();
    render();
  }

  function endCareer(msg) {
    G.phase = 'ended';
    G.reason = msg;
    G.cur = null;
    save();
    render();
  }

  function newGame() {
    const pos = document.querySelector('input[name=pos]:checked').value;
    const c = ALL.find((x) => x.n === $('#in-club').value);
    G = {
      name: $('#in-name').value.trim(),
      nat: $('#in-nat').value,
      pos,
      age: 16,
      year: 2026,
      season: 1,
      ovr: null,
      pot: null,
      potL: '',
      peak: 0,
      club: { n: c.n, c: c.c, t: c.t },
      contract: null,
      earn: 0,
      hist: [],
      tot: { pj: 0, g: 0, a: 0, sv: 0, cs: 0, lg: 0, cup: 0, cont: 0, bdo: 0, xi: 0 },
      s: blankS(),
      trust: 0,
      stam: 0,
      rs: 1,
      evi: null,
      evc: null,
      lastRole: '',
      sk: { a: 0, b: 0, c: 0 },
      trophies: [],
      caps: 0,
      ntg: 0,
      rival: '',
      nt: null,
      nta: 0,
      form: 0,
      contNext: null,
      contQ: qualByTier(c.c, c.t),
      queue: ['pot', 'ovr0'],
      qi: 0,
      debut: true,
      after: 'season',
      phase: 'play',
      k: 0,
      offers: [],
      cur: null,
      reason: '',
    };
    showStep();
    render();
  }

  /* ---------- ruleta ---------- */
  const cv = $('#wheel'),
    cx = cv.getContext('2d'),
    TP = Math.PI * 2;
  let rot = 0,
    hi = -1,
    spinning = false,
    AC = null;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function colors() {
    const cs = getComputedStyle(document.documentElement),
      g = (n) => cs.getPropertyValue(n).trim();
    return {
      slice: [1, 2, 3, 4].map((i) => g('--slice-' + i)),
      sliceText: [1, 2, 3, 4].map((i) => g('--slice-' + i + '-text')),
      ink: g('--ink'),
      hub: g('--surface'),
      gold: g('--gold'),
      bg: g('--bg'),
      pitch: g('--pitch'),
      kitMe: g('--kit-me'),
      kitRival: g('--kit-rival'),
      kitKeeper: g('--kit-keeper'),
    };
  }

  const slotP = (slots, i) => (slots[i].p != null ? slots[i].p : 1 / slots.length);

  function sliceStart(slots, i) {
    let a = 0;
    for (let k = 0; k < i; k++) a += slotP(slots, k);
    return a * TP;
  }

  const sliceColor = (i, n) => (n > 1 && i === n - 1 && i % 4 === 0 ? 2 : i % 4);

  function draw() {
    const slots = G && G.cur ? G.cur.slots : [];
    const dpr = window.devicePixelRatio || 1,
      size = cv.clientWidth || 320,
      px = Math.round(size * dpr);
    if (cv.width !== px) {
      cv.width = px;
      cv.height = px;
    }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, size, size);
    if (!slots.length) return;
    const C = colors(),
      n = slots.length,
      R = size / 2 - 6;

    // Ángulo inicial y ancho de cada porción (ya girada según `rot`).
    let cursor = rot - Math.PI / 2;
    const arcs = slots.map((s, i) => {
      const a0 = cursor,
        w = slotP(slots, i) * TP;
      cursor += w;
      return { a0, w };
    });

    cx.save();
    cx.translate(size / 2, size / 2);

    arcs.forEach(({ a0, w }, i) => {
      const ci = sliceColor(i, n);
      cx.beginPath();
      cx.moveTo(0, 0);
      cx.arc(0, 0, R, a0, a0 + w);
      cx.closePath();
      cx.fillStyle = C.slice[ci];
      cx.fill();
      cx.lineWidth = 1.5;
      cx.strokeStyle = C.bg;
      cx.stroke();

      if (w * R * 0.8 >= 12) {
        cx.save();
        cx.rotate(a0 + w / 2);
        cx.textAlign = 'right';
        cx.textBaseline = 'middle';
        cx.fillStyle = C.sliceText[ci];
        let fs = Math.max(13, size * 0.056);
        const maxW = R * 0.6;
        do {
          cx.font = `700 ${fs}px "Barlow Condensed","Arial Narrow",sans-serif`;
          fs -= 1;
        } while (cx.measureText(slots[i].l).width > maxW && fs > 9);
        cx.fillText(slots[i].l, R - 12, 0);
        cx.restore();
      }
    });

    if (hi >= 0 && !spinning) {
      arcs.forEach(({ a0, w }, i) => {
        if (i === hi) return;
        cx.beginPath();
        cx.moveTo(0, 0);
        cx.arc(0, 0, R, a0, a0 + w);
        cx.closePath();
        cx.fillStyle = 'rgba(0,0,0,.45)';
        cx.fill();
      });
      const { a0, w } = arcs[hi];
      cx.beginPath();
      cx.moveTo(0, 0);
      cx.arc(0, 0, R - 2, a0, a0 + w);
      cx.closePath();
      cx.lineWidth = 4;
      cx.strokeStyle = C.gold;
      cx.stroke();
    }

    cx.beginPath();
    cx.arc(0, 0, R, 0, TP);
    cx.lineWidth = 4;
    cx.strokeStyle = C.ink;
    cx.stroke();
    cx.beginPath();
    cx.arc(0, 0, R * 0.13, 0, TP);
    cx.fillStyle = C.hub;
    cx.fill();
    cx.lineWidth = 3;
    cx.strokeStyle = C.ink;
    cx.stroke();
    cx.restore();
  }

  /* Porción que apunta la flecha para un giro `r`. */
  function sliceAt(r, slots) {
    const a = (((-r % TP) + TP) % TP) / TP;
    let acc = 0;
    for (let i = 0; i < slots.length; i++) {
      acc += slotP(slots, i);
      if (a < acc) return i;
    }
    return slots.length - 1;
  }

  function tick() {
    if (!SET.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      const o = AC.createOscillator(),
        g = AC.createGain(),
        t = AC.currentTime;
      o.type = 'triangle';
      o.frequency.value = 650 + rnd() * 120;
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o.connect(g);
      g.connect(AC.destination);
      o.start(t);
      o.stop(t + 0.06);
    } catch (e) {}
  }

  function spin() {
    if (spinning || !G || !G.cur || G.cur.idx != null) return;
    const slots = G.cur.slots;
    // El resultado se elige según la probabilidad real de cada porción.
    let r = rnd(),
      idx = slots.length - 1;
    for (let i = 0; i < slots.length; i++) {
      r -= slotP(slots, i);
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    const u = 0.2 + rnd() * 0.6;
    const target = -(sliceStart(slots, idx) + u * slotP(slots, idx) * TP),
      R0 = rot;
    const turns = SET.fast ? 3 : ri(5, 7),
      delta = ((((target - R0) % TP) + TP) % TP) + TP * turns;
    const dur = reduce ? 500 : SET.fast ? 1300 : 4200,
      t0 = performance.now();
    let last = sliceAt(R0, slots);
    spinning = true;
    hi = -1;
    $('#result').textContent = '';
    setMain();
    function frame(now) {
      const t = Math.min(1, (now - t0) / dur),
        e = 1 - Math.pow(1 - t, 4);
      rot = R0 + delta * e;
      const s = sliceAt(rot, slots);
      if (s !== last) {
        last = s;
        tick();
      }
      draw();
      if (t < 1) requestAnimationFrame(frame);
      else done();
    }
    function done() {
      rot = target;
      spinning = false;
      hi = idx;
      {
        const { cur, ...rest } = G;
        G.cur.snap = JSON.stringify(rest);
      }
      G.cur.idx = idx;
      const tb = G.trophies.length;
      G.cur.text = apply(G.cur.id, G.cur.slots[idx]);
      newsAfter(G.cur.id, G.cur.slots[idx], tb);
      save();
      draw();
      renderGame(true);
    }
    requestAnimationFrame(frame);
  }

  const mc = $('#mini'),
    mx = mc.getContext('2d');
  let mg = { cur: null };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function roar() {
    if (!SET.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      const t = AC.currentTime,
        dur = 3.2,
        sr = AC.sampleRate,
        buf = AC.createBuffer(1, Math.floor(sr * dur), sr),
        d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1;
      const src = AC.createBufferSource();
      src.buffer = buf;
      const bp = AC.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 0.7;
      bp.frequency.setValueAtTime(450, t);
      bp.frequency.linearRampToValueAtTime(1500, t + 0.6);
      bp.frequency.linearRampToValueAtTime(700, t + dur);
      const g = AC.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.45, t + 0.3);
      g.gain.setValueAtTime(0.45, t + 1.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const lfo = AC.createOscillator(),
        lg = AC.createGain(),
        mod = AC.createGain();
      lfo.frequency.value = 3.2;
      lg.gain.value = 0.18;
      mod.gain.value = 0.8;
      lfo.connect(lg);
      lg.connect(mod.gain);
      src.connect(bp);
      bp.connect(mod);
      mod.connect(g);
      g.connect(AC.destination);
      src.start(t);
      lfo.start(t);
      src.stop(t + dur);
      lfo.stop(t + dur);
    } catch (e) {}
  }

  function mSize() {
    const dpr = window.devicePixelRatio || 1,
      w = mc.clientWidth || 320,
      h = mc.clientHeight || Math.round(w * 1.15);
    const pw = Math.round(w * dpr),
      ph = Math.round(h * dpr);
    if (mc.width !== pw || mc.height !== ph) {
      mc.width = pw;
      mc.height = ph;
    }
    mx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  function man(x, y, s, col) {
    mx.fillStyle = col;
    mx.strokeStyle = col;
    mx.lineCap = 'round';
    mx.beginPath();
    mx.arc(x, y - s * 1.35, s * 0.45, 0, TP);
    mx.fill();
    mx.lineWidth = s * 0.55;
    mx.beginPath();
    mx.moveTo(x, y - s * 0.8);
    mx.lineTo(x, y + s * 0.5);
    mx.stroke();
    mx.lineWidth = s * 0.3;
    mx.beginPath();
    mx.moveTo(x, y + s * 0.5);
    mx.lineTo(x - s * 0.4, y + s * 1.3);
    mx.moveTo(x, y + s * 0.5);
    mx.lineTo(x + s * 0.4, y + s * 1.3);
    mx.moveTo(x - s * 0.7, y - s * 0.5);
    mx.lineTo(x + s * 0.7, y - s * 0.5);
    mx.stroke();
  }

  function miniDraw() {
    const { w, h } = mSize(),
      C = colors(),
      X = (x) => x * w,
      Y = (y) => y * h,
      s = w * 0.024,
      fk = mg.kind === 'fk' || mg.kind === 'pk';
    mx.clearRect(0, 0, w, h);
    mx.fillStyle = C.pitch;
    mx.fillRect(0, 0, w, h);
    mx.fillStyle = 'rgba(255,255,255,.06)';
    for (let i = 1; i < 8; i += 2) mx.fillRect(0, (i * h) / 8, w, h / 8);
    mx.strokeStyle = 'rgba(255,255,255,.85)';
    mx.lineWidth = 2;
    mx.strokeRect(X(0.12), Y(0.02), X(0.76), Y(0.42));
    mx.strokeRect(X(0.3), Y(0.02), X(0.4), Y(0.14));
    mx.beginPath();
    mx.arc(X(0.5), Y(0.31), w * 0.17, 0.2 * Math.PI, 0.8 * Math.PI);
    mx.stroke();
    mx.fillStyle = 'rgba(255,255,255,.22)';
    mx.fillRect(X(0.34), Y(0.012), X(0.32), Y(0.058));
    mx.lineWidth = 4;
    mx.strokeRect(X(0.34), Y(0.012), X(0.32), Y(0.058));
    const ky = mg.kind === 'pen' ? 0.1 : 0.098;
    man(X(mg.kx == null ? 0.5 : mg.kx), Y(ky), s, mg.kind === 'pen' ? C.kitMe : C.kitKeeper);
    if (fk && mg.wall)
      for (let k = 0; k < 4; k++)
        man(X(mg.wall.x + (k - 1.5) * 0.062), Y(mg.wall.y), s, C.kitRival);
    if (mg.ball) {
      if (mg.sh) man(X(mg.sh.x), Y(mg.sh.y), s, mg.kind === 'pen' ? C.kitRival : C.kitMe);
      if (mg.pts && mg.pts.length > 1 && mg.phase === 'aim') {
        mx.strokeStyle = C.gold;
        mx.lineWidth = 3;
        mx.setLineDash([7, 5]);
        mx.beginPath();
        mx.moveTo(X(mg.pts[0].x), Y(mg.pts[0].y));
        mg.pts.forEach((p) => mx.lineTo(X(p.x), Y(p.y)));
        mx.stroke();
        mx.setLineDash([]);
      }
      mx.fillStyle = '#fff';
      mx.strokeStyle = '#14222c';
      mx.lineWidth = 1.5;
      mx.beginPath();
      mx.arc(X(mg.ball.x), Y(mg.ball.y), w * 0.013, 0, TP);
      mx.fill();
      mx.stroke();
    }
    mx.textAlign = 'center';
    mx.font = `700 ${Math.round(w * 0.05)}px "Barlow Condensed","Arial Narrow",sans-serif`;
    if (mg.phase === 'aim') {
      mx.fillStyle = 'rgba(0,0,0,.45)';
      mx.fillRect(0, h - w * 0.1, w, w * 0.1);
      mx.fillStyle = '#fff';
      mx.fillText(
        mg.hint ||
          (fk
            ? 'Trazá la línea desde la pelota: sigue en esa dirección'
            : 'Elegí hacia dónde tirarte'),
        w / 2,
        h - w * 0.035,
      );
    }
    if (mg.phase === 'done' && mg.res) {
      const gl =
        (mg.res === 'goal' && !(G && G.pos === 'POR')) ||
        (mg.res === 'save' && G && G.pos === 'POR');
      const msg = {
        goal: G && G.pos === 'POR' ? 'GOL EN CONTRA' : '¡GOOOL!',
        save: G && G.pos === 'POR' ? '¡ATAJADÓN!' : 'LA SACÓ EL ARQUERO',
        wall: 'BARRERA',
        wide: 'AFUERA',
        short: 'CORTA',
      }[mg.res];
      mx.fillStyle = 'rgba(0,0,0,.5)';
      mx.fillRect(0, h * 0.45, w, w * 0.2);
      mx.fillStyle = gl ? C.gold : '#fff';
      mx.font = `800 ${Math.round(w * 0.12)}px "Big Shoulders Display","Barlow Condensed",sans-serif`;
      mx.fillText(msg, w / 2, h * 0.45 + w * 0.14);
    }
  }
  const isMiniStep = () => !!(G && G.cur && (G.cur.id === 'clasico' || G.cur.id === 'penal'));

  function mkind() {
    return G.pos === 'POR' ? 'pen' : G.cur.id === 'penal' ? 'pk' : 'fk';
  }

  function miniStart() {
    if (G.cur.idx != null) {
      if (mg.cur !== G.cur) mg = { cur: G.cur, kind: mkind(), phase: 'done', res: null };
      $('#mini-ui').hidden = true;
      miniDraw();
      return;
    }
    if (mg.cur !== G.cur) {
      mg = {
        cur: G.cur,
        kind: mkind(),
        phase: 'aim',
        pts: [],
        drawing: false,
        hint: '',
        kx: 0.5,
        kxT: null,
        ball: null,
        res: null,
      };
      if (mg.kind === 'fk') {
        const bx = 0.3 + rnd() * 0.4;
        mg.ball = { x: bx, y: 0.8 };
        mg.sh = { x: bx - 0.035, y: 0.845 };
        mg.wall = { x: bx + (0.5 - bx) * 0.26, y: 0.8 + (0.07 - 0.8) * 0.26 };
      } else if (mg.kind === 'pk') {
        mg.ball = { x: 0.5, y: 0.64 };
        mg.sh = { x: 0.46, y: 0.69 };
      } else {
        mg.ball = { x: 0.5, y: 0.62 };
        mg.sh = { x: 0.5, y: 0.72 };
      }
    }
    $('#mini-ui').hidden = !(mg.kind === 'pen' && mg.phase === 'aim');
    miniDraw();
  }

  function resample(pts, n) {
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + dist(pts[i], pts[i - 1]));
    const tot = L[L.length - 1];
    if (tot < 0.3) return null;
    const out = [];
    let j = 1;
    for (let k = 0; k < n; k++) {
      const d = (tot * k) / (n - 1);
      while (j < pts.length - 1 && L[j] < d) j++;
      const u = (d - L[j - 1]) / Math.max(1e-6, L[j] - L[j - 1]);
      out.push({
        x: pts[j - 1].x + (pts[j].x - pts[j - 1].x) * u,
        y: pts[j - 1].y + (pts[j].y - pts[j - 1].y) * u,
      });
    }
    for (let r = 0; r < 2; r++)
      for (let i = 1; i < n - 1; i++)
        out[i] = {
          x: (out[i - 1].x + out[i].x + out[i + 1].x) / 3,
          y: (out[i - 1].y + out[i].y + out[i + 1].y) / 3,
        };
    return out;
  }

  function fkRelease() {
    mg.drawing = false;
    let P = resample(mg.pts, 48);
    if (!P) {
      mg.hint = 'Esa línea es muy corta. Probá otra.';
      mg.pts = [];
      miniDraw();
      return;
    }
    {
      const L = P.length,
        a = P[Math.max(0, L - 4)],
        b = P[L - 1];
      let dx = b.x - a.x,
        dy = b.y - a.y;
      const m = Math.hypot(dx, dy) || 1;
      dx /= m;
      dy /= m;
      if (dy > -0.3) {
        dx *= 0.4;
        dy = -1;
        const mm = Math.hypot(dx, dy);
        dx /= mm;
        dy /= mm;
      }
      let q = { x: b.x, y: b.y },
        k = 0;
      while (q.y > 0.07 && k++ < 400) {
        q = { x: q.x + dx * 0.012, y: q.y + dy * 0.012 };
        P.push(q);
        if (q.x < -0.2 || q.x > 1.2) break;
      }
    }
    const sk = G.sk || { a: 0 },
      acc = 1 / (1 + sk.a * 0.12 + (G.ovr - 60) * 0.012),
      nz = (rnd() - 0.5) * 2 * 0.07 * acc;
    P = P.map((p, i) => ({ x: p.x + nz * Math.pow(i / (P.length - 1), 1.6), y: p.y }));
    const W = mg.wall;
    let res = 'short',
      stop = P.length - 1;
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      if (W && p.x > W.x - 0.125 && p.x < W.x + 0.125 && p.y > W.y - 0.04 && p.y < W.y + 0.04) {
        res = 'wall';
        stop = i;
        break;
      }
      if (p.y <= 0.075) {
        stop = i;
        if (Math.abs(p.x - 0.5) <= 0.16) {
          const kx = 0.5 + (rnd() - 0.5) * 0.28,
            reach = (Math.abs(p.x - 0.5) > 0.11 ? 0.05 : 0.085) * (mg.kind === 'pk' ? 0.8 : 1);
          mg.kxT = kx;
          res = Math.abs(kx - p.x) < reach ? 'save' : 'goal';
        } else res = 'wide';
        break;
      }
    }
    if (mg.kxT == null) mg.kxT = 0.5 + (rnd() - 0.5) * 0.2;
    mg.P = P.slice(0, stop + 1);
    mg.res = res;
    mg.phase = 'shoot';
    mg.t0 = performance.now();
    mg.pts = [];
    requestAnimationFrame(mAnim);
  }

  function penDive(z) {
    if (!isMiniStep() || mg.kind !== 'pen' || mg.phase !== 'aim') return;
    const zx = [0.37, 0.5, 0.63],
      sk = G.sk || { a: 0 };
    const r = rnd();
    let s, res;
    if (r < 0.1) {
      s = rnd() < 0.5 ? 0 : 2;
      res = 'wide';
    } else {
      const q = rnd();
      s = q < 0.42 ? 0 : q < 0.58 ? 1 : 2;
      const p = clamp(0.72 + 0.02 * sk.a + (G.ovr - 60) * 0.003, 0.5, 0.95);
      res = s === z && rnd() < p ? 'save' : 'goal';
    }
    const tx = res === 'wide' ? (s === 0 ? 0.27 : 0.73) : zx[s];
    mg.kxT = zx[z];
    mg.P = [
      { x: 0.5, y: 0.62 },
      { x: tx, y: 0.085 },
    ];
    mg.res = res;
    mg.phase = 'shoot';
    mg.t0 = performance.now();
    $('#mini-ui').hidden = true;
    requestAnimationFrame(mAnim);
  }

  function mAnim(now) {
    if (mg.phase !== 'shoot' || mg.cur !== G.cur) return;
    const dur = 1100,
      t = Math.min(1, Math.max(0, (now - mg.t0) / dur)),
      n = mg.P.length - 1,
      f = t * n,
      i = Math.min(n - 1, Math.floor(f)),
      a = mg.P[i],
      b = mg.P[i + 1] || a,
      u = f - i;
    mg.ball = { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
    mg.kx = 0.5 + (mg.kxT - 0.5) * Math.min(1, t * 1.5);
    miniDraw();
    if (t < 1) requestAnimationFrame(mAnim);
    else mEnd();
  }

  function mEnd() {
    mg.phase = 'done';
    const good = G.pos === 'POR' ? mg.res === 'save' : mg.res === 'goal';
    G.cur.idx = 0;
    G.cur.text = G.cur.id === 'penal' ? applyPenal(mg.res) : applyMini(mg.res);
    if (G.cur.id === 'clasico') newsAfter('clasico', { res: mg.res }, G.trophies.length);
    save();
    if (good) roar();
    miniDraw();
    renderGame(true);
  }

  function mpos(e) {
    const r = mc.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  }
  mc.addEventListener('pointerdown', (e) => {
    if (
      !isMiniStep() ||
      G.cur.idx != null ||
      mg.cur !== G.cur ||
      (mg.kind !== 'fk' && mg.kind !== 'pk') ||
      mg.phase !== 'aim'
    )
      return;
    const p = mpos(e);
    if (dist(p, mg.ball) > 0.1) {
      mg.hint = 'Empezá la línea desde la pelota.';
      miniDraw();
      return;
    }
    mg.drawing = true;
    mg.hint = '';
    mg.pts = [{ x: mg.ball.x, y: mg.ball.y }, p];
    try {
      mc.setPointerCapture(e.pointerId);
    } catch (x) {}
    e.preventDefault();
    miniDraw();
  });
  mc.addEventListener('pointermove', (e) => {
    if (!mg.drawing) return;
    const p = mpos(e),
      l = mg.pts[mg.pts.length - 1];
    if (dist(p, l) > 0.008) {
      mg.pts.push(p);
      miniDraw();
    }
  });
  const mUp = () => {
    if (mg.drawing) fkRelease();
  };
  mc.addEventListener('pointerup', mUp);
  mc.addEventListener('pointercancel', mUp);
  $('#mini-ui').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-z]');
    if (b) penDive(+b.dataset.z);
  });

  /* ---------- pantallas ---------- */

  function vitHTML() {
    const m = new Map();
    G.trophies.forEach((t) => {
      if (!m.has(t.n)) m.set(t.n, { n: t.n, nt: t.nt, ys: [] });
      m.get(t.n).ys.push(t.y);
    });
    return [...m.values()]
      .map(
        (o) =>
          `<li><strong>${esc(o.n)}</strong><b class="x">×${o.ys.length}</b><span>${o.nt ? 'Selección · ' : ''}${esc(o.ys.slice(-8).join(', '))}</span></li>`,
      )
      .join('');
  }
  const esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
    );
  const isGK = () => G.pos === 'POR';

  function totalsHTML() {
    const T = G.tot,
      gk = isGK(),
      titles = (G.trophies || []).length,
      aw = T.bdo + T.xi;
    const r = [
      ['Partidos', T.pj],
      [gk ? 'Atajadas' : 'Goles', gk ? T.sv : T.g],
      [gk ? 'Vallas invictas' : 'Asistencias', gk ? T.cs : T.a],
      ['Títulos', titles],
    ];
    if (aw) r.push(['Premios', aw]);
    if (G.caps)
      r.push([
        'Selección',
        gk ? G.caps + ' PJ' : G.caps + ' PJ, ' + G.ntg + ' G, ' + (G.nta || 0) + ' A',
      ]);
    r.push(['Ganancias', money(G.earn)]);
    return r.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  }

  function histHTML() {
    const gk = isGK();
    const head = `<thead><tr><th>Temporada</th><th class="n">Edad</th><th>Club</th><th class="n">Media</th><th class="n">PJ</th><th class="n">${gk ? 'At.' : 'G'}</th><th class="n">${gk ? 'VI' : 'A'}</th><th>Resultado</th></tr></thead>`;
    if (!G.hist.length)
      return (
        head + '<tbody><tr><td colspan="8">Todavía no cerraste ninguna temporada.</td></tr></tbody>'
      );
    const rows = G.hist
      .slice()
      .reverse()
      .map((h) => {
        const d = h.a - h.b,
          cls = d > 0 ? 'up' : d < 0 ? 'down' : '';
        return `<tr><td>${seasonLabel(h.y)}</td><td class="n">${h.age}</td><td>${esc(h.club)}</td><td class="n">${h.b} <span class="${cls}">→ ${h.a}</span></td><td class="n">${h.pj}</td><td class="n">${gk ? h.sv : h.g}</td><td class="n">${gk ? h.cs : h.as}</td><td>${esc(h.res)}${h.aw ? ' · ' + esc(h.aw) : ''}</td></tr>`;
      })
      .join('');
    return head + '<tbody>' + rows + '</tbody>';
  }

  function setMain() {
    const b = $('#b-main'),
      c = G.cur;
    if (G.phase === 'choose') {
      b.hidden = true;
      $('#b-retry').hidden = true;
      $('#rs-note').hidden = true;
      return;
    }
    const mini = c.id === 'clasico' || c.id === 'penal',
      noRs = c.id === 'event' || c.id === 'train' || mini;
    b.hidden = c.id === 'event' || c.id === 'train' || (mini && c.idx == null);
    b.disabled = spinning;
    $('#b-retry').hidden = !(c.idx != null && G.rs > 0 && !spinning && !noRs);
    $('#rs-note').hidden = noRs;
    $('#rs-note').textContent =
      `Segunda oportunidad de la temporada: ${G.rs > 0 ? '1 disponible' : 'ya usada'}`;
    if (c.idx == null) b.textContent = 'Girar la ruleta';
    else
      b.textContent =
        c.id === 'offers'
          ? G.k
            ? 'Ver ofertas'
            : 'Cerrar mi carrera'
          : c.id === 'progress'
            ? 'Seguir'
            : 'Siguiente';
  }

  function renderGame(keep) {
    const c = G.cur;
    $('#p-name').textContent = G.name;
    $('#p-sub').textContent = `${G.nat} · ${POS[G.pos]}${G.potL ? ' · Potencial: ' + G.potL : ''}`;
    $('#p-age').textContent = G.age;
    $('#p-ovr').textContent = G.ovr == null ? '?' : G.ovr;
    $('#p-club').innerHTML =
      `${esc(G.club.n)} <span>· ${esc(G.club.c)}${G.contQ ? ' · juega la ' + CN[G.contQ] : ''}${G.contract ? ` · contrato ${G.contract.y} ${G.contract.y === 1 ? 'año' : 'años'} · ${money(G.contract.sal)}/año` : ' · contrato juvenil'}</span>`;
    $('#st-eyebrow').textContent = G.debut
      ? 'Debut · 16 años'
      : `Temporada ${G.season} · ${seasonLabel(G.year)}`;
    const isEv = c.id === 'event' || c.id === 'train',
      isMini = (c.id === 'clasico' || c.id === 'penal') && G.phase !== 'choose',
      choosing = G.phase === 'choose';
    $('#wheel-wrap').hidden = choosing || isEv || isMini;
    $('#offers').hidden = !(choosing || isEv);
    $('#mini-wrap').hidden = !isMini;
    $('#p-extra').hidden = G.debut;
    const N = SKN[G.pos === 'POR' ? 1 : 0],
      sk = G.sk || { a: 0, b: 0, c: 0, d: 0, e: 0 };
    $('#p-extra').textContent = `Confianza del DT ${G.trust || 0} · Resistencia ${G.stam || 0}
${N[0]} ${sk.a || 0} · ${N[1]} ${sk.b || 0} · ${N[2]} ${sk.c || 0} · ${N[3]} ${sk.d || 0} · ${N[4]} ${sk.e || 0}`;
    const hasV = (G.trophies || []).length > 0;
    $('#vit').hidden = !hasV;
    if (hasV) $('#vit-list').innerHTML = vitHTML();
    if (isEv && !choosing) {
      $('#st-title').textContent = c.t;
      $('#st-hint').textContent = c.h;
      $('#result').textContent = '';
      $('#offers').innerHTML =
        c.id === 'train'
          ? trainHTML()
          : EV[G.evi].c
              .map(
                (o, i) =>
                  `<article class="offer"><div><h4>${esc(o[0])}</h4><p>${esc(o[1])}</p></div><button class="btn small" type="button" data-ev="${i}">Elegir</button></article>`,
              )
              .join('');
    } else if (isMini) {
      $('#st-title').textContent = c.t;
      $('#st-hint').textContent = c.h;
      $('#result').textContent = c.text || '';
      $('#result').classList.add('long');
      miniStart();
    } else if (choosing) {
      $('#st-title').textContent = 'Ofertas sobre la mesa';
      {
        const ren = G.offers.some((o) => o.n === G.club.n);
        $('#st-hint').textContent = ren
          ? `${G.club.n} quiere renovarte. Elegí una oferta o cambiá de club.`
          : `${G.club.n} decidió no renovarte. Estas son las ofertas que te llegaron.`;
      }
      $('#result').textContent = '';
      $('#offers').innerHTML = G.offers
        .map(
          (o, i) =>
            `<article class="offer"><div><h4>${o.n === G.club.n ? 'Seguir en ' + esc(o.n) : esc(o.n)}${o.n === G.club.n ? '<span class="tag">Renovación</span>' : ''}</h4><p>${esc(o.c)} · ${TL[o.t]}</p></div><dl><div><dt>Contrato</dt><dd>${o.y} ${o.y > 1 ? 'años' : 'año'}</dd></div><div><dt>Sueldo</dt><dd>${money(o.sal)}/año</dd></div><div><dt>Rol esperado</dt><dd>${expectRole(G.ovr, o.t, G.age)}</dd></div></dl><button class="btn small" type="button" data-i="${i}">Firmar</button></article>`,
        )
        .join('');
    } else {
      $('#st-title').textContent = c.t;
      $('#st-hint').textContent = c.h;
      $('#result').textContent = c.text || '';
      $('#result').classList.toggle('long', (c.text || '').length > 34);
      if (c.idx != null && !keep)
        rot = -(sliceStart(c.slots, c.idx) + 0.5 * slotP(c.slots, c.idx) * TP);
      hi = c.idx != null ? c.idx : -1;
      draw();
    }
    {
      const lg = G.ntlog || [],
        show = (c.id === 'ntm' || c.id === 'cm') && lg.length > 0 && !choosing;
      $('#nt-box').hidden = !show;
      if (show) {
        $('#nt-title').textContent =
          `${G.ntT || G.nat} · ${lg.length} ${lg.length === 1 ? 'partido jugado' : 'partidos jugados'}`;
        $('#nt-log').innerHTML = lg
          .map(
            (l) =>
              `<li class="${l.res}"><span>${esc(l.label)}</span><b>${esc(l.opp)}</b><em>${esc(l.txt)}</em><small>${esc(l.note)}</small></li>`,
          )
          .join('');
      }
    }
    setMain();
    $('#b-retire').hidden = G.debut || spinning;
    $('#totals').innerHTML = totalsHTML();
    $('#hist').innerHTML = histHTML();
  }

  function verdict() {
    const p = G.peak,
      t = G.tot,
      tt = (G.trophies || []).length;
    if (!G.hist.length) return 'Una carrera que no llegó a empezar';
    if (p >= 92 || t.bdo > 0) return 'Leyenda del fútbol';
    if (p >= 86) return 'Crack mundial';
    if (p >= 80) return 'Figura internacional';
    if (p >= 72) return tt > 0 ? 'Profesional con vitrina' : 'Profesional sólido';
    return 'Jugador de ascenso';
  }

  function summary() {
    const g = G,
      T = g.tot,
      gk = isGK(),
      clubs = [...new Set(g.hist.map((h) => h.club))],
      tt = g.trophies.length;
    const cnt = {};
    g.trophies.forEach((t) => {
      cnt[t.n] = (cnt[t.n] || 0) + 1;
    });
    const vit = Object.keys(cnt)
      .map((k) => (cnt[k] > 1 ? `${k} x${cnt[k]}` : k))
      .join(', ');
    return [
      `${g.name} · ${g.nat} · ${POS[g.pos]}`,
      verdict(),
      `${g.hist.length} temporadas en ${clubs.length} ${clubs.length === 1 ? 'club' : 'clubs'}; se retiró a los ${g.age} años.`,
      `Media máxima: ${g.peak}. Partidos: ${T.pj}. ${gk ? `Atajadas: ${T.sv}. Vallas invictas: ${T.cs}.` : `Goles: ${T.g}. Asistencias: ${T.a}.`}`,
      `Títulos (${tt}): ${vit || 'ninguno'}. Premios: ${T.bdo + T.xi}.`,
      g.caps
        ? `Selección de ${g.nat}: ${g.caps} partidos${gk ? '' : `, ${g.ntg} goles y ${g.nta || 0} asistencias`}.`
        : `Nunca jugó en la selección.`,
      `Ganancias: ${money(g.earn)}.`,
      'Jugado en Carrera a la Ruleta',
    ].join('\n');
  }

  function renderEnd() {
    $('#e-title').textContent = G.name;
    $('#e-reason').textContent = G.reason;
    $('#e-verdict').textContent = verdict();
    $('#e-totals').innerHTML =
      `<div><dt>Temporadas</dt><dd>${G.hist.length}</dd></div><div><dt>Media máxima</dt><dd>${G.peak}</dd></div>` +
      totalsHTML();
    $('#e-hist').innerHTML = histHTML();
    $('#e-text').hidden = true;
    const hv = G.trophies.length > 0;
    $('#e-vitwrap').hidden = !hv;
    if (hv) $('#e-vit').innerHTML = vitHTML();
  }

  function render() {
    $('#s-create').hidden = !!G;
    $('#s-game').hidden = !(G && G.phase !== 'ended');
    $('#s-end').hidden = !(G && G.phase === 'ended');
    $('#t-new').hidden = !G;
    if (G && G.phase === 'ended') renderEnd();
    else if (G) renderGame();
    window.scrollTo(0, 0);
  }

  /* ---------- confirmaciones ---------- */

  function ask(msg, yes) {
    const c = $('#confirm');
    $('#confirm-msg').textContent = msg;
    c._y = yes;
    c.hidden = false;
    c.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  $('#confirm-yes').onclick = () => {
    const c = $('#confirm'),
      f = c._y;
    c.hidden = true;
    if (f) f();
  };
  $('#confirm-no').onclick = () => {
    $('#confirm').hidden = true;
  };

  function resetAll() {
    G = null;
    save();
    $('#confirm').hidden = true;
    render();
  }

  /* ---------- eventos ---------- */
  $('#b-main').onclick = () => {
    if (G.cur.idx == null) spin();
    else next();
  };
  $('#news-close').onclick = closeNews;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#news').hidden) closeNews();
  });
  $('#b-retire').onclick = () =>
    ask('¿Retirarte ahora? Tu carrera queda cerrada.', () =>
      endCareer(`Decidiste retirarte a los ${G.age} años.`),
    );
  $('#offers').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (b) return choose(+b.dataset.i);
    const v = e.target.closest('button[data-ev]');
    if (v) return pickEvent(+v.dataset.ev);
    const t = e.target.closest('button[data-tr]');
    if (t) pickTrain(+t.dataset.tr);
  });
  $('#b-retry').onclick = retry;
  $('#t-new').onclick = () => ask('¿Empezar una carrera nueva? Se pierde la actual.', resetAll);
  $('#e-new').onclick = resetAll;
  $('#e-copy').onclick = () => {
    const ta = $('#e-text'),
      txt = summary();
    ta.value = txt;
    const fallback = () => {
      ta.hidden = false;
      ta.focus();
      ta.select();
    };
    try {
      navigator.clipboard.writeText(txt).then(() => {
        $('#e-copy').textContent = 'Copiado';
        setTimeout(() => {
          $('#e-copy').textContent = 'Copiar resumen';
        }, 1800);
      }, fallback);
    } catch (e) {
      fallback();
    }
  };

  function syncTools() {
    $('#t-sound').textContent = 'Sonido: ' + (SET.sound ? 'sí' : 'no');
    $('#t-sound').setAttribute('aria-pressed', SET.sound);
    $('#t-fast').textContent = 'Giro: ' + (SET.fast ? 'rápido' : 'normal');
    $('#t-fast').setAttribute('aria-pressed', SET.fast);
  }
  $('#t-sound').onclick = () => {
    SET.sound = !SET.sound;
    saveSet();
    syncTools();
  };
  $('#t-fast').onclick = () => {
    SET.fast = !SET.fast;
    saveSet();
    syncTools();
  };

  /* ---------- formulario de creación ---------- */
  $('#in-nat').innerHTML = NATS.map((n) => `<option>${n}</option>`).join('');
  $('#in-nat').value = 'Argentina';
  $('#in-country').innerHTML = Object.keys(LG)
    .map((n) => `<option>${n}</option>`)
    .join('');

  function fillClubs() {
    const c = $('#in-country').value;
    $('#in-club').innerHTML = LG[c][1]
      .slice()
      .sort((a, b) => b[1] - a[1])
      .map(
        ([n, t]) =>
          `<option value="${esc(n)}">${esc(n)}${t === 1 ? ' · grande' : t === 2 ? ' · mediano' : ''}</option>`,
      )
      .join('');
    const small = LG[c][1].filter((x) => x[1] === 3);
    if (small.length) $('#in-club').value = small[ri(0, small.length - 1)][0];
  }
  $('#in-country').onchange = fillClubs;
  $('#in-country').value = 'Argentina';
  fillClubs();
  $('#f-create').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!$('#in-name').value.trim()) {
      $('#err').textContent = 'Ponele un nombre a tu jugador.';
      $('#in-name').focus();
      return;
    }
    $('#err').textContent = '';
    newGame();
  });

  /* ---------- arranque ---------- */

  function redrawTheme() {
    if (G && G.cur && G.phase !== 'ended') draw();
  }
  if (window.matchMedia)
    try {
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redrawTheme);
    } catch (e) {}
  new MutationObserver(redrawTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  window.addEventListener('resize', redrawTheme);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redrawTheme);
  if (G && G.phase !== 'ended' && !G.cur && G.queue) showStep();
  syncTools();
  render();
})();
