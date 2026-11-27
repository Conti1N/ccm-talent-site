// CCM art pieces. Every piece runs only while on screen; with reduced motion each plays once and stops on its final state.
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const W = (ms) => new Promise((r) => setTimeout(r, reduce ? Math.min(ms, 60) : ms));
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const show = (e) => requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add('on')));

// waits until the element is on screen (and the tab is visible)
const seen = new WeakMap();
const io = new IntersectionObserver((es) => es.forEach((x) => { const s = seen.get(x.target); if (s) { s.v = x.isIntersecting; if (s.v) s.wake.splice(0).forEach((f) => f()); } }), { rootMargin: '80px' });
const watch = (el) => { const s = { v: false, wake: [] }; seen.set(el, s); io.observe(el); return () => (s.v && !document.hidden) ? Promise.resolve() : new Promise((r) => { s.wake.push(r); if (document.hidden) addEventListener('visibilitychange', () => { if (!document.hidden && s.v) r(); }, { once: true }); }); };
const loop = async (el, body) => { const gate = watch(el); do { await gate(); await body(); } while (!reduce); };

// canvas helper: sized to its box, redraws only while on screen
const canvasLoop = (el, draw) => {
  const c = h('canvas'); el.append(c); const x = c.getContext('2d'); let w = 0, ht = 0, vis = false;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); w = el.clientWidth; ht = el.clientHeight; c.width = w * d; c.height = ht * d; x.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener('resize', size);
  new IntersectionObserver((e) => { vis = e[0].isIntersecting; }, { rootMargin: '60px' }).observe(el);
  if (reduce) { const once = () => draw(x, w, ht, 4000); once(); addEventListener('resize', once); return; }
  const f = (t) => { if (vis && !document.hidden) draw(x, w, ht, t); requestAnimationFrame(f); }; requestAnimationFrame(f);
};

const P = {
  // ---------- home hero: the phone and the flying messages ----------
  phone(el) {
    const ph = h('div', 'fx-ph', '<span class="rec"><i></i>REC 00:14</span><span class="vf">fit check</span><span class="shut"></span>');
    const deal = h('div', 'fx-deal', '<small>CCM</small><b>Deal closed</b><span>Posting Friday</span>');
    el.append(ph, deal);
    const N = ['Collab?', 'What is your rate?', 'Following up', 'Usage rights?', 'Can you post today?', 'Invoice overdue', 'Contract attached', 'Re: Re: brief', 'Still interested?', 'Exclusivity?', 'Draft v4', 'Any update?'];
    loop(el, async () => {
      deal.classList.remove('on');
      const els = N.map((t) => { const f = h('span', 'fx-fly', t); el.append(f); return f; });
      await W(80);
      for (let i = 0; i < els.length; i++) { const a = (i / els.length) * Math.PI * 2 + .3, r = 150 + (i % 3) * 42; els[i].style.opacity = 1; els[i].style.transform = `translate(-50%,-50%) translate(${Math.cos(a) * r * 1.25}px,${Math.sin(a) * r * .95}px) rotate(${(i % 2 ? -1 : 1) * (3 + i % 6)}deg)`; await W(190); }
      await W(1500);
      els.forEach((f) => { f.style.transform = 'translate(-50%,-50%) scale(.2)'; f.style.opacity = 0; });
      await W(700); deal.classList.add('on'); await W(3000);
      if (!reduce) els.forEach((f) => f.remove());
    });
  },

  // ---------- creator pages hero: strike-through words ----------
  strike(el) {
    const k = h('span', 'kw', 'Rates.<s></s>'), sub = h('span', 'ks', 'The part of a brand deal nobody wants.'); el.append(k, sub);
    const L = ['Rates.', 'Contracts.', 'Usage rights.', 'Follow-ups.', 'Invoices.'];
    loop(el, async () => {
      for (const t of L) { k.firstChild.textContent = t; k.classList.remove('x'); sub.textContent = 'The part of a brand deal nobody wants.'; await W(700); k.classList.add('x'); await W(650); }
      k.firstChild.textContent = 'Handled.'; k.classList.remove('x'); k.classList.add('done'); sub.textContent = 'CCM Talent. You make the content.'; await W(2600); k.classList.remove('done');
    });
  },

  // ---------- for brands: fit scores ----------
  fit(el) {
    const box = h('div', 'fx-rows'); el.append(box);
    const row = (html) => { const d = h('div', 'fx-r', html); box.append(d); show(d); return d; };
    loop(el, async () => {
      box.innerHTML = '';
      row('<span>Brief: summer launch</span><em>received</em>'); await W(900);
      for (const [n, f] of [['Creator A', 92], ['Creator B', 86], ['Creator C', 74]]) {
        const d = row(`<span class="g">${n}<span class="bar"><b></b></span></span><em>${f}% audience fit</em>`); await W(90); d.querySelector('b').style.width = f + '%'; await W(650);
      }
      row('<span>Deliverables, usage, dates</span><i>in writing</i>'); await W(800);
      row('<span>Post live · link and results</span><i>sent</i>'); await W(3000);
    });
  },

  // ---------- for creators: the hand-off ----------
  handoff(el) {
    const tray = h('div', 'fx-tray', '<b>0</b>handled by CCM'), list = h('div', 'fx-todo'), last = h('div', 'fx-last', 'Make the content.');
    el.append(tray, list, last); const n = tray.querySelector('b');
    const L = ['Find brands to pitch', 'Write the pitch emails', 'Answer "what is your rate?"', 'Negotiate usage rights', 'Read the contract', 'Chase the posting date', 'Send the invoice', 'Chase the payment'];
    loop(el, async () => {
      list.innerHTML = ''; last.classList.remove('on'); n.textContent = '0';
      const its = L.map((s) => { const d = h('div', 'fx-it', '<i></i>' + s); list.append(d); return d; });
      await W(1400);
      for (let i = 0; i < its.length; i++) { its[i].classList.add('fx-hot'); await W(160); its[i].classList.add('fx-gone'); n.textContent = i + 1; await W(320); }
      await W(300); list.innerHTML = ''; last.classList.add('on'); await W(3200);
    });
  },

  // ---------- home wide panel: meet in the middle ----------
  meet(el) {
    const [a, m, b] = ['BRAND', 'AGREED THROUGH CCM', 'CREATOR'].map((t, i) => { const c = h('div', 'fx-col c' + i, `<small>${t}</small>`); el.append(c); return c; });
    const R = [['Wants reach', 'Wants fair pay', 'Matched on audience'], ['Needs dates', 'Needs time to create', 'Schedule set'], ['Wants ad usage', 'Wants clear limits', 'Usage: 30 days'], ['Needs approval', 'Needs creative say', 'One round of notes'], ['Wants results', 'Wants to be paid', 'Report and payment']];
    loop(el, async () => {
      [a, m, b].forEach((c) => $$('.fx-b,.fx-k', c).forEach((x) => x.remove()));
      for (const [x, y, z] of R) {
        const p = h('div', 'fx-b', x), q = h('div', 'fx-b', y); a.append(p); b.append(q); show(p); show(q); await W(420);
        p.classList.add('go'); q.classList.add('go'); await W(520);
        const k = h('div', 'fx-k', z); m.append(k); show(k); await W(520);
      }
      await W(2800);
    });
  },

  // ---------- brands page: creator card ----------
  card(el) {
    el.append(h('div', 'fx-cd', '<div class="ph"></div><b>Creator A</b><span class="t">Lifestyle creator</span><div class="st"></div>'));
    const cd = el.firstChild, st = cd.querySelector('.st');
    const S = [['Audience', 'Mostly 18 to 34'], ['Top cities', 'NYC, LA, Toronto'], ['Engagement', 'Strong, steady'], ['Fit for your brief', 'High'], ['Available', 'Next 3 weeks']];
    loop(el, async () => {
      st.innerHTML = ''; cd.classList.add('flip'); await W(450); cd.classList.remove('flip'); await W(450);
      for (const [x, y] of S) { const d = h('div', 'fx-s', `<span>${x}</span><b>${y}</b>`); st.append(d); show(d); await W(520); }
      await W(2800);
    });
  },

  // ---------- brands page: results report ----------
  report(el) {
    const ch = h('div', 'fx-ch', '<b></b>'.repeat(7)), kp = h('div', 'fx-kp', '<div><b>Live</b>on the agreed date</div><div><b>Link</b>sent the same day</div><div><b>Report</b>views, saves, clicks</div>');
    el.append(ch, kp); const bars = $$('b', ch), ks = $$('div', kp), H = [18, 24, 30, 42, 58, 76, 100];
    loop(el, async () => {
      bars.forEach((x) => { x.style.height = '0'; }); ks.forEach((x) => x.classList.remove('on')); await W(500);
      for (let i = 0; i < bars.length; i++) { bars[i].style.height = H[i] + '%'; await W(220); }
      for (const x of ks) { x.classList.add('on'); await W(420); }
      await W(2800);
    });
  },

  // ---------- brands page: six-step path ----------
  path(el) {
    const line = h('div', 'fx-line'); el.append(h('small', 'fx-lt t', 'BRAND GETS'), h('small', 'fx-lt b', 'CREATOR GETS'), line);
    const S = [['Match', 'Creators who fit the audience', 'Brands they would actually use'], ['Terms', 'Clear deliverables', 'A fair rate, agreed'], ['Contract', 'Usage and rights set', 'Nothing hidden in the fine print'], ['Content', 'Drafts on brief', 'Creative freedom kept'], ['Posted', 'On the agreed date', 'Disclosed properly'], ['Close', 'Live link and results', 'Paid on time']];
    const els = S.map(([n, x, y], i) => { const d = h('div', 'fx-st', `<p class="u">${x}</p><span class="dot"></span><b>${n}</b><p class="d">${y}</p>`); d.style.left = i * 17 + '%'; el.append(d); return d; });
    loop(el, async () => {
      els.forEach((e) => e.classList.remove('on')); line.style.transform = 'scaleX(0)'; await W(600);
      for (let i = 0; i < els.length; i++) { line.style.transform = `scaleX(${(i + 1) / els.length})`; els[i].classList.add('on'); await W(950); }
      await W(2800);
    });
  },

  // ---------- talent management page: inbox to checklist ----------
  check(el) {
    const box = h('div', 'fx-rows'); el.append(box);
    loop(el, async () => {
      box.innerHTML = '';
      const m = ['Collab?', 'What is your rate??', 'Following up…', 'Contract attached', 'Invoice still unpaid'].map((t) => { const d = h('div', 'fx-r', `<span>${t}</span><em>unread</em>`); box.append(d); show(d); return d; });
      await W(1700); m.forEach((x) => x.classList.remove('on')); await W(500); box.innerHTML = '';
      for (const t of ['Brand pitched for you', 'Terms negotiated', 'Contract checked', 'Posting date set', 'Paid on time']) { const d = h('div', 'fx-r', `<span>${t}</span><i>done</i>`); box.append(d); show(d); await W(560); }
      await W(3000);
    });
  },

  // ---------- footers ----------
  dusk(el) {
    canvasLoop(el, (x, w, ht, t) => {
      const g = x.createLinearGradient(0, 0, 0, ht); g.addColorStop(0, '#0B0B0B'); g.addColorStop(.55, '#121110'); g.addColorStop(.85, '#241e1a'); g.addColorStop(1, '#3a302a'); x.fillStyle = g; x.fillRect(0, 0, w, ht);
      const sy = ht * .98 - Math.sin(t / 9000) * ht * .06, sg = x.createRadialGradient(w / 2, sy, 0, w / 2, sy, w * .5);
      sg.addColorStop(0, 'rgba(232,184,122,.28)'); sg.addColorStop(.25, 'rgba(200,150,110,.08)'); sg.addColorStop(1, 'rgba(107,85,71,0)'); x.fillStyle = sg; x.fillRect(0, 0, w, ht);
      for (let i = 0; i < 46; i++) { x.fillStyle = `rgba(250,250,248,${.12 + .3 * Math.max(0, Math.sin(t / 700 + i))})`; x.fillRect((i * 137.5) % w, (i * 71) % (ht * .45), 1.2, 1.2); }
      for (let k = 0; k < 5; k++) { x.fillStyle = `rgba(11,11,11,${.2 + k * .14})`; x.beginPath(); x.moveTo(0, ht); for (let px = 0; px <= w + 8; px += 8) x.lineTo(px, ht * (.66 + k * .07) + Math.sin(px / (200 - k * 22) + t / (5200 + k * 900) + k) * 6 * (k + 1)); x.lineTo(w, ht); x.fill(); }
    });
  },
  waves(el) {
    canvasLoop(el, (x, w, ht, t) => {
      x.fillStyle = '#0B0B0B'; x.fillRect(0, 0, w, ht);
      for (let k = 0; k < 24; k++) { x.strokeStyle = `rgba(${k % 3 ? '107,85,71' : '200,184,154'},${.1 + k / 60})`; x.lineWidth = 1; x.beginPath(); for (let px = 0; px <= w; px += 6) { const y = ht * .28 + k * (ht / 46) + Math.sin(px / 150 + t / 1500 + k * .3) * 18 + Math.sin(px / 62 - t / 950) * 4; px ? x.lineTo(px, y) : x.moveTo(px, y); } x.stroke(); }
    });
  },
  fog(el) {
    const B = [...Array(16)].map((_, i) => ({ x: (i * .37) % 1.3 - .15, y: .4 + ((i * .53) % .7), r: .16 + ((i * .29) % .26), s: .00005 + ((i * .17) % 1) * .00009, c: i % 3 }));
    const col = ['107,85,71', '166,139,120', '200,184,154'];
    canvasLoop(el, (x, w, ht, t) => {
      x.fillStyle = '#0B0B0B'; x.fillRect(0, 0, w, ht);
      B.forEach((b) => { const bx = ((b.x + t * b.s * .06) % 1.6) - .3; const g = x.createRadialGradient(bx * w, b.y * ht, 0, bx * w, b.y * ht, b.r * w); g.addColorStop(0, `rgba(${col[b.c]},.26)`); g.addColorStop(1, `rgba(${col[b.c]},0)`); x.fillStyle = g; x.fillRect(0, 0, w, ht); });
      const g = x.createLinearGradient(0, 0, 0, ht); g.addColorStop(0, 'rgba(11,11,11,1)'); g.addColorStop(.55, 'rgba(11,11,11,0)'); x.fillStyle = g; x.fillRect(0, 0, w, ht);
    });
  },
};

$$('[data-fx]').forEach((el) => { const f = P[el.dataset.fx]; if (f) f(el); });
})();
