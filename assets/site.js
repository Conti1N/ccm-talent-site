(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------- top bar: solid once the hero has scrolled past ----------
const bar = $('.bar'), hero = $('.hero'), ov = $('#ov'), mb = $('.menu');
const onScroll = () => { if (bar && hero && !bar.classList.contains('open')) bar.classList.toggle('solid', hero.getBoundingClientRect().bottom < 70); };
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// ---------- full-screen menu ----------
const setMenu = (open) => { ov.classList.toggle('on', open); bar.classList.toggle('open', open); mb.setAttribute('aria-expanded', open); mb.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); document.body.style.overflow = open ? 'hidden' : ''; if (!open) onScroll(); else bar.classList.remove('solid'); };
if (mb) { mb.addEventListener('click', () => setMenu(!ov.classList.contains('on'))); addEventListener('keydown', (e) => { if (e.key === 'Escape' && ov.classList.contains('on')) { setMenu(false); mb.focus(); } }); $$('a', ov).forEach((a) => a.addEventListener('click', () => setMenu(false))); }

// ---------- tabs with a sliding indicator ----------
$$('[role=tablist]').forEach((tl) => {
  const tabs = $$('[role=tab]', tl), ind = $('.ind', tl);
  const move = (t) => { if (ind) { ind.style.width = t.offsetWidth + 'px'; ind.style.transform = `translateX(${t.offsetLeft}px)`; } };
  const pick = (t) => tabs.forEach((x) => { const on = x === t, p = document.getElementById(x.getAttribute('aria-controls')); x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; p.hidden = !on; if (on) { p.classList.remove('show'); void p.offsetWidth; p.classList.add('show'); move(x); } });
  tabs.forEach((t, i) => { t.addEventListener('click', () => pick(t)); t.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; pick(n); n.focus(); } }); });
  const sel = tabs.find((t) => t.getAttribute('aria-selected') === 'true'); if (sel) { move(sel); addEventListener('resize', () => move(tabs.find((t) => t.getAttribute('aria-selected') === 'true'))); }
  if (document.fonts) document.fonts.ready.then(() => sel && move(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
});

// ---------- niche rows swap the picture and caption ----------
const rows = $$('.rows a'), pics = $$('.pic img'), wn = $('#who-n'), wd = $('#who-d');
rows.forEach((r) => ['mouseenter', 'focus'].forEach((ev) => r.addEventListener(ev, () => {
  rows.forEach((x) => x.classList.toggle('on', x === r)); pics.forEach((p) => p.classList.toggle('live', p.dataset.n === r.dataset.n));
  if (wn.textContent !== r.dataset.name) { wn.textContent = r.dataset.name; wd.textContent = r.dataset.d; }
})));

// ---------- forms go to our inbox through FormSubmit; if that fails, the visitor's email app opens filled in ----------
$$('form[data-subject]').forEach((f) => f.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(f)), say = $('[role=status]', f), b = $('button', f);
  if (d._honey) return;
  b.disabled = true; say.textContent = 'Sending...';
  try {
    const r = await fetch('https://formsubmit.co/ajax/ismail@conticonnects.com', { method: 'POST', signal: AbortSignal.timeout(12000), headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...d, _subject: f.dataset.subject + ' from the website', _template: 'table', _cc: 'nabeel@conticonnects.com' }) });
    const j = await r.json();
    if (!r.ok || String(j.success) !== 'true') throw 0;
    f.reset(); say.textContent = 'Sent. Thank you, we will reply by email today.';
  } catch {
    delete d._honey;
    location.href = 'mailto:ismail@conticonnects.com?cc=nabeel@conticonnects.com&subject=' + encodeURIComponent(f.dataset.subject) + '&body=' + encodeURIComponent(Object.entries(d).map(([k, v]) => k + ': ' + v).join('\n'));
    say.textContent = 'We could not send the form, so your email app should open with it filled in. If it does not, write to ismail@conticonnects.com.';
  }
  b.disabled = false;
}));

// ---------- headings split into words that rise in ----------
const splitWords = (el) => {
  const walk = (node) => [...node.childNodes].forEach((c) => {
    if (c.nodeType === 3) { const frag = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) frag.append(w); else { const o = document.createElement('span'); o.className = 'w'; const i = document.createElement('span'); i.textContent = w; o.append(i); frag.append(o); } }); c.replaceWith(frag); }
    else if (c.nodeType === 1) walk(c);
  });
  walk(el); $$('.w>span', el).forEach((s, i) => { s.style.transitionDelay = Math.min(i, 14) * 45 + 'ms'; });
};
$$('.ws').forEach(splitWords);

// ---------- reveal on scroll ----------
$$('.head>p,.who,.rows li,.grid>span,.more,.lock-in,.op>div:first-child,.list li,.doors li,.social,.talk form,.tabs,.cards a,.two>*,.founders article,.prose>*,details,.fcols>div').forEach((el) => {
  if (el.closest('.ws')) return; el.classList.add('rv');
  const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
  if (el.matches('.rows li,.grid>span,.list li,.doors li,.cards a,.founders article,details,.fcols>div')) el.style.transitionDelay = Math.min(sib, 8) * 45 + 'ms';
});
const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
$$('.rv,.ws,.panel').forEach((el) => io.observe(el));
requestAnimationFrame(() => requestAnimationFrame(() => hero && hero.classList.add('in')));

// ---------- panels drift as you scroll (eased) ----------
const par = $$('[data-par]'); let cur = scrollY, last = performance.now();
const tick = (now) => {
  const dt = Math.min(64, now - last); last = now; cur += (scrollY - cur) * (1 - Math.exp(-dt / 90));
  if (!reduce) { const vh = innerHeight; par.forEach((im) => { const r = im.parentElement.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return; const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2) + (scrollY - cur) / vh; im.style.transform = `translate3d(0,${(p * -7).toFixed(2)}%,0)`; }); }
  requestAnimationFrame(tick);
};
if (par.length) requestAnimationFrame(tick);

// ---------- live hero artwork: light ribbons in WebGL, the still image stays as fallback ----------
const art = $('.art');
if (art && !(navigator.connection && navigator.connection.saveData)) {
  const c = document.createElement('canvas'), gl = c.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (gl) {
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `precision highp float;uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
vec3 band(vec2 uv,float cy,float amp,float fr,float ph,float tilt,float sp,vec3 col,float n){
  vec3 acc=vec3(0.);
  for(int i=0;i<26;i++){float k=float(i)/25.;float o=(k-.5)*sp*(1.+.6*sin(uv.x*1.3+k*3.));
    float y=cy+tilt*(uv.x-.5)+amp*sin(uv.x*fr+ph+k*.9+t*.22)+.45*amp*sin(uv.x*fr*2.3+ph*1.7-k*.6-t*.17)+o;
    float d=abs(uv.y-y);float w=.35+.65*sin(3.14159*k);
    acc+=col*w*(.0016/(d+.0016)*.11+exp(-d*d*9000.)*.07);}
  return acc*n;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv;q.x=(q.x-.5)*(r.x/r.y)/1.71+.5;q+=m*.012;
  vec3 O=vec3(.65,.5,.4),B=vec3(.42,.33,.28),W=vec3(.9,.86,.78);
  vec3 c=band(q,.42,.12,4.6,.4,.22,.09,O,1.)+band(q,.56,.15,3.7,2.4,-.12,.1,B,1.)+band(q,.30,.06,7.,4.1,.05,.03,W,.6);
  c=1.-exp(-c*2.3);c=vec3(.043)+c*(.957);
  float v=smoothstep(1.25,.25,length((uv-vec2(.55,.5))*vec2(1.1,1.5)));c*=.55+.45*v;
  c+=(h(gl_FragCoord.xy+fract(t)*97.)-.5)*.045;gl_FragColor=vec4(c,1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (v && f) {
      const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr); gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const ur = gl.getUniformLocation(pr, 'r'), ut = gl.getUniformLocation(pr, 't'), um = gl.getUniformLocation(pr, 'm');
      art.append(c);
      let vis = true, mx = 0, my = 0, tx = 0, ty = 0, t0 = performance.now(), first = true;
      const size = () => { const s = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1 : 1.25) * .8; c.width = Math.round(art.clientWidth * s); c.height = Math.round(art.clientHeight * s); gl.viewport(0, 0, c.width, c.height); };
      size(); addEventListener('resize', size);
      new IntersectionObserver((e) => { vis = e[0].isIntersecting; }).observe(art);
      addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - .5; ty = .5 - e.clientY / innerHeight; }, { passive: true });
      const speed = reduce ? .25 : 1;
      const draw = (now) => { if (vis && !document.hidden) { mx += (tx - mx) * .04; my += (ty - my) * .04; gl.uniform2f(ur, c.width, c.height); gl.uniform1f(ut, (now - t0) / 1000 * speed + 3); gl.uniform2f(um, mx, my); gl.drawArrays(gl.TRIANGLES, 0, 3); if (first) { first = false; c.classList.add('on'); } } requestAnimationFrame(draw); };
      requestAnimationFrame(draw);
    }
  }
}
})();
