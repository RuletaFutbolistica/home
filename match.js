(() => {
  'use strict';
  /* =================== utilidades =================== */
  const $ = (s) => document.querySelector(s);
  const rnd = Math.random, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const wpick = (arr) => { let r = rnd() * arr.reduce((s, x) => s + x[1], 0); for (const [v, w] of arr) if ((r -= w) <= 0) return v; return arr[arr.length - 1][0]; };
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* =================== colores del partido (iguales para todos los equipos) =================== */
  const BLUE = '#2c5b97', MAROON = '#8c2b3f', GOLD = '#f0cf3a';

  /* =================== estadísticas y árbol de técnicas =================== */
  let st = { reg: 70, pas: 70, fin: 70, dfn: 70 };
  let M = null; // estado del partido
  let RB = 70; // nivel base de los rivales
  const rrt = () => Math.round(clamp(RB + ri(-12, 12), 45, 92));
  const SKD = {
    marsella: { n: 'Marsella', ctx: 'carry', zone: .10, q: .04, cd: 25, d: 'Giro de 360°: más margen, premio chico' },
    amago: { n: 'Amago por detrás y giro', ctx: 'carry', zone: .05, q: .10, cd: 25, d: 'Más riesgo, mejor ángulo de remate' },
    sombrero: { n: 'Sombrerito', ctx: 'carry', zone: .14, q: .10, cd: 25, sp: 'over', d: 'Por arriba del defensor' },
    autopase: { n: 'Autopase', ctx: 'carry', zone: .12, q: .05, cd: 30, sp: 'auto', d: 'La empujás y ganás metros extra' },
    supervel: { n: 'Súper velocidad', ctx: 'carry', zone: .18, q: .05, cd: 40, sp: 'boost', d: 'Corrés más rápido en la próxima corrida' },
    cano: { n: 'Caño', ctx: 'carry', zone: .10, q: .14, cd: 30, d: 'Humillás al defensor: mejor ángulo' },
    filtrado: { n: 'Pase filtrado', ctx: 'carry', kind: 'pass', zone: .12, q: .10, cd: 30, d: 'Pared que te deja de cara al arco' },
    taco: { n: 'Taco', ctx: 'carry', kind: 'pass', zone: .08, q: .06, cd: 25, d: 'Pared de primera, de taco' },
    dupla: { n: 'Dupla elegante', ctx: 'carry', kind: 'pass', zone: .15, q: .10, cd: 40, need: 'mate', sp: 'dupla', d: 'Dos o tres pases con un compañero cercano' },
    profundidad: { n: 'Pase en profundidad', ctx: 'carry', kind: 'pass', zone: .10, q: .12, cd: 35, d: 'Pared que te lanza al espacio' },
    rabona: { n: 'Tiro de rabona', ctx: 'shoot', rm: .82, ns: .04, cd: 30, d: 'Tiro difícil de leer para el arquero' },
    volea: { n: 'Volea', ctx: 'shoot', rm: .85, ns: .05, cd: 30, d: 'Potente, pero algo menos preciso' },
    chilena: { n: 'Chilena', ctx: 'shoot', rm: .78, ns: .07, cd: 45, d: 'La más espectacular y la más arriesgada' },
    comba: { n: 'Tiro con comba', ctx: 'shoot', rm: .9, ns: -.04, cd: 30, d: 'Más preciso: cuesta menos pegarle al palo' },
    superbarrida: { n: 'Súper barrida', ctx: 'def', zone: .25, cd: 35, d: 'Entrada con mucho margen' },
    anticipo: { n: 'Anticipación', ctx: 'def', zone: .12, cd: 25, d: 'Te adelantás y cortás limpio' },
    muralla: { n: 'Muralla', ctx: 'def', zone: .20, cd: 35, d: 'Bloqueo reforzado' },
    corte: { n: 'Corte limpio', ctx: 'def', zone: .15, cd: 25, d: 'Corte seguro, sin riesgo de falta' },
  };
  /* =================== cancha (canvas) =================== */
  const cv = $('#x-field'), cx = cv.getContext('2d');
  let active = false;
  let view = 'full'; // 'full': time-lapse con toda la cancha; 'half': jugada en media cancha
  let ents = [], ball = { x: .5, y: .5, v: false }, hl = null, gv = null, pathPts = [], inputH = null, ASP = 1.4;
  function fit() {
    const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    cv.width = Math.max(10, Math.round(r.width * d)); cv.height = Math.max(10, Math.round(r.height * d)); ASP = cv.height / cv.width;
  }
  new ResizeObserver(fit).observe(cv); window.addEventListener('resize', fit);
  const grass = (W, H) => { for (let i = 0; i < 10; i++) { cx.fillStyle = i % 2 ? '#1f8a5a' : '#1c8153'; cx.fillRect(0, H * i / 10, W, H / 10 + 1); } };
  function token(x, y, c, t, r, u, gk) {
    cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(x, y + r * .85, r * .9, r * .38, 0, 0, 7); cx.fill();
    cx.fillStyle = c === 'me' ? GOLD : (c === 'mate' || c === 'mygk') ? BLUE : MAROON; cx.strokeStyle = '#10202b'; cx.lineWidth = 3 * u;
    cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fill(); cx.stroke();
    if (gk) { cx.fillStyle = GOLD; [-1, 1].forEach((s) => { cx.beginPath(); cx.arc(x + s * r * 1.45, y - r * .35, r * .5, 0, 7); cx.fill(); cx.stroke(); }); }
    cx.fillStyle = c === 'me' ? '#14222c' : '#fff'; cx.font = `800 ${r * (String(t).length > 1 ? .95 : 1.1)}px 'Barlow',sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(t == null ? '' : t, x, y + 1);
  }
  const dot = (x, y, r, u) => { cx.fillStyle = '#fff'; cx.strokeStyle = '#10202b'; cx.lineWidth = 2 * u; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fill(); cx.stroke(); };
  function draw() {
    const W = cv.width, H = cv.height, u = W / 360, X = (x) => x * W, Y = (y) => y * H;
    grass(W, H); cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.lineWidth = 2 * u; cx.lineJoin = 'round';
    cx.strokeRect(X(.04), Y(.02), X(.92), H * 1.2);
    cx.strokeRect(X(.2), Y(.02), X(.6), X(.3)); cx.strokeRect(X(.36), Y(.02), X(.28), X(.1));
    cx.fillStyle = 'rgba(255,255,255,.85)'; cx.beginPath(); cx.arc(X(.5), Y(.02) + X(.2), 2.5 * u, 0, 7); cx.fill();
    cx.beginPath(); cx.arc(X(.5), Y(.02) + X(.2), X(.13), .98, Math.PI - .98); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.18)'; cx.fillRect(X(.38), 0, X(.24), Y(.02) + 4); cx.strokeStyle = '#fff'; cx.strokeRect(X(.38), -4, X(.24), Y(.02) + 8);
    const r = 14 * u;
    ents.forEach((e) => token(X(e.x), Y(e.y), e.c, e.t, r, u, e.c === 'gk' || e.c === 'mygk'));
    if (pathPts.length > 1) { cx.strokeStyle = 'rgba(240,207,58,.95)'; cx.lineWidth = 4 * u; cx.setLineDash([10 * u, 8 * u]); cx.beginPath(); pathPts.forEach((p, i) => (i ? cx.lineTo(X(p.x), Y(p.y)) : cx.moveTo(X(p.x), Y(p.y)))); cx.stroke(); cx.setLineDash([]); }
    if (hl) { const e = hl, yy = Y(e.y) - 28 * u - Math.sin(performance.now() / 160) * 3 * u; cx.fillStyle = GOLD; cx.strokeStyle = '#10202b'; cx.lineWidth = 2 * u; cx.beginPath(); cx.moveTo(X(e.x), yy + 10 * u); cx.lineTo(X(e.x) - 8 * u, yy - 4 * u); cx.lineTo(X(e.x) + 8 * u, yy - 4 * u); cx.closePath(); cx.fill(); cx.stroke(); }
    if (ball.v && !gv) dot(X(ball.x), Y(ball.y), 7 * u, u);
  }
  /* ---- time-lapse: toda la cancha, con las fichas moviéndose ---- */
  let tl = [], tb = { x: .5, y: .5 }, tlHold = null, tlMode = 'run', tlLast = performance.now();
  function buildTL() {
    tl = []; const dm = M ? M.dors : 9;
    const add = (c, x, y, t, gk) => tl.push({ c, bx: x, by: y, x, y, t, gk, ph: rnd() * 6.28 });
    const fix = (n) => (n === dm ? 12 : n);
    add('mate', .5, .93, 1, true);
    [[.16, 3], [.38, 4], [.62, 5], [.84, 2]].forEach(([x, n]) => add('mate', x, .78, fix(n)));
    [[.18, 11], [.4, 8], [.6, 6], [.82, 7]].forEach(([x, n]) => add('mate', x, .62, fix(n)));
    add('mate', .36, .46, fix(9)); add('me', .64, .46, dm);
    add('rival', .5, .07, 1, true);
    [[.16, 3], [.38, 4], [.62, 5], [.84, 2]].forEach(([x, n]) => add('rival', x, .22, n));
    [[.18, 11], [.4, 8], [.6, 6], [.82, 7]].forEach(([x, n]) => add('rival', x, .38, n));
    [[.36, 9], [.64, 10]].forEach(([x, n]) => add('rival', x, .54, n));
    tb = { x: .5, y: .5 };
  }
  function updateTL(dt, now) {
    if (tlMode !== 'run' || !tl.length) return;
    const dom = Math.sin(now / 900) * .6, tn = now * 3.2;
    if (!tlHold || now > tlHold.until) {
      const pool = tl.filter((t) => !t.gk && (dom > 0 ? t.c !== 'rival' : t.c === 'rival'));
      tlHold = { t: (rnd() < .2 ? tl.filter((t) => !t.gk) : pool)[ri(0, (rnd() < .2 ? tl.length - 3 : pool.length - 1))] || tl[3], until: now + ri(130, 260) };
    }
    const k = Math.min(1, dt * .03); tb.x += (tlHold.t.x - tb.x) * k; tb.y += (tlHold.t.y - tb.y) * k;
    tl.forEach((t) => {
      const sh = -dom * .07 * (t.gk ? .3 : 1);
      const tx = t.bx + Math.sin(tn / 650 + t.ph) * .03 + (tb.x - t.bx) * .1, ty = t.by + sh + Math.cos(tn / 820 + t.ph) * .03 + (tb.y - t.by) * .12;
      const kk = Math.min(1, dt * .03); t.x += (tx - t.x) * kk; t.y += (ty - t.y) * kk;
    });
  }
  function drawFull() {
    const W = cv.width, H = cv.height, u = W / 360, X = (x) => x * W, Y = (y) => y * H;
    grass(W, H); cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.lineWidth = 2 * u; cx.lineJoin = 'round';
    cx.strokeRect(X(.05), Y(.03), X(.9), Y(.94)); cx.beginPath(); cx.moveTo(X(.05), Y(.5)); cx.lineTo(X(.95), Y(.5)); cx.stroke();
    cx.beginPath(); cx.arc(X(.5), Y(.5), X(.12), 0, 7); cx.stroke();
    cx.strokeRect(X(.25), Y(.03), X(.5), X(.2)); cx.strokeRect(X(.25), Y(.97) - X(.2), X(.5), X(.2));
    cx.strokeRect(X(.38), Y(.03), X(.24), X(.07)); cx.strokeRect(X(.38), Y(.97) - X(.07), X(.24), X(.07));
    cx.fillStyle = 'rgba(255,255,255,.2)'; cx.fillRect(X(.4), Y(.03) - 6 * u, X(.2), 6 * u); cx.fillRect(X(.4), Y(.97), X(.2), 6 * u);
    const r = 10.5 * u;
    tl.forEach((t) => token(X(t.x), Y(t.y), t.c, t.t, r, u, t.gk));
    dot(X(tb.x), Y(tb.y), 5.5 * u, u);
    cx.fillStyle = 'rgba(10,18,14,.0)';
  }
  async function animGoal(team) { // la jugada de un gol "de fondo": se ve cómo se arma
    tlMode = 'goal'; const up = team === 'me';
    const atk = tl.filter((t) => !t.gk && (up ? (t.c === 'mate' || t.c === 'me') : t.c === 'rival')).sort((a, b) => (up ? b.y - a.y : a.y - b.y));
    const gk = tl.find((t) => t.gk && t.c === (up ? 'rival' : 'mate'));
    const p1 = atk[1], p2 = atk[Math.floor(atk.length / 2)], p3 = atk[atk.length - 1];
    await tw(tb, p1.x, p1.y, 220); await tw(tb, p2.x, p2.y, 220);
    await Promise.all([tw(tb, p3.x, p3.y, 220), tw(p3, p3.x, up ? .22 : .78, 300)]);
    const gx = clamp(p3.x + (rnd() < .5 ? -.08 : .08), .42, .58);
    await Promise.all([tw(tb, gx, up ? .03 : .97, 220), tw(gk, clamp(gx + (rnd() < .5 ? -.1 : .1), .3, .7), gk.y, 200)]);
    await sleep(250);
    tl.forEach((t) => { t.x = t.bx; t.y = t.by; }); tb.x = .5; tb.y = .5; tlHold = null; tlMode = 'run';
  }
  /* ---- vista del arco (remates) ---- */
  const GR = () => { const W = cv.width, H = cv.height, w = .8; return { x: .1, y: .08, w, h: Math.min(.36, (w * W / 2.4) / H) }; };
  function drawGoal() {
    const W = cv.width, H = cv.height, u = W / 360, g = GR(), gx = W * g.x, gy = H * g.y, gw = W * g.w, gh = H * g.h;
    cx.fillStyle = 'rgba(9,18,14,.97)'; cx.fillRect(0, 0, W, gy + gh + 28 * u);
    cx.fillStyle = 'rgba(255,255,255,.05)'; cx.fillRect(gx, gy, gw, gh);
    cx.strokeStyle = 'rgba(255,255,255,.16)'; cx.lineWidth = u;
    for (let i = 1; i < 20; i++) { cx.beginPath(); cx.moveTo(gx + gw * i / 20, gy); cx.lineTo(gx + gw * i / 20, gy + gh); cx.stroke(); }
    for (let j = 1; j < 7; j++) { cx.beginPath(); cx.moveTo(gx, gy + gh * j / 7); cx.lineTo(gx + gw, gy + gh * j / 7); cx.stroke(); }
    cx.strokeStyle = '#fff'; cx.lineWidth = 6 * u; cx.lineJoin = 'miter'; cx.beginPath(); cx.moveTo(gx, gy + gh); cx.lineTo(gx, gy); cx.lineTo(gx + gw, gy); cx.lineTo(gx + gw, gy + gh); cx.stroke();
    cx.fillStyle = '#f1f5f2'; cx.font = `700 ${12 * u}px 'Barlow',sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(`ARQUERO ${M.gk}  ·  TU DEFINICIÓN ${st.fin}`, W / 2, gy - 14 * u);
    if (gv.picking) { cx.fillStyle = 'rgba(240,207,58,.55)'; [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j]) => { cx.beginPath(); cx.arc(gx + gw * (i ? .965 : .035), gy + gh * (j ? .93 : .1), 7 * u, 0, 7); cx.fill(); }); }
    const k = gv.gk, kx = gx + gw * k.x, ky = gy + gh * k.y;
    token(kx, ky, 'rival', 1, 17 * u, u, true);
    if (gv.picking && gv.aim) { const ax = gx + gw * gv.aim.x, ay = gy + gh * gv.aim.y; cx.strokeStyle = '#fff'; cx.lineWidth = 3 * u; cx.beginPath(); cx.arc(ax, ay, 11 * u, 0, 7); cx.moveTo(ax - 18 * u, ay); cx.lineTo(ax + 18 * u, ay); cx.moveTo(ax, ay - 18 * u); cx.lineTo(ax, ay + 18 * u); cx.stroke(); }
    if (gv.ball) dot(gx + gw * gv.ball.x, gy + gh * gv.ball.y, 8 * u, u);
  }
  (function loop() {
    const now = performance.now(), dt = Math.min(50, now - tlLast); tlLast = now;
    if (active && cv.width > 20) { if (view === 'full') { updateTL(dt, now); drawFull(); } else draw(); if (gv) drawGoal(); }
    requestAnimationFrame(loop);
  })();
  /* ---- entrada táctil ---- */
  const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; };
  const dist = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * ASP);
  const aimAt = (p) => { const g = GR(); return { x: clamp((p.x - g.x) / g.w, 0, 1), y: clamp((p.y - g.y) / g.h, 0, 1) }; };
  cv.addEventListener('pointerdown', (e) => {
    const p = pt(e);
    if (gv && gv.picking) { gv.drag = true; gv.aim = aimAt(p); cv.setPointerCapture(e.pointerId); return; }
    if (inputH) inputH.down(p, e);
  });
  cv.addEventListener('pointermove', (e) => { const p = pt(e); if (gv && gv.picking && gv.drag) { gv.aim = aimAt(p); return; } if (inputH && inputH.move) inputH.move(p); });
  const up = (e) => { if (gv && gv.drag) { gv.drag = false; return; } if (inputH && inputH.up) inputH.up(pt(e)); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  const tw = (o, x, y, ms = 500) => new Promise((res) => {
    const x0 = o.x, y0 = o.y, t0 = performance.now();
    (function s() { const k = clamp((performance.now() - t0) / ms, 0, 1), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; o.x = x0 + (x - x0) * e; o.y = y0 + (y - y0) * e; k < 1 ? requestAnimationFrame(s) : res(); })();
  });
  const carry = (me, x, y, ms = 500) => Promise.all([tw(me, x, y, ms), tw(ball, x + .005, y - .04, ms)]);
  const E = (id, c, x, y, t) => { const e = { id, c, x, y, t }; ents.push(e); return e; };
  let bt = 0;
  async function banner(t, ms = 1400) { const b = $('#x-banner'), k = ++bt; b.textContent = t; b.classList.add('on'); await sleep(ms); if (k === bt) b.classList.remove('on'); }
  const info = (t) => { $('#x-hint').innerHTML = t; };
  const logl = (t, c = '') => { const li = document.createElement('li'); li.className = c; li.textContent = t; $('#x-log').prepend(li); };
  $('#x-logbtn').onclick = () => { $('#x-log').hidden = !$('#x-log').hidden; };
  $('#x-log').onclick = () => { $('#x-log').hidden = true; };

  /* =================== marcador =================== */
  function fitText(el) { el.style.fontSize = ''; let fs = parseFloat(getComputedStyle(el).fontSize); const box = el.parentElement; while (el.scrollWidth > box.clientWidth - 26 && fs > 9) { fs -= 1; el.style.fontSize = fs + 'px'; } }
  const lbl = () => { const end = M.ph === 'et' ? 120 : 90, m = M.min > end ? end + '+' + (M.min - end) : M.min; return (M.ph === 'et' ? 'Prórroga' : M.min <= 45 ? 'Primer tiempo' : 'Segundo tiempo') + ' · minuto ' + m; };
  const hud = () => { $('#x-score').textContent = M.me + ' - ' + M.rv; $('#x-mn').textContent = lbl(); };
  const hudMin = () => { $('#x-mn').textContent = lbl(); };

  /* =================== botones y menú de técnicas =================== */
  const bL = $('#x-bL'), bR = $('#x-bR'), bC = $('#x-bC'), menu = $('#x-menu');
  const skState = (id, ctx) => {
    const s = SKD[id], at = M.cd[id] || 0;
    if (M.min < at) return { ok: false, why: `Disponible desde el min ${at}` };
    if (s.need === 'mate' && !(ctx && ctx.mateNear)) return { ok: false, why: 'Necesita un compañero cerca' };
    return { ok: true, why: `${s.d} · bloqueo ${s.cd} min` };
  };
  const mySkills = (ctx) => M.skills.filter((id) => SKD[id].ctx === ctx);
  function ask({ L, R, C = [], ctx = {} }) {
    return new Promise((res) => {
      bL.textContent = L; bR.textContent = R; bL.disabled = bR.disabled = false; menu.hidden = true;
      const ready = C.some((id) => skState(id, ctx).ok);
      bC.disabled = !C.length; bC.classList.toggle('empty', !ready); bC.classList.toggle('ready', ready);
      const done = (v) => { bL.disabled = bR.disabled = bC.disabled = true; bC.classList.remove('ready'); bC.classList.add('empty'); menu.hidden = true; res(v); };
      bL.onclick = () => done({ k: 'L' }); bR.onclick = () => done({ k: 'R' });
      bC.onclick = () => {
        if (!menu.hidden) { menu.hidden = true; return; }
        menu.innerHTML = '';
        C.forEach((id) => {
          const s = skState(id, ctx), b = document.createElement('button');
          b.innerHTML = `${SKD[id].n}<small>${s.why}</small>`; b.disabled = !s.ok;
          b.onclick = () => { M.cd[id] = M.min + SKD[id].cd; M.used++; done({ k: 'S', skill: id }); };
          menu.appendChild(b);
        });
        menu.hidden = false;
      };
    });
  }

  /* =================== ruleta de minutos =================== */
  const WC = ['#1f8a5a', '#3b74a8', '#c9452a', '#f0cf3a'], WT = ['#fff', '#fff', '#fff', '#0e1a22'];
  function spinWheel(title, items) {
    return new Promise((res) => {
      const ov = $('#x-overlay'), c = $('#x-wheel'), g = c.getContext('2d'), d = window.devicePixelRatio || 1;
      ov.hidden = false; $('#x-wTitle').textContent = title;
      const S = Math.round(c.getBoundingClientRect().width * d) || 300; c.width = c.height = S;
      const tot = items.reduce((s, i) => s + i.w, 0), starts = []; let a = 0;
      items.forEach((i) => { starts.push(a); a += (i.w / tot) * Math.PI * 2; });
      let rot = 0, hi = -1;
      const paint = () => {
        g.clearRect(0, 0, S, S); const r = S / 2 - 6;
        items.forEach((it, i) => {
          const a0 = rot + starts[i] - Math.PI / 2, a1 = a0 + (it.w / tot) * Math.PI * 2;
          g.beginPath(); g.moveTo(S / 2, S / 2); g.arc(S / 2, S / 2, r, a0, a1); g.closePath();
          g.fillStyle = WC[i % 4]; g.fill(); g.lineWidth = 3; g.strokeStyle = hi === i ? '#fff' : '#14222c'; g.stroke();
          g.save(); g.translate(S / 2, S / 2); g.rotate((a0 + a1) / 2); g.fillStyle = WT[i % 4]; g.font = `800 ${S / 15}px sans-serif`; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(it.label, r - 12, 0); g.restore();
        });
        g.beginPath(); g.arc(S / 2, S / 2, S / 12, 0, 7); g.fillStyle = '#1f2c27'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#f1f5f2'; g.stroke();
      };
      paint();
      const go = $('#x-wGo'); go.disabled = false;
      go.onclick = () => {
        go.disabled = true;
        const idx = wpick(items.map((it, i) => [i, it.w])), pos = starts[idx] + (items[idx].w / tot) * Math.PI * 2 * (.15 + rnd() * .7);
        const fin = Math.PI * 2 * (4 + ri(0, 2)) - pos, t0 = performance.now(), dur = 2600;
        (function s() {
          const k = clamp((performance.now() - t0) / dur, 0, 1); rot = fin * (1 - Math.pow(1 - k, 3)); paint();
          if (k < 1) requestAnimationFrame(s); else { hi = idx; paint(); setTimeout(() => { ov.hidden = true; res(idx); }, 800); }
        })();
      };
    });
  }

  /* =================== barras: fuerza del tiro y duelo =================== */
  function powerMeter(zone, txt) {
    return new Promise((res) => {
      const m = $('#x-meter'), mk = $('#x-mMk'), z = $('#x-mZone'); m.hidden = false; $('#x-mTxt').textContent = txt;
      z.style.left = zone[0] * 100 + '%'; z.style.width = (zone[1] - zone[0]) * 100 + '%';
      const t0 = performance.now(); let p = 0, on = true;
      (function s() { if (!on) return; const t = ((performance.now() - t0) / 1000) / 1.05; p = Math.abs(((t % 2) + 2) % 2 - 1); mk.style.left = p * 100 + '%'; requestAnimationFrame(s); })();
      m.onclick = () => { on = false; m.hidden = true; res(p); };
    });
  }
  // Barra del choque: verde = ganás la pelota, gris = pelota dividida (50 y 50), rojo = te la sacan.
  // El tamaño del verde sale de tus estadísticas contra las del rival; la marca va más rápido contra rivales fuertes.
  function duelBar(pWin, strong, txt) {
    return new Promise((res) => {
      const bar = $('#x-dbar'), mk = $('#x-dMk'), g = $('#x-dG'), m = $('#x-dM');
      const gW = clamp(.12 + (pWin - .2) * .62, .1, .68), mW = .14, o = rnd() * (1 - gW - mW), gFirst = rnd() < .5;
      const gl = gFirst ? o : o + mW, ml = gFirst ? o + gW : o;
      g.style.left = gl * 100 + '%'; g.style.width = gW * 100 + '%'; m.style.left = ml * 100 + '%'; m.style.width = mW * 100 + '%';
      $('#x-dTx').textContent = txt; bar.hidden = false;
      const per = clamp(1.25 - (strong - 70) / 170, .75, 1.5), t0 = performance.now(); let p = 0, on = true;
      (function s() { if (!on) return; const t = ((performance.now() - t0) / 1000) / per; p = Math.abs(((t % 2) + 2) % 2 - 1); mk.style.left = p * 100 + '%'; requestAnimationFrame(s); })();
      bar.onclick = () => { on = false; bar.hidden = true; res(p >= gl && p <= gl + gW ? 'win' : p >= ml && p <= ml + mW ? 'mid' : 'lose'); };
    });
  }
  function corners(mine, rival, on) {
    const a = $('#x-cTU'), b = $('#x-cRV');
    if (!on) { a.hidden = b.hidden = true; return; }
    const col = (x, y) => (x >= y ? 'ok' : 'no');
    a.innerHTML = `<b>TU</b>` + mine.map((m, i) => `<span class="${col(m[1], rival[i][1])}">${m[0]} ${m[1]}</span>`).join('');
    b.innerHTML = rival.map((r) => `<span>${r[0]} ${r[1]}</span>`).join('') + `<b>RIVAL</b>`;
    a.hidden = b.hidden = false;
  }

  /* =================== tiro =================== */
  function resolveShot({ kind, aim, power, q, gkAdv, skill }) {
    const G = M.gk, cen = kind === 'vaselina' ? .485 : .76, sk = skill ? SKD[skill] : null;
    let noise = clamp(Math.abs(power - cen) - .14, 0, 1) * 1.6;
    if (sk) noise = Math.max(0, noise + sk.ns);
    let ax = aim.x + (rnd() - .5) * 2 * noise, ay = aim.y + (rnd() - .5) * 2 * noise;
    if (kind === 'vaselina') ay = Math.min(ay, .3);
    if (ax < 0 || ax > 1 || ay < 0 || ay > 1) return { out: 'palo', ax: clamp(ax, 0, 1), ay: clamp(ay, 0, 1), gk: { x: .5, y: .6 } };
    const gx = clamp(wpick([[.2, 4], [.5, 2], [.8, 4]]) + (rnd() - .5) * .2, .05, .95), gy = gkAdv && kind === 'vaselina' ? .65 : .35 + rnd() * .5;
    let r = .3 + (G - 70) / 180 - q * .6; if (sk) r *= sk.rm; if (kind === 'vaselina') r *= gkAdv ? .95 : 1.15; r = clamp(r, .08, .42);
    const d = Math.hypot(ax - gx, (ay - gy) * .42), ps = clamp(.88 + (G - st.fin) / 120, .5, .97);
    let out = 'goal';
    if (d < r) out = rnd() < ps ? 'saved' : 'goal'; else if (d < r * 1.3) out = rnd() < .3 ? 'saved' : 'goal';
    return { out, ax, ay, gk: { x: gx, y: gy } };
  }
  async function shootPhase({ gkAdv = false, q = 0, pen = false } = {}) {
    hl = null; pathPts = []; inputH = null; ball.v = false; corners(0, 0, false);
    gv = { picking: true, drag: false, aim: { x: .5, y: .5 }, gk: { x: .5, y: gkAdv ? .6 : .55 }, ball: null };
    info('<b>Apuntá</b> tocando el arco: las esquinas altas son las escuadras. Después elegí cómo definir.');
    const a = await ask({ L: 'Vaselina', R: 'Tiro', C: pen ? [] : mySkills('shoot') });
    const aim = gv.aim; gv.picking = false; info('');
    const kind = a.k === 'L' ? 'vaselina' : 'tiro', skill = a.skill, zone = kind === 'vaselina' ? [.35, .62] : [.62, .9];
    const power = await powerMeter(zone, kind === 'vaselina' ? 'Vaselina: fuerza suave' : 'Fuerza: frená en el verde');
    const r = resolveShot({ kind, aim, power, q, gkAdv: gkAdv || pen, skill });
    gv.ball = { x: .5, y: 1.25 };
    await Promise.all([tw(gv.ball, r.ax != null ? r.ax : aim.x, r.ay != null ? r.ay : aim.y, 420), tw(gv.gk, r.gk.x, r.gk.y, 400)]);
    await sleep(600); gv = null; return r.out;
  }

  /* =================== duelo (choque con un rival) =================== */
  const nearestMate = (me) => ents.filter((e) => e.c === 'mate').sort((x, y) => dist(x, me) - dist(y, me))[0];
  let boost = false;
  async function duel({ me, def, name = 'Defensor', lab = ['Pase', 'Gambeta'] }) {
    const D = def.rt || rrt(), I = def.ic || clamp(D + ri(-6, 4), 45, 95); hl = null; pathPts = []; info('');
    corners([['Pase', st.pas], ['Regate', st.reg]], [['Intercepción', I], ['Defensa', D]], true);
    const mate = nearestMate(me), ctx = { mateNear: !!mate && dist(mate, me) < .42 };
    const a = await ask({ L: lab[0], R: lab[1], C: mySkills('carry'), ctx });
    const sk = a.skill ? SKD[a.skill] : null;
    let p, q = 0, route, strong = D;
    if (a.k === 'L') { p = clamp(.64 + (st.pas - I) / 110, .3, .93); route = 'pase'; strong = I; }
    else if (a.k === 'R') { p = clamp(.5 + (st.reg - D) / 70, .12, .88); q = .07; route = 'gambeta'; }
    else { p = clamp(.5 + (st.reg - D) / 70, .12, .88); q = sk.q; route = sk.kind === 'pass' ? 'pase' : sk.sp === 'over' ? 'sombrero' : 'gambeta'; if (sk.kind === 'pass') p = clamp(.64 + (st.pas - I) / 110, .3, .93); }
    let extra = sk ? sk.zone : 0;
    const pBar = clamp(p + extra, .1, .97);
    const res0 = await duelBar(pBar, strong, a.k === 'S' ? `${sk.n}: frená en el verde` : a.k === 'L' ? 'Pase: frená en el verde' : 'Gambeta: frená en el verde');
    corners(0, 0, false);
    let ok = res0 === 'win';
    if (res0 === 'mid') { await banner('¡Pelota dividida!', 700); ok = rnd() < .5; }
    if (ok) {
      const tgt = Math.min(me.y, def.y);
      if (sk && sk.sp === 'dupla' && mate) {
        const m2 = nearestMate(me); await banner('¡Dupla elegante!', 600);
        await tw(ball, m2.x, m2.y - .03, 300); await Promise.all([tw(me, clamp((me.x + m2.x) / 2, .1, .9), Math.max(.3, tgt - .06), 360), tw(ball, me.x, tgt - .1, 360)]);
        await tw(ball, m2.x, m2.y - .06, 280); await Promise.all([tw(me, .5, Math.max(.3, tgt - .16), 420), tw(ball, .5, Math.max(.3, tgt - .2), 420)]);
        ents.filter((e) => e.c === 'rival').forEach((r) => { if (dist(r, me) < .3) tw(r, r.x + (r.x < me.x ? -.1 : .1), r.y + .05, 500); });
      } else if (route === 'pase' && mate) {
        const lead = sk && (a.skill === 'filtrado' || a.skill === 'profundidad') ? .18 : .1;
        await tw(ball, mate.x, mate.y - .03, 380); await Promise.all([tw(me, me.x, Math.max(.2, tgt - lead), 480), tw(ball, me.x, Math.max(.2, tgt - lead - .04), 480)]);
      } else if (route === 'sombrero') { await Promise.all([tw(ball, me.x, def.y - .12, 420), tw(me, me.x, def.y - .08, 520)]); }
      else { const sx = clamp(def.x + (rnd() < .5 ? -.13 : .13), .08, .92), far = sk && sk.sp === 'auto' ? .22 : .09; await carry(me, sx, def.y + .01, 330); await carry(me, sx, Math.max(.16, def.y - far), 330); }
      if (sk && sk.sp === 'boost') boost = true;
      logl(`${sk ? sk.n : route === 'pase' ? 'Pared' : 'Gambeta'} ganada (${Math.round(p * 100)}% base)`);
    } else { await tw(ball, def.x, def.y + .03, 320); await banner('¡Te la quitaron!', 900); logl(`Perdiste la pelota (${Math.round(p * 100)}% de ganar)`, 'r'); }
    return { ok, q: sk ? Math.max(q, sk.q) : q };
  }

  /* =================== resultado de un remate =================== */
  async function finish(out) {
    if (out === 'goal') { M.me++; M.g++; hud(); await banner('¡GOOOL!', 1300); logl(`Min ${M.min}: ¡GOL de tu jugador!`, 'g'); }
    else if (out === 'saved') { await banner('¡Lo ataja el arquero!', 1000); logl(`Min ${M.min}: el arquero la ataja`); }
    else { await banner('¡Pegó en el palo!', 1000); logl(`Min ${M.min}: la pelota pega en el palo`); }
    return out;
  }

  /* =================== motor de ataque: arrastrar, pasar, rematar =================== */
  const rspd = (r) => .00035 + (r.rt - 55) * .000014;
  function moveRivals(rivals, me, dt, f) {
    rivals.forEach((r) => {
      let tg = me, engage = true;
      if (r.mode === 'mark' || r.mode === 'hold') { engage = dist(me, r) < .3 || r.on; if (engage) r.on = true; if (!engage) tg = r.mode === 'mark' && r.mk ? { x: r.mk.x + .05, y: r.mk.y + .06 } : r; }
      const dx = tg.x - r.x, dy = tg.y - r.y, d = Math.hypot(dx, dy * ASP);
      if (d < .012) return;
      const s2 = Math.min(d, rspd(r) * dt * f); r.x += dx * s2 / d; r.y += dy * s2 / d;
    });
  }
  function getAction(me, mates, rivals) {
    return new Promise((res) => {
      let drag = false, pts = [], alive = true, last = performance.now();
      info('<b>Arrastrá</b> a tu jugador dorado para avanzar · <b>tocá</b> a un compañero para pasarle · <b>tocá el arco</b> (arriba) para rematar');
      hl = me;
      const done = (v) => { alive = false; inputH = null; pathPts = []; hl = null; res(v); };
      (function idle() { if (!alive) return; const now = performance.now(); moveRivals(rivals, me, now - last, .3); last = now; const hit = rivals.find((r) => dist(r, me) < .1); if (hit) return done({ t: 'hit', hit }); requestAnimationFrame(idle); })();
      inputH = {
        down: (p) => {
          if (dist(p, me) < .12) { drag = true; pts = [{ x: me.x, y: me.y }, p]; pathPts = pts; return; }
          const m = mates.find((m) => dist(p, m) < .13); if (m) return done({ t: 'pass', mate: m });
          if (p.y < .1) return done({ t: 'shoot' });
        },
        move: (p) => { if (!drag) return; const l = pts[pts.length - 1]; if (dist(p, l) > .015) pts.push({ x: clamp(p.x, .06, .94), y: clamp(p.y, .03, .98) }); },
        up: () => { if (!drag) return; drag = false; if (pts.length > 2) done({ t: 'path', pts: pts.slice() }); else pathPts = []; },
      };
    });
  }
  function follow(me, pts, rivals) {
    return new Promise((res) => {
      let i = 1, last = performance.now(), last2 = last; const sp = boost ? .0015 : .0009, rf = boost ? .6 : 1; boost = false;
      (function s() {
        const now = performance.now(); let step = sp * (now - last); last = now;
        while (step > 0 && i < pts.length) { const dx = pts[i].x - me.x, dy = pts[i].y - me.y, d = Math.hypot(dx, dy * ASP); if (d <= step) { me.x = pts[i].x; me.y = pts[i].y; i++; step -= d; } else { me.x += dx * step / d; me.y += dy * step / d; step = 0; } }
        ball.x = me.x + .005; ball.y = me.y - .04;
        moveRivals(rivals, me, now - last2, rf); last2 = now;
        const hit = rivals.find((r) => dist(r, me) < .1); if (hit) return res(hit);
        if (i >= pts.length) return res(null); requestAnimationFrame(s);
      })();
    });
  }
  async function attack(L) {
    view = 'half'; ents = []; gv = null; const nums = shuffle([7, 8, 10, 11, 6, 3]).filter((n) => n !== M.dors), rn = shuffle([2, 3, 4, 5, 6, 8, 10, 11]);
    const me = E('me', 'me', L.me[0], L.me[1], M.dors);
    const mates = (L.mates || []).map((m, i) => E('m' + i, 'mate', m[0], m[1], nums[i]));
    const rivals = L.rivals.map((r, i) => { const e = E('r' + i, 'rival', r[0], r[1], rn[i]); e.name = r[2]; e.rt = rrt(); e.ic = clamp(e.rt + ri(-6, 4), 45, 95); e.mode = r[3] || 'chase'; e.mk = r[4] != null ? mates[r[4]] : null; return e; });
    E('gk', 'gk', .5, .06, 1); ball.v = true; ball.x = me.x + .005; ball.y = me.y - .04; boost = false;
    await banner(L.intro, 1300);
    let q = 0, acts = 0;
    for (;;) {
      if (me.y <= .42 && !L.cross && !L.gkAdv) return finish(await shootPhase({ q, gkAdv: !!L.gkAdv }));
      if (L.cross && me.y <= .42 && (me.x > .8 || me.x < .2)) {
        hl = me; info('');
        const a = await ask({ L: 'Centro', R: 'Cortar adentro' }); hl = null;
        if (a.k === 'R') { const d2 = rivals[rivals.length - 1]; const r2 = await duel({ me, def: d2, name: 'Central' }); if (!r2.ok) return 'lost'; await carry(me, .5, .38, 350); return finish(await shootPhase({ q: Math.max(q, r2.q), gkAdv: !!L.gkAdv })); }
        const p = clamp(.42 + (st.pas - 70) / 120, .2, .75);
        await tw(ball, .5, .2, 520);
        if (rnd() > p) { await banner('El centro no llega...', 900); logl('Centro desviado'); return 'lost'; }
        const gl = rnd() < .42; await tw(ball, .5, 0, 300); return finish(gl ? 'goal' : 'saved');
      }
      if (acts++ >= 6) { await banner('Se cerró el espacio', 1000); logl('Se cerró el espacio'); return 'lost'; }
      const a = await getAction(me, mates, rivals);
      if (a.t === 'hit') { const d = await duel({ me, def: a.hit, name: a.hit.name || 'Defensor' }); if (!d.ok) return 'lost'; rivals.splice(rivals.indexOf(a.hit), 1); q = Math.max(q, d.q); continue; }
      if (a.t === 'shoot') { if (me.y > .62) { info('Estás muy lejos del arco: avanzá un poco más.'); acts--; continue; } q -= Math.max(0, me.y - .42) * .5; return finish(await shootPhase({ q, gkAdv: !!L.gkAdv })); }
      if (a.t === 'pass') {
        const m = a.mate; let ic = 0;
        rivals.forEach((r) => { const dx = m.x - me.x, dy = m.y - me.y, l2 = dx * dx + dy * dy || 1, k = clamp(((r.x - me.x) * dx + (r.y - me.y) * dy) / l2, 0, 1); if (dist(r, { x: me.x + dx * k, y: me.y + dy * k }) < .075) ic++; });
        ic += rivals.filter((r) => r.mk === m).length * .8;
        const p = clamp(.8 + (st.pas - 70) / 120 - .22 * ic, .2, .95);
        if (rnd() < p) {
          rivals.filter((r) => r.mode === 'chase' || r.on).forEach((r) => { r.on = false; tw(r, r.x + (m.x - r.x) * .45, r.y + (m.y - r.y) * .45, 700); });
          await tw(ball, m.x, m.y - .03, 420); await sleep(120);
          const nx = clamp(m.x + (.5 - m.x) * .35, .1, .9), ny = Math.max(.2, m.y - .07);
          await Promise.all([tw(me, nx, ny, 520), tw(ball, nx + .005, ny - .04, 520)]); logl(`Pared con un compañero (${Math.round(p * 100)}%)`);
        } else { await tw(ball, (me.x + m.x) / 2, (me.y + m.y) / 2, 300); await banner('¡Pase cortado!', 900); logl(`Pase interceptado (${Math.round(p * 100)}% de salir bien)`, 'r'); return 'lost'; }
        continue;
      }
      const hit = await follow(me, a.pts, rivals);
      if (hit) { const d = await duel({ me, def: hit, name: hit.name || 'Defensor' }); if (!d.ok) return 'lost'; rivals.splice(rivals.indexOf(hit), 1); q = Math.max(q, d.q); }
    }
  }

  /* =================== situaciones =================== */
  const SIT = {
    mano: { n: 'Mano a mano', run: () => attack({ intro: '¡Mano a mano! Un defensor te corre de atrás', gkAdv: true, me: [.5, .62], rivals: [[.62, .9, 'Defensor', 'chase']], mates: [[.24, .4]] }) },
    indiv: { n: 'Situación individual', run: () => attack({ intro: 'Un defensor te sale al cruce', me: [.5, .78], rivals: [[.5, .5, 'Defensor'], [.3, .3, 'Central', 'hold'], [.72, .62, 'Volante', 'chase']], mates: [[.2, .5], [.82, .4]] }) },
    contra: { n: 'Contragolpe', run: () => attack({ intro: '¡Contragolpe! Hay espacio', me: [.5, .86], rivals: [[.34, .5, 'Defensor 1'], [.66, .36, 'Defensor 2']], mates: [[.82, .58]] }) },
    desborde: { n: 'Desborde', run: () => attack({ intro: 'Subís por la banda', cross: true, me: [.9, .82], rivals: [[.74, .52, 'Lateral'], [.5, .26, 'Central', 'hold']], mates: [[.45, .22], [.62, .32]] }) },
    org: { n: 'Ataque organizado', run: () => attack({ intro: 'Salida y ataque con paciencia', me: [.5, .86], rivals: [[.42, .56, 'Mediocampista rival'], [.65, .44, 'Central', 'mark', 1], [.2, .5, 'Lateral', 'mark', 0]], mates: [[.26, .6], [.75, .46]] }) },
    riv: { n: 'Contragolpe del rival', run: async () => {
      view = 'half'; ents = []; const at = E('a', 'rival', .5, .46, 9), me = E('me', 'me', .5, .66, M.dors); E('gk', 'mygk', .5, .06, 1); E('m', 'mate', .3, .5, 4); ball.v = true; ball.x = .5; ball.y = .5;
      await banner('¡Contragolpe del rival! Defendés tu arco');
      const A = rrt(); corners([['Defensa', st.dfn]], [['Regate', A]], true);
      const a = await ask({ L: 'Bloquear', R: 'Barrida', C: mySkills('def') });
      const sk = a.skill ? SKD[a.skill] : null;
      let p = a.k === 'L' ? clamp(.55 + (st.dfn - A) / 80, .2, .85) : clamp(.5 + (st.dfn - A) / 55, .12, .88);
      const r0 = await duelBar(clamp(p + (sk ? sk.zone : 0), .1, .97), A, sk ? `${sk.n}: frená en el verde` : (a.k === 'L' ? 'Bloqueo' : 'Barrida') + ': frená en el verde'); corners(0, 0, false);
      let ok = r0 === 'win'; if (r0 === 'mid') { await banner('¡Pelota dividida!', 700); ok = rnd() < .5; }
      await Promise.all([tw(me, .5, .5, 380), tw(at, .5, .5 + (a.k === 'R' ? 0 : -.02), 380)]);
      if (ok) { await tw(ball, me.x, me.y + .05, 350); await banner('¡Cortaste el contragolpe!', 1100); logl(`Min ${M.min}: cortaste el contragolpe`, 'g'); return 'def'; }
      await banner('Se te escapa...', 700); await tw(ball, .5, .12, 450); await tw(ball, .5, .0, 250);
      if (rnd() < .3) { M.rv++; hud(); await banner('Gol del rival', 1200); logl(`Min ${M.min}: gol del rival`, 'r'); }
      else { await banner('¡Lo ataja tu arquero!', 1000); logl(`Min ${M.min}: tu arquero te salva`); }
      return 'lost'; } },
  };
  const POSW = {
    DEL: { mano: 3, indiv: 2, contra: 2, desborde: 1, org: 1, riv: .4 },
    EXT: { mano: 1.5, indiv: 2, contra: 2, desborde: 3, org: 1, riv: .6 },
    MED: { mano: .7, indiv: 1.5, contra: 2, desborde: 1, org: 3, riv: 1.5 },
    DEF: { mano: .2, indiv: .8, contra: 1, desborde: .5, org: 1.5, riv: 4 },
  };

  /* =================== el partido =================== */
  const wheelOpts = (m, ph) => ph === 'et' ? (m < 105 ? [5, 7, 9, 12] : [3, 5, 7, 'FIN'])
    : m < 30 ? [12, 18, 24, 30] : m < 60 ? [14, 18, 22, 26] : m < 80 ? [8, 10, 12, 15] : [4, 6, 8, 'FIN'];
  function backToClock() { view = 'full'; ents = []; gv = null; pathPts = []; hl = null; ball.v = false; corners(0, 0, false); info(''); tl.forEach((t) => { t.x = t.bx; t.y = t.by; }); tb.x = .5; tb.y = .5; tlMode = 'run'; }
  async function runClock(to, end, ph) { // el reloj corre rápido; frena si hay un gol y se ve cómo se arma
    while (M.min < to) {
      M.min++;
      if (ph === 'reg' && M.min === 45) { hudMin(); await banner('Entretiempo: se recuperan las habilidades', 1100); M.cd = {}; logl('Entretiempo'); }
      if (ph === 'et' && M.min === 105) M.cd = {};
      hudMin();
      if (M.min <= end) {
        if (rnd() < .004) { await animGoal('rv'); M.rv++; hud(); logl(`Min ${M.min}: gol del rival`, 'r'); await banner('Gol del rival', 1000); }
        else if (rnd() < .003) { await animGoal('me'); M.me++; hud(); logl(`Min ${M.min}: gol de tu equipo (no fuiste vos)`, 'g'); await banner('¡Gol de tu equipo!', 1000); }
      }
      await sleep(M.min > end ? 50 : 12);
    }
    hud();
  }
  async function phase(ph, end) {
    M.ph = ph; hud(); backToClock();
    const visAt = ph === 'et' ? 105 : 75;
    for (;;) {
      const o = wheelOpts(M.min, ph); let j;
      if (M.min >= visAt) { const idx = await spinWheel(`Ruleta de minutos · min ${M.min}`, o.map((x) => ({ label: x === 'FIN' ? 'Final' : '+' + x, w: 1 }))); j = o[idx]; }
      else { const f = o.filter((x) => x !== 'FIN'); j = f[ri(0, f.length - 1)]; }
      if (j === 'FIN') { await runClock(end + ri(0, 2), end, ph); logl(`El árbitro marca el final (${M.min > end ? end + '+' + (M.min - end) : end}')`); return; }
      const over = M.min + j >= end;
      await runClock(over ? end + ri(1, 3) : M.min + j, end, ph);
      if (rnd() < M.pSit) {
        const names = Object.keys(POSW[M.pos]), key = wpick(names.map((k) => [k, POSW[M.pos][k]]));
        $('#x-mn').classList.add('blink'); await banner('¡OPORTUNIDAD! ' + SIT[key].n, 1500); $('#x-mn').classList.remove('blink');
        M.sits++; hud(); logl(`— ${SIT[key].n} —`);
        await SIT[key].run(); await sleep(250); backToClock();
      } else if (M.min >= visAt) { await banner('Sin jugadas peligrosas', 800); }
      if (over) return;
    }
  }
  async function shootout() {
    view = 'half'; ents = []; ball.v = true; ball.x = .5; ball.y = .26; E('me', 'me', .5, .36, M.dors); E('gk', 'gk', .5, .05, 1);
    let a = 0, b = 0, round = 0; logl('— Tanda de penales —'); const rem = (k) => 5 - k;
    for (;;) {
      round++; await banner(`Penal ${round}: tu turno`, 900); ball.x = .5; ball.y = .26;
      const o = await shootPhase({ pen: true }); if (o === 'goal') { a++; logl(`Penal ${round}: ¡gol tuyo!`, 'g'); } else logl(`Penal ${round}: lo errás`, 'r');
      $('#x-score').textContent = `${M.me} - ${M.rv} (pen. ${a}-${b})`;
      if (round <= 5 && (a > b + rem(round - 1) || b > a + rem(round))) break;
      await banner('Patea el rival', 700); const rg = rnd() < .75; if (rg) b++; logl(`Rival ${round}: ${rg ? 'gol' : 'falla'}`, rg ? 'r' : 'g');
      $('#x-score').textContent = `${M.me} - ${M.rv} (pen. ${a}-${b})`;
      if (round <= 5 && (a > b + rem(round) || b > a + rem(round))) break;
      if (round >= 5 && a !== b) break;
    }
    return a > b;
  }
  async function play(o) {
    st = Object.assign({ reg: 70, pas: 70, fin: 70, dfn: 70 }, o.stats || {});
    RB = o.rb != null ? o.rb : 70;
    active = true; $('#mx').hidden = false; document.body.style.overflow = 'hidden';
    $('#x-end').hidden = true; $('#x-log').innerHTML = ''; $('#x-log').hidden = true; tlMode = 'run'; view = 'full';
    M = { me: (o.start && o.start[0]) || 0, rv: (o.start && o.start[1]) || 0, min: 0, ph: 'reg', cd: {}, pos: o.pos || 'DEL', pSit: o.pSit != null ? o.pSit : 0.45, kind: o.kind || 'ko', gk: o.gk || 70, g: 0, sits: 0, used: 0, skills: o.skills || [], dors: clamp(o.dors || 9, 1, 99) };
    $('#x-hA').textContent = o.home || 'Tu equipo'; $('#x-hB').textContent = o.away || 'Rival';
    await sleep(40); fit(); fitText($('#x-hA')); fitText($('#x-hB')); buildTL(); backToClock(); hud();
    info('El reloj corre solo y frena cuando aparece una oportunidad. Desde el 75 girás la ruleta de minutos.');
    await phase('reg', 90);
    let pen = null;
    if (M.me === M.rv && M.kind === 'ko') {
      await banner('¡Empatados! Prórroga', 1500); M.cd = {}; logl('Prórroga: se recuperan las habilidades'); await phase('et', 120);
      if (M.me === M.rv) pen = await shootout();
    }
    backToClock(); view = 'full';
    const win = pen != null ? pen : M.me > M.rv, draw = pen == null && M.me === M.rv;
    $('#x-end').hidden = false; $('#x-endT').textContent = draw ? `Empate ${M.me}-${M.rv}` : (win ? 'Ganaste' : 'Perdiste') + ` ${M.me}-${M.rv}` + (pen != null ? ' (penales)' : '');
    $('#x-endP').textContent = `Jugadas que te llegaron: ${M.sits} · goles tuyos: ${M.g} · técnicas usadas: ${M.used}.`;
    await new Promise((r) => { $('#x-again').onclick = r; });
    const out = { me: M.me, rv: M.rv, pen, g: M.g, sits: M.sits, used: M.used };
    $('#x-end').hidden = true; $('#mx').hidden = true; active = false; document.body.style.overflow = '';
    return out;
  }
  window.MatchMode = { play };
  window.__mx = () => ({ M, ents, view, input: !!inputH, picking: !!(gv && gv.picking), ASP });
})();
