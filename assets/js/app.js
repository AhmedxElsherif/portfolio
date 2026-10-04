import { esc, md, youtubeId, normalizeProject, loadSite } from './common.js';

const $ = (s, r = document) => r.querySelector(s);
const params = new URLSearchParams(location.search);
const isPreview = params.has('preview');

let site = { profile: {}, projects: [] };
let activeCat = 'All';
let query = '';
let viewer = null;
let lastFocus = null;

/* ---------- theme ---------- */
$('#themeBtn').addEventListener('click', () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('theme', root.dataset.theme); } catch { /* ignore */ }
});

/* ---------- boot ---------- */
(async function init() {
  try {
    site = await loadSite({ preferDraft: isPreview });
  } catch (e) {
    $('#grid').innerHTML = `<p class="empty">Could not load data/site.json — ${esc(e.message)}</p>`;
    return;
  }
  site.projects = (site.projects || []).map(normalizeProject);
  if (isPreview) document.body.insertAdjacentHTML('afterbegin', '<div class="preview-bar mono">PREVIEW — showing unsaved draft from the dashboard</div>');
  renderProfile(site.profile || {});
  renderFilters();
  renderGrid();
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();

/* ---------- profile ---------- */
function renderProfile(p) {
  document.title = `${p.name || 'Portfolio'} — ${p.title || 'Embedded Systems'}`;
  $('#brandName').textContent = (p.name || 'Portfolio').split(' ').slice(0, 2).join(' ');
  $('#heroName').textContent = p.name || '';
  $('#heroTitle').textContent = p.title || '';
  $('#heroTagline').textContent = p.tagline ? `> ${p.tagline}` : '';
  $('#heroSummary').textContent = p.summary || '';
  $('#footName').textContent = p.name || '';
  $('#year').textContent = new Date().getFullYear();

  const cta = [];
  cta.push('<a class="btn primary" href="#projects">View projects</a>');
  if (p.cv) cta.push(`<a class="btn" href="${esc(p.cv)}" target="_blank" rel="noopener">Download CV</a>`);
  if (p.linkedin) cta.push(`<a class="btn ghost" href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>`);
  $('#heroCta').innerHTML = cta.join('');

  const n3d = site.projects.filter((x) => x.models.some((m) => m.url)).length;
  const tools = new Set(site.projects.flatMap((x) => x.tools));
  $('#stats').innerHTML = [
    [site.projects.length, 'Projects'],
    [n3d, '3D models'],
    [new Set(site.projects.map((x) => x.category).filter(Boolean)).size, 'Domains'],
    [tools.size, 'Tools used'],
  ].map(([v, k]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

  $('#skillsGrid').innerHTML = (p.skills || []).map((g) => `
    <div class="skill-card">
      <h3 class="mono">${esc(g.group)}</h3>
      <ul>${(g.items || []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>`).join('');

  $('#timeline').innerHTML = (p.experience || []).map((x) => `
    <li>
      <span class="mono when">${esc(x.period)}</span>
      <h3>${esc(x.role)}</h3>
      <p class="org">${esc(x.org)}</p>
      ${x.details ? `<p class="muted">${esc(x.details)}</p>` : ''}
    </li>`).join('');

  $('#education').innerHTML = (p.education || []).map((x) => `
    <div class="edu"><h4>${esc(x.degree)}</h4><p class="muted">${esc(x.org)} · <span class="mono">${esc(x.period)}</span></p></div>`).join('');
  $('#courses').innerHTML = (p.courses || []).map((c) => `<li>${esc(c)}</li>`).join('');

  const links = [];
  if (p.email) links.push(`<a href="mailto:${esc(p.email)}"><span class="mono">email</span>${esc(p.email)}</a>`);
  if (p.phone) links.push(`<a href="tel:${esc(p.phone.replace(/\s/g, ''))}"><span class="mono">phone</span>${esc(p.phone)}</a>`);
  if (p.linkedin) links.push(`<a href="${esc(p.linkedin)}" target="_blank" rel="noopener"><span class="mono">linkedin</span>${esc(p.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>`);
  if (p.github) links.push(`<a href="${esc(p.github)}" target="_blank" rel="noopener"><span class="mono">github</span>${esc(p.github.replace(/^https?:\/\/(www\.)?/, ''))}</a>`);
  if (p.location) links.push(`<div><span class="mono">location</span>${esc(p.location)}</div>`);
  $('#contactLinks').innerHTML = links.join('');
}

/* ---------- grid ---------- */
function renderFilters() {
  const cats = ['All', ...new Set(site.projects.map((p) => p.category).filter(Boolean))];
  $('#filters').innerHTML = cats.map((c) => `<button type="button" class="chip${c === activeCat ? ' active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  $('#filters').onclick = (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    activeCat = b.dataset.cat;
    renderFilters();
    renderGrid();
  };
}

$('#search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); renderGrid(); });

function coverHTML(p) {
  if (p.cover) return `<img src="${esc(p.cover)}" alt="" loading="lazy">`;
  const initials = p.title.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return `<div class="cover-ph"><span class="ph-chip mono">${esc(initials || '■')}</span></div>`;
}

function renderGrid() {
  const list = site.projects
    .filter((p) => activeCat === 'All' || p.category === activeCat)
    .filter((p) => !query || [p.title, p.summary, p.category, ...p.tags, ...p.tools, ...p.specs.map((s) => `${s.key} ${s.value}`)].join(' ').toLowerCase().includes(query))
    .sort((a, b) => Number(b.featured) - Number(a.featured));

  $('#empty').hidden = list.length > 0;
  $('#grid').innerHTML = list.map((p) => `
    <button type="button" class="card${p.featured ? ' featured' : ''}" data-id="${esc(p.id)}" aria-label="Open ${esc(p.title)}">
      <div class="card-cover">
        ${coverHTML(p)}
        <div class="badges">
          ${p.models.some((m) => m.url) ? '<span class="badge b3d mono">3D</span>' : ''}
          ${p.featured ? '<span class="badge mono">★ Featured</span>' : ''}
        </div>
      </div>
      <div class="card-body">
        <p class="card-cat mono">${esc(p.category)}${p.year ? ` · ${esc(p.year)}` : ''}</p>
        <h3>${esc(p.title)}</h3>
        <p class="card-sum">${esc(p.summary)}</p>
        <div class="tags">${p.tags.slice(0, 4).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      </div>
    </button>`).join('');
  $('#grid').onclick = (e) => {
    const c = e.target.closest('.card');
    if (c) location.hash = `project/${c.dataset.id}`;
  };
}

/* ---------- modal ---------- */
function openFromHash() {
  const m = location.hash.match(/^#project\/(.+)$/);
  if (!m) { closeModal(false); return; }
  const p = site.projects.find((x) => x.id === decodeURIComponent(m[1]));
  if (p) openModal(p);
}

function openModal(p) {
  lastFocus = document.activeElement;
  const models = p.models.filter((m) => m.url);
  const vid = youtubeId(p.links.video);
  const images = [p.cover, ...p.gallery].filter(Boolean);
  const media = [];
  if (models.length) media.push(['3d', '3D View']);
  if (images.length) media.push(['img', `Photos (${images.length})`]);
  if (vid || (p.links.video && /\.(mp4|webm)$/i.test(p.links.video))) media.push(['vid', 'Video']);

  const specs = p.specs.filter((s) => s.key || s.value);
  const linkBtns = [
    p.links.github && `<a class="btn" href="${esc(p.links.github)}" target="_blank" rel="noopener">Source / Files ↗</a>`,
    p.links.docs && `<a class="btn" href="${esc(p.links.docs)}" target="_blank" rel="noopener">Docs ↗</a>`,
    p.links.video && !vid && !/\.(mp4|webm)$/i.test(p.links.video) && `<a class="btn" href="${esc(p.links.video)}" target="_blank" rel="noopener">Video ↗</a>`,
  ].filter(Boolean);

  $('#modalBody').innerHTML = `
    <header class="m-head">
      <p class="card-cat mono">${[p.category, p.status, p.year].filter(Boolean).map(esc).join(' · ')}</p>
      <h2 id="mTitle">${esc(p.title)}</h2>
      ${p.summary ? `<p class="m-sum">${esc(p.summary)}</p>` : ''}
    </header>
    <div class="m-grid${media.length ? '' : ' no-media'}">
      ${media.length ? `
      <section class="m-media">
        ${media.length > 1 ? `<div class="seg" role="tablist">${media.map(([k, l], i) => `<button type="button" role="tab" data-media="${k}" class="${i === 0 ? 'active' : ''}">${l}</button>`).join('')}</div>` : ''}
        <div class="stage" id="stage"></div>
      </section>` : ''}
      <section class="m-info">
        ${p.description ? `<div class="prose">${md(p.description)}</div>` : ''}
        ${p.features.length ? `<h3 class="sub">Key features</h3><ul class="feat">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
        ${specs.length ? `<h3 class="sub">Specifications</h3><table class="specs">${specs.map((s) => `<tr><th class="mono">${esc(s.key)}</th><td>${esc(s.value)}</td></tr>`).join('')}</table>` : ''}
        ${p.tools.length ? `<h3 class="sub">Tools</h3><div class="tags">${p.tools.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        ${p.tags.length ? `<h3 class="sub">Tags</h3><div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        ${linkBtns.length ? `<div class="m-links">${linkBtns.join('')}</div>` : ''}
      </section>
    </div>`;

  const showMedia = (kind) => {
    disposeViewer();
    const stage = $('#stage');
    if (!stage) return;
    stage.className = `stage stage-${kind}`;
    $('#modalBody').querySelectorAll('[data-media]').forEach((b) => b.classList.toggle('active', b.dataset.media === kind));
    if (kind === '3d') {
      stage.innerHTML = '<div class="v3d-loading mono">Initialising 3D…</div>';
      import('./viewer3d.js')
        .then(({ createViewer }) => { if (stage.isConnected) viewer = createViewer(stage, models); })
        .catch((err) => { stage.innerHTML = `<p class="v3d-loading mono">3D viewer failed to load: ${esc(err.message)}</p>`; });
    } else if (kind === 'img') {
      stage.innerHTML = `
        <figure class="gal-main"><img src="${esc(images[0])}" alt="${esc(p.title)}"></figure>
        ${images.length > 1 ? `<div class="gal-thumbs">${images.map((src, i) => `<button type="button" class="${i === 0 ? 'active' : ''}" data-src="${esc(src)}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}`;
      stage.onclick = (e) => {
        const t = e.target.closest('[data-src]');
        if (!t) return;
        stage.querySelector('.gal-main img').src = t.dataset.src;
        stage.querySelectorAll('[data-src]').forEach((b) => b.classList.toggle('active', b === t));
      };
    } else if (kind === 'vid') {
      stage.innerHTML = vid
        ? `<iframe src="https://www.youtube-nocookie.com/embed/${vid}" title="Project video" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`
        : `<video src="${esc(p.links.video)}" controls playsinline></video>`;
    }
  };
  $('#modalBody').querySelectorAll('[data-media]').forEach((b) => b.addEventListener('click', () => showMedia(b.dataset.media)));

  const modal = $('#modal');
  modal.hidden = false;
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => modal.classList.add('open'));
  modal.querySelector('.modal-card').scrollTop = 0;
  modal.querySelector('.modal-card').focus();
  if (media.length) showMedia(media[0][0]);
}

function disposeViewer() {
  if (viewer) { viewer.dispose(); viewer = null; }
}

function closeModal(updateHash = true) {
  const modal = $('#modal');
  if (modal.hidden) return;
  disposeViewer();
  modal.classList.remove('open');
  document.body.classList.remove('modal-open');
  setTimeout(() => { modal.hidden = true; $('#modalBody').innerHTML = ''; }, 200);
  if (updateHash && location.hash.startsWith('#project/')) history.pushState('', document.title, location.pathname + location.search);
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}

$('#modal').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden && !document.fullscreenElement) closeModal(); });
