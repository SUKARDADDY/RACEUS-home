/* raceus.co.il library.
   Vanilla ES module, no build step, no dependencies.

   Four tiers decide everything a card does:
     open     open to anyone            filled marker, bright, the frame is a link
     access   behind Cloudflare Access  lock marker, bright, the frame is a link
     service  no browser entry point    lock marker, under-exposed, opens the sheet
     private  described, not published  hollow marker, under-exposed, opens the sheet

   Exposure is the status channel: bright means you can open it. */

const RAIL = [
  ['home', 'Home', '<path d="M3 10.4 12 3l9 7.4"/><path d="M5.5 9.6V20h13V9.6"/>'],
  ['open', 'Open now', '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>'],
  ['work', 'Work', '<circle cx="12" cy="12" r="9"/><path d="m15.2 8.8-2 4.4-4.4 2 2-4.4z"/>'],
  ['services', 'Services', '<path d="M10 4h4v2.2a1.8 1.8 0 1 0 3.6 0V4H20v4h-1.8a1.8 1.8 0 1 0 0 3.6H20V20h-4.4v-2.2a1.8 1.8 0 1 0-3.6 0V20H4v-4.4h2.2a1.8 1.8 0 1 0 0-3.6H4V8h6z"/>'],
];

const ROWS = [
  { key: 'work', label: 'Work' },
  { key: 'services', label: 'Services' },
];

const TIER_LABEL = {
  open: 'open to anyone',
  access: 'behind Cloudflare Access',
  service: 'Access service token only',
  private: 'not published',
};

const TIER_GATE = {
  access: 'Behind Cloudflare Access. The link goes straight to the host, so you meet the Cloudflare login before the app does.',
  service: 'No browser entry point. This card documents the connection instead of pretending to open it.',
  private: 'Client or internal work. Described here, with no public link.',
};

const lockSvg = (size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"` +
  ` stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
  `<rect x="4.5" y="10.5" width="15" height="10" rx="1.5"/>` +
  `<path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>`;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const canOpen = (it) => (it.tier === 'open' || it.tier === 'access') && Boolean(it.url);
const isShut = (it) => it.tier === 'service' || it.tier === 'private';

/* A silver print: cool shadows, warm highlights, exposure set by `tone`.
   Four key-light compositions so the sheet has variety, plus one hard edge
   where the light falls across the surface. */
const KEYS = [
  (h) => `radial-gradient(66% 42% at 26% 16%, hsl(38 12% ${h}%), transparent 66%)`,
  (h) => `radial-gradient(54% 38% at 52% 34%, hsl(40 10% ${h}%), transparent 68%)`,
  (h) => `radial-gradient(60% 54% at 86% 24%, hsl(34 13% ${h}%), transparent 64%)`,
  (h) => `radial-gradient(92% 40% at 48% 86%, hsl(38 11% ${h - 7}%), transparent 68%)`,
];
function emulsion(tone, v, lit) {
  let hi = Math.round(54 + tone * 38);
  let key = v % 4;
  /* Exposure is the status channel, so a card you can open must never print
     darker than one you cannot. KEYS[3] is the bottom glow, the dimmest
     composition of the four: openable cards fall back to `v % 3`, which picks
     one of the other three and is just as stable per project. The floor then
     keeps even a low-`tone` open card clear of the under-exposed band. */
  if (lit) {
    if (key === 3) key = v % 3;
    hi = Math.max(78, hi);
  }
  const lo = Math.round(5 + tone * 8);
  const cut = [104, 82, 118, 96][v % 4];
  return (
    KEYS[key](hi) + ',' +
    `linear-gradient(${cut}deg, rgba(8,9,11,0) 47%, rgba(8,9,11,.5) 47.5%),` +
    `linear-gradient(${158 + v * 8}deg, hsl(214 12% ${lo + 10}%) 0%, hsl(220 16% ${lo + 4}%) 48%, hsl(222 20% ${Math.max(3, lo - 1)}%) 100%)`
  );
}
/* stable per-project composition, so a plate always looks the same */
const vary = (id) => id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

/* `brand` is only ever true in the detail sheet: the plates stay monochrome
   so exposure remains the one thing that says what you can open. */
function plateHtml(item, brand) {
  return (
    `<div class="em" style="background:${emulsion(item.tone, vary(item.id), !isShut(item))}"></div>` +
    `<div class="gr"></div><div class="vg"></div>` +
    logoHtml(item, 'logo', brand) +
    `<div class="cap2">${esc(item.plate)}</div>`
  );
}

/* Most marks are monochrome masks the page tints. A few projects ship a
   full-colour logo that has to stay its own colours, so those render as an
   image and never take a `color`. `cls` is the caller's positioning class. */
function logoHtml(item, cls, brand) {
  if (item.logoMode === 'image') {
    return `<img class="${cls} img" src="logos/${esc(item.logo)}.png" alt="" aria-hidden="true">`;
  }
  return `<span class="${cls}"${brand && item.brand ? ` style="color:${esc(item.brand)}"` : ''} ` +
    `data-logo="${esc(item.logo)}" aria-hidden="true"></span>`;
}

function markerHtml(item) {
  if (item.tier === 'open') return '<span class="mk open" aria-hidden="true"></span>';
  if (item.tier === 'access' || item.tier === 'service') {
    return `<span class="mk lock" aria-hidden="true">${lockSvg(11)}</span>`;
  }
  return '<span class="mk" aria-hidden="true"></span>';
}

const hintText = (item) =>
  canOpen(item) ? 'Open' : item.tier === 'service' ? 'Locked' : 'Details';

/* ── state ─────────────────────────────────────────────── */
let CATALOG = [];
let nav = 'home';
let q = '';
let sheetItem = null;
let lastFocus = null;

const $ = (sel) => document.querySelector(sel);
const railEl = $('#rail');
const shellEl = $('#shell');
const input = $('#q');
const clrBtn = $('#clr');
const hintEl = $('#hint');
const homeEl = $('#home');
const launchEl = $('#launch');

/* CSS masks want a url(), and building one per element by hand in every
   template is how a path typo ships silently. One pass, one place. */
function paintLogos(root) {
  root.querySelectorAll('[data-logo]').forEach((el) => {
    el.style.setProperty('--logo', `url("logos/${el.dataset.logo}.svg")`);
  });
}
const rowsEl = $('#rows');
const browseEl = $('#browse');
const resultsEl = $('#results');
const sheetRoot = $('#sheet-root');

const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── frame (poster) ────────────────────────────────────── */
function frameEl(item) {
  const openable = canOpen(item);

  const fr = document.createElement('div');
  fr.className = 'fr' + (isShut(item) ? ' shut' : '');

  const fw = document.createElement('div');
  fw.className = 'fw';

  const frame = document.createElement(openable ? 'a' : 'div');
  frame.className = 'frame';
  frame.innerHTML =
    plateHtml(item) + markerHtml(item) +
    `<div class="openhint">${hintText(item)}</div>`;

  if (openable) {
    frame.href = item.url;
    frame.target = '_blank';
    frame.rel = 'noopener';
    frame.setAttribute('aria-label', `Open ${item.title}`);
  } else {
    frame.tabIndex = 0;
    frame.setAttribute('role', 'button');
    frame.setAttribute('aria-label', `${item.title}, details`);
    frame.addEventListener('click', () => openSheet(item));
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSheet(item); }
    });
  }
  fw.appendChild(frame);

  if (openable) {
    const info = document.createElement('button');
    info.type = 'button';
    info.className = 'info';
    info.textContent = 'i';
    info.setAttribute('aria-label', `Details for ${item.title}`);
    info.addEventListener('click', (e) => { e.preventDefault(); openSheet(item); });
    fw.appendChild(info);
  }

  const cap = document.createElement('div');
  cap.className = 'cap';
  cap.innerHTML = `<b>${esc(item.title)}</b><span>${esc(item.host || item.blurb)}</span>`;

  fr.appendChild(fw);
  fr.appendChild(cap);
  return fr;
}

/* ── section head ──────────────────────────────────────── */
function headEl(label, count, moreKey) {
  const head = document.createElement('div');
  head.className = 'head';
  head.innerHTML =
    `<h2>${esc(label)}</h2><span class="rule"></span>` +
    `<span class="count"><b>${count}</b></span>`;
  if (moreKey) {
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'more';
    more.textContent = 'See all';
    more.addEventListener('click', () => setNav(moreKey));
    head.appendChild(more);
  }
  return head;
}

/* ── horizontally scrolling row ────────────────────────── */
function rowEl(items) {
  const row = document.createElement('div');
  row.className = 'row';

  const strip = document.createElement('div');
  strip.className = 'strip';
  items.forEach((it) => strip.appendChild(frameEl(it)));

  const nudge = (dir, cls, glyph, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'nudge ' + cls;
    b.textContent = glyph;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', () => strip.scrollBy({
      left: dir * strip.clientWidth * 0.8,
      behavior: reduceMotion() ? 'auto' : 'smooth',
    }));
    return b;
  };

  row.appendChild(nudge(-1, 'l', '‹', 'Scroll left'));
  row.appendChild(nudge(1, 'r', '›', 'Scroll right'));
  row.appendChild(strip);
  return row;
}

/* ── detail sheet ──────────────────────────────────────── */
function openSheet(item) {
  lastFocus = document.activeElement;
  sheetItem = item;

  const facts = [esc(item.name), '·', esc(TIER_LABEL[item.tier])];
  if (item.host) facts.push('·', esc(item.host));

  const gate = TIER_GATE[item.tier]
    ? `<div class="gate">${esc(TIER_GATE[item.tier])}</div>` : '';

  const acts = [];
  if (canOpen(item)) {
    acts.push(`<a class="btn primary" href="${esc(item.url)}" target="_blank" rel="noopener">Open</a>`);
  }
  if (item.repo) {
    acts.push(`<a class="btn" href="${esc(item.repo)}" target="_blank" rel="noopener">Source</a>`);
  }
  acts.push('<button type="button" class="btn" data-close>Close</button>');

  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  backdrop.innerHTML =
    `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(item.title)}">` +
      `<div class="top">` +
        `<button type="button" class="close" data-close aria-label="Close">✕</button>` +
        `<div class="mini"><div class="frame">${plateHtml(item, true)}</div></div>` +
        `<div class="info2">` +
          `<h3>${esc(item.title)}</h3>` +
          `<div class="facts">${facts.map((f) => `<span>${f}</span>`).join('')}</div>` +
          `<div class="long">${esc(item.long)}</div>` +
          `<div class="chips">${item.stack.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>` +
          gate +
        `</div>` +
      `</div>` +
      `<div class="acts">${acts.join('')}</div>` +
    `</div>`;

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop || e.target.closest('[data-close]')) closeSheet();
  });

  sheetRoot.appendChild(backdrop);
  paintLogos(backdrop);
  /* aria-modal only tells a screen reader the rest is out of play. `inert`
     makes it true for the keyboard too, so Tab cannot walk out of the sheet
     and land on the page behind the backdrop. */
  shellEl.inert = true;
  railEl.inert = true;
  backdrop.querySelector('.close').focus();
}

function closeSheet() {
  if (!sheetItem) return;
  sheetItem = null;
  sheetRoot.replaceChildren();
  shellEl.inert = false;
  railEl.inert = false;
  if (lastFocus && lastFocus.isConnected) lastFocus.focus();
  lastFocus = null;
}

/* ── search ────────────────────────────────────────────── */
/* `long` is deliberately out of the haystack: a two-paragraph essay makes
   every query match everything. */
const haystack = (it) =>
  [it.title, it.name, it.host || '', it.blurb, it.stack.join(' ')]
    .join(' ').toLowerCase();

function matches() {
  const t = q.trim().toLowerCase();
  let pool = CATALOG;
  if (nav === 'open') pool = pool.filter(canOpen);
  if (nav === 'work') pool = pool.filter((i) => i.group === 'work');
  if (nav === 'services') pool = pool.filter((i) => i.group === 'services');
  if (!t) return pool;
  return pool.filter((i) => haystack(i).includes(t));
}

/* ── render ────────────────────────────────────────────── */
/* The rail is built once and then only re-marked. Rebuilding it on every
   render destroyed the button the user had just activated, throwing focus
   back to <body> mid-keyboard-navigation. */
const railBtns = new Map();

function buildRail() {
  RAIL.forEach(([key, label, path]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'railbtn';
    b.setAttribute('aria-label', label);
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>` +
      `<span class="tip">${esc(label)}</span>`;
    b.addEventListener('click', () => setNav(key));
    railEl.appendChild(b);
    railBtns.set(key, b);
  });
}

/* The rail navigates between views, so the active one is aria-current="page",
   not a pressed toggle. */
function syncRail() {
  railBtns.forEach((b, key) => {
    if (nav === key) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
}

function renderHome() {
  const launchable = CATALOG.filter(canOpen);
  $('#launch-count').textContent = String(launchable.length);

  launchEl.replaceChildren();
  launchable.forEach((it, i) => {
    const a = document.createElement('a');
    a.className = 'lt';
    a.href = it.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML =
      `<span class="n">${i + 1}${it.tier === 'access' ? lockSvg(11) : ''}</span>` +
      logoHtml(it, 'ltlogo') +
      `<span class="go" aria-hidden="true">↗</span>` +
      `<span class="nm">${esc(it.title)}</span>` +
      `<span class="hs">${esc(it.host)}</span>`;
    launchEl.appendChild(a);
  });

  rowsEl.replaceChildren();
  ROWS.forEach((g) => {
    const items = CATALOG.filter((i) => i.group === g.key);
    if (!items.length) return;
    const section = document.createElement('section');
    section.appendChild(headEl(g.label, items.length, g.key));
    section.appendChild(rowEl(items));
    rowsEl.appendChild(section);
  });
  paintLogos(homeEl);
}

function renderBrowse() {
  const found = matches();
  const label = nav === 'open' ? 'Open now'
    : nav === 'services' ? 'Services'
    : q.trim() ? 'Results' : 'Work';
  $('#browse-label').textContent = label;
  $('#browse-count').textContent = String(found.length);

  resultsEl.replaceChildren();
  if (found.length) {
    const grid = document.createElement('div');
    grid.className = 'grid';
    found.forEach((it) => grid.appendChild(frameEl(it)));
    resultsEl.appendChild(grid);
  } else {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.innerHTML =
      `Nothing matches <b>${esc(q.trim())}</b>.` +
      `<p>Try a hostname like plan, or a stack like D1.</p>`;
    resultsEl.appendChild(empty);
  }
  paintLogos(browseEl);
}

/* The box is a view of `q`, not a second source of truth. Every path that
   changes `q` — typing, the ✕, Escape, a rail button — goes through render,
   so this is the one place that keeps the text in sync. The guard leaves the
   caret alone while the user is the one doing the typing. */
function syncInput() {
  if (input.value !== q) input.value = q;
}

function render() {
  const browsing = q.trim().length > 0 || nav !== 'home';
  syncInput();
  syncRail();
  clrBtn.hidden = !q;
  hintEl.hidden = Boolean(q);
  homeEl.hidden = browsing;
  browseEl.hidden = !browsing;
  if (browsing) renderBrowse();
  else resultsEl.replaceChildren();
}

function setNav(key) {
  nav = key;
  q = '';
  render();
}

function setQ(value) {
  q = value;
  render();
}

/* ── keys ──────────────────────────────────────────────── */
/* Number keys click the launch tile's own anchor, inside the keydown handler,
   so the browser sees a user gesture and does not treat it as a popup. */
function onKey(e) {
  const typing = document.activeElement === input;

  if (e.key === 'Escape') {
    if (sheetItem) { closeSheet(); return; }
    if (q) setQ('');
    if (typing) input.blur();
    return;
  }
  /* the search box sits behind the backdrop, so `/` must not reach for it */
  if (e.key === '/' && !typing && !sheetItem) { e.preventDefault(); input.focus(); return; }
  if (typing || sheetItem || e.metaKey || e.ctrlKey || e.altKey) return;

  /* the numbers belong to the launch strip, which only exists on Home */
  if (homeEl.hidden) return;
  const tiles = launchEl.querySelectorAll('a.lt');
  const n = parseInt(e.key, 10);
  if (!(n >= 1 && n <= Math.min(9, tiles.length))) return;
  const tile = tiles[n - 1];
  if (tile) { e.preventDefault(); tile.click(); }
}

/* ── boot ──────────────────────────────────────────────── */
buildRail();
syncRail();   /* mark Home before the catalogue resolves, and if it never does */
input.addEventListener('input', () => setQ(input.value));
clrBtn.addEventListener('click', () => { setQ(''); input.focus(); });
window.addEventListener('keydown', onKey);

fetch('/catalog.json', { cache: 'no-cache' })
  .then((r) => {
    if (!r.ok) throw new Error(`catalog.json: HTTP ${r.status}`);
    return r.json();
  })
  .then((data) => {
    CATALOG = data;
    renderHome();
    render();
  })
  .catch((err) => {
    homeEl.hidden = true;
    browseEl.hidden = false;
    $('#browse-label').textContent = 'Library';
    $('#browse-count').textContent = '0';
    resultsEl.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = `The catalogue did not load. ${err.message}`;
    resultsEl.appendChild(empty);
  });
