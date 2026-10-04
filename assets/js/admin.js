import { esc, slugify, normalizeProject, DATA_URL, DRAFT_KEY } from './common.js';
import { AUTH_URL, sealVault, openVault, fetchVault, session } from './auth.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let auth = null;    // { user, cfg } after sign-in — kept in memory + tab session only

let data = { profile: {}, projects: [] };
let selected = null;   // project id
let dirty = false;
let viewer = null;

/* ================= GitHub API ================= */
const gh = {
  cfg() {
    return auth?.cfg || {};
  },
  ready() { const c = this.cfg(); return !!(c.owner && c.repo && c.branch && c.token); },
  async req(path, opts = {}) {
    const c = this.cfg();
    session.touch();
    const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}${path}`, {
      ...opts,
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${c.token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) },
    });
    if (!res.ok) {
      let msg = `${res.status}`;
      try { msg += ` ${(await res.json()).message}`; } catch { /* ignore */ }
      const e = new Error(`GitHub: ${msg}`); e.status = res.status; throw e;
    }
    return res.status === 204 ? null : res.json();
  },
  async getFile(path) {
    const c = this.cfg();
    try { return await this.req(`/contents/${encodePath(path)}?ref=${encodeURIComponent(c.branch)}`); }
    catch (e) { if (e.status === 404) return null; throw e; }
  },
  async putFile(path, base64, message) {
    const c = this.cfg();
    const existing = await this.getFile(path);
    return this.req(`/contents/${encodePath(path)}`, {
      method: 'PUT',
      body: JSON.stringify({ message, content: base64, branch: c.branch, ...(existing ? { sha: existing.sha } : {}) }),
    });
  },
};
const encodePath = (p) => p.split('/').map(encodeURIComponent).join('/');

function bytesToB64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
const textToB64 = (t) => bytesToB64(new TextEncoder().encode(t));
const b64ToText = (b) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

/* ================= UI helpers ================= */
function toast(msg, kind = '') {
  const t = $('#toast');
  t.textContent = msg; t.className = `toast ${kind}`; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, kind === 'err' ? 7000 : 3500);
}
function setDirty(v = true) {
  dirty = v;
  $('#dirtyPill').hidden = !v;
  if (v) {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), data })); } catch { /* ignore */ }
  }
}
function updateGhPill() {
  const c = gh.cfg();
  const pill = $('#ghPill');
  pill.textContent = gh.ready() ? `GitHub · ${c.owner}/${c.repo}` : 'Local only';
  pill.classList.toggle('ok', gh.ready());
}
window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

/* ================= Load ================= */
async function loadInitial() {
  let loaded = null;
  if (gh.ready()) {
    try {
      const f = await gh.getFile(DATA_URL);
      if (f && f.content) loaded = JSON.parse(b64ToText(f.content));
    } catch (e) { toast(`Could not read from GitHub (${e.message}). Falling back to the live file.`, 'err'); }
  }
  if (!loaded) {
    try {
      const r = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) loaded = await r.json();
    } catch { /* ignore */ }
  }
  setData(loaded || { profile: {}, projects: [] });

  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (d && d.data && JSON.stringify(d.data) !== JSON.stringify(data)) {
      $('#draftTime').textContent = new Date(d.savedAt).toLocaleString();
      $('#draftBanner').hidden = false;
      $('#restoreDraft').onclick = () => { setData(d.data); setDirty(true); $('#draftBanner').hidden = true; toast('Draft restored'); };
      $('#discardDraft').onclick = () => { localStorage.removeItem(DRAFT_KEY); $('#draftBanner').hidden = true; };
    }
  } catch { /* ignore */ }
}

function setData(d) {
  data = { profile: d.profile || {}, projects: (d.projects || []).map(normalizeProject) };
  if (!data.projects.find((p) => p.id === selected)) selected = data.projects[0]?.id || null;
  renderList(); renderEditor(); renderProfile();
}

/* ================= Tabs ================= */
$$('.a-tabs [data-tab]').forEach((b) => b.addEventListener('click', () => {
  $$('.a-tabs [data-tab]').forEach((x) => x.classList.toggle('active', x === b));
  $$('.tab-panel').forEach((p) => { p.hidden = p.dataset.panel !== b.dataset.tab; });
}));

/* ================= Project list ================= */
function renderList() {
  const q = ($('#pSearch').value || '').toLowerCase();
  $('#pList').innerHTML = data.projects.map((p, i) => ({ p, i }))
    .filter(({ p }) => !q || `${p.title} ${p.category}`.toLowerCase().includes(q))
    .map(({ p, i }) => `
      <li class="${p.id === selected ? 'active' : ''}" data-id="${esc(p.id)}">
        <button type="button" class="pl-main" data-act="select">
          <span class="pl-title">${esc(p.title)}</span>
          <span class="pl-meta mono">${esc(p.category || '—')}${p.models.some((m) => m.url) ? ' · 3D' : ''}${p.featured ? ' · ★' : ''}</span>
        </button>
        <span class="pl-move">
          <button type="button" data-act="up" title="Move up" ${i === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" data-act="down" title="Move down" ${i === data.projects.length - 1 ? 'disabled' : ''}>▼</button>
        </span>
      </li>`).join('') || '<li class="muted small" style="padding:12px">No projects yet.</li>';
}
$('#pSearch').addEventListener('input', renderList);
$('#pList').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const id = b.closest('li').dataset.id;
  const i = data.projects.findIndex((p) => p.id === id);
  if (b.dataset.act === 'select') { selected = id; renderList(); renderEditor(); }
  if (b.dataset.act === 'up' && i > 0) { [data.projects[i - 1], data.projects[i]] = [data.projects[i], data.projects[i - 1]]; setDirty(); renderList(); }
  if (b.dataset.act === 'down' && i < data.projects.length - 1) { [data.projects[i + 1], data.projects[i]] = [data.projects[i], data.projects[i + 1]]; setDirty(); renderList(); }
});
$('#addProject').addEventListener('click', () => {
  const p = normalizeProject({ title: 'New project', id: uniqueId('new-project') });
  data.projects.unshift(p);
  selected = p.id; setDirty(); renderList(); renderEditor();
  $('#pEditor [name="title"]').select();
});
function uniqueId(base, exceptIdx = -1) {
  let id = slugify(base), n = 2;
  while (data.projects.some((p, i) => p.id === id && i !== exceptIdx)) id = `${slugify(base)}-${n++}`;
  return id;
}

/* ================= Project editor ================= */
const cur = () => data.projects.find((p) => p.id === selected);

function thumb(url) {
  if (!url) return '<span class="thumb empty"></span>';
  return `<img class="thumb" src="${esc(url)}" alt="" onerror="this.classList.add('broken')">`;
}

function renderEditor() {
  const p = cur();
  const ed = $('#pEditor');
  disposeViewer();
  if (!p) { ed.innerHTML = '<div class="empty-ed"><p>Select a project or create a new one.</p></div>'; return; }
  ed.innerHTML = `
  <form id="pForm" autocomplete="off" onsubmit="return false">
    <div class="ed-head">
      <h2>${esc(p.title)}</h2>
      <div class="row">
        <a class="btn sm ghost" href="index.html?preview#project/${esc(p.id)}" target="_blank" rel="noopener">Preview card ↗</a>
        <button type="button" class="btn sm danger" data-act="delete">Delete</button>
      </div>
    </div>

    <fieldset><legend>Basics</legend>
      <div class="form-grid">
        <label class="span2">Title<input name="title" value="${esc(p.title)}" required></label>
        <label>ID (URL slug)<input name="id" value="${esc(p.id)}" pattern="[a-z0-9\\-]+"></label>
        <label>Category<input name="category" value="${esc(p.category)}" list="catList" placeholder="PCB Design, IoT Device…"></label>
        <label>Year<input name="year" value="${esc(p.year)}" placeholder="2025"></label>
        <label>Status<input name="status" value="${esc(p.status)}" placeholder="Completed / Prototype / In progress"></label>
        <label class="check"><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}> Featured (shown first)</label>
        <label class="span2">Short summary (shown on the card)<textarea name="summary" rows="2">${esc(p.summary)}</textarea></label>
        <label class="span2">Full description <span class="hint">Blank line = new paragraph · **bold** · \`code\` · - list · [text](url)</span><textarea name="description" rows="8">${esc(p.description)}</textarea></label>
        <label class="span2">Key features <span class="hint">one per line</span><textarea name="features" rows="5">${esc(p.features.join('\n'))}</textarea></label>
        <label>Tags <span class="hint">comma separated</span><input name="tags" value="${esc(p.tags.join(', '))}"></label>
        <label>Tools <span class="hint">comma separated</span><input name="tools" value="${esc(p.tools.join(', '))}" placeholder="KiCad, STM32CubeIDE…"></label>
      </div>
      <datalist id="catList">${[...new Set(data.projects.map((x) => x.category).filter(Boolean))].map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
    </fieldset>

    <fieldset><legend>Specifications</legend>
      <div class="rows" id="specRows">
        ${p.specs.map((s) => `<div class="r spec"><input data-k="key" value="${esc(s.key)}" placeholder="MCU"><input data-k="value" value="${esc(s.value)}" placeholder="STM32F103"><button type="button" class="x" data-act="rm-row" title="Remove">✕</button></div>`).join('')}
      </div>
      <button type="button" class="btn sm ghost" data-act="add-spec">+ Add spec</button>
    </fieldset>

    <fieldset><legend>3D models <span class="hint">GLB · GLTF · WRL (KiCad VRML) · STL · OBJ</span></legend>
      <div class="rows" id="modelRows">
        ${p.models.map((m) => `
          <div class="r model">
            <input data-k="label" value="${esc(m.label)}" placeholder="Label (e.g. PCB top)">
            <input data-k="url" value="${esc(m.url)}" placeholder="models/board.glb or https://…">
            <span class="rot" title="Rotation in degrees (X, Y, Z)">
              <input data-k="rx" type="number" step="90" value="${Number(m.rotation[0]) || 0}" aria-label="Rotation X">
              <input data-k="ry" type="number" step="90" value="${Number(m.rotation[1]) || 0}" aria-label="Rotation Y">
              <input data-k="rz" type="number" step="90" value="${Number(m.rotation[2]) || 0}" aria-label="Rotation Z">
            </span>
            <label class="btn sm ghost file">Upload<input type="file" accept=".glb,.gltf,.wrl,.vrml,.stl,.obj" data-up="models" hidden></label>
            <button type="button" class="btn sm ghost" data-act="view-model">View</button>
            <button type="button" class="x" data-act="rm-row" title="Remove">✕</button>
          </div>`).join('')}
      </div>
      <button type="button" class="btn sm ghost" data-act="add-model">+ Add 3D model</button>
    </fieldset>

    <fieldset><legend>Images</legend>
      <div class="form-grid">
        <div class="field span2">Cover image (card thumbnail)
          <span class="r img">${thumb(p.cover)}<input name="cover" value="${esc(p.cover)}" placeholder="images/cover.jpg or https://…">
          <label class="btn sm ghost file">Upload<input type="file" accept="image/*" data-up="cover" hidden></label></span>
        </div>
      </div>
      <p class="lbl">Gallery</p>
      <div class="rows" id="galRows">
        ${p.gallery.map((g) => `<div class="r img gal">${thumb(g)}<input data-k="url" value="${esc(g)}"><button type="button" class="x" data-act="rm-row" title="Remove">✕</button></div>`).join('')}
      </div>
      <div class="row">
        <button type="button" class="btn sm ghost" data-act="add-gal">+ Add image URL</button>
        <label class="btn sm ghost file">Upload images<input type="file" accept="image/*" multiple data-up="gallery" hidden></label>
      </div>
    </fieldset>

    <fieldset><legend>Links</legend>
      <div class="form-grid">
        <label>Source / files (GitHub, etc.)<input name="links.github" value="${esc(p.links.github)}" placeholder="https://github.com/…"></label>
        <label>Video (YouTube or .mp4)<input name="links.video" value="${esc(p.links.video)}" placeholder="https://youtu.be/…"></label>
        <label class="span2">Docs / write-up<input name="links.docs" value="${esc(p.links.docs)}" placeholder="https://…"></label>
      </div>
    </fieldset>
  </form>`;
}

function collectProject(form) {
  const v = (n) => form.elements[n]?.value ?? '';
  const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
  const csv = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
  return {
    title: v('title').trim() || 'Untitled project',
    id: slugify(v('id')),
    category: v('category').trim(),
    year: v('year').trim(),
    status: v('status').trim(),
    featured: form.elements.featured.checked,
    summary: v('summary').trim(),
    description: v('description'),
    features: lines(v('features')),
    tags: csv(v('tags')),
    tools: csv(v('tools')),
    cover: v('cover').trim(),
    specs: $$('#specRows .spec', form).map((r) => ({ key: $('[data-k=key]', r).value.trim(), value: $('[data-k=value]', r).value.trim() })),
    models: $$('#modelRows .model', form).map((r) => ({
      label: $('[data-k=label]', r).value.trim(),
      url: $('[data-k=url]', r).value.trim(),
      rotation: ['rx', 'ry', 'rz'].map((k) => Number($(`[data-k=${k}]`, r).value) || 0),
    })),
    gallery: $$('#galRows .gal [data-k=url]', form).map((i) => i.value.trim()).filter(Boolean),
    links: { github: v('links.github').trim(), video: v('links.video').trim(), docs: v('links.docs').trim() },
  };
}

function syncProject() {
  const form = $('#pForm'); const p = cur();
  if (!form || !p) return;
  const idx = data.projects.indexOf(p);
  const next = collectProject(form);
  if (next.id !== p.id) next.id = uniqueId(next.id || next.title, idx);
  data.projects[idx] = next;
  selected = next.id;
  $('.ed-head h2', form).textContent = next.title;
  setDirty();
  renderList();
}

$('#pEditor').addEventListener('input', (e) => {
  if (e.target.type === 'file') return;
  syncProject();
  if (e.target.matches('.r.img input')) {
    const img = e.target.parentElement.querySelector('.thumb');
    if (img && img.tagName === 'IMG') { img.classList.remove('broken'); img.src = e.target.value; }
  }
});
$('#pEditor').addEventListener('change', async (e) => {
  const inp = e.target;
  if (inp.type !== 'file' || !inp.files.length) return;
  const kind = inp.dataset.up;
  const files = [...inp.files];
  inp.value = '';
  const p = cur(); if (!p) return;
  const folder = kind === 'models' ? 'models' : 'images';
  try {
    const urls = [];
    for (const f of files) urls.push(await uploadFile(f, folder, p.id));
    if (kind === 'models') inp.closest('.model').querySelector('[data-k=url]').value = urls[0];
    if (kind === 'cover') $('#pForm').elements.cover.value = urls[0];
    syncProject();
    if (kind === 'gallery') { cur().gallery.push(...urls); setDirty(); }
    renderEditor();
  } catch (err) { toast(err.message, 'err'); }
});
$('#pEditor').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act;
  const p = cur(); if (!p) return;
  if (act === 'delete') {
    if (!confirm(`Delete "${p.title}"? This removes it from the site after you publish.`)) return;
    data.projects = data.projects.filter((x) => x !== p);
    selected = data.projects[0]?.id || null;
    setDirty(); renderList(); renderEditor();
    toast('Project deleted — click “Save & Publish” to apply.');
    return;
  }
  if (act === 'rm-row') { b.closest('.r').remove(); syncProject(); renderEditor(); return; }
  if (act === 'add-spec') { syncProject(); cur().specs.push({ key: '', value: '' }); renderEditor(); $$('#specRows .spec').at(-1)?.querySelector('input').focus(); return; }
  if (act === 'add-model') { syncProject(); cur().models.push({ label: '', url: '', rotation: [0, 0, 0] }); renderEditor(); $$('#modelRows .model').at(-1)?.querySelector('input').focus(); return; }
  if (act === 'add-gal') { syncProject(); cur().gallery.push('https://'); renderEditor(); $$('#galRows .gal input').at(-1)?.focus(); return; }
  if (act === 'view-model') {
    const r = b.closest('.model');
    const url = $('[data-k=url]', r).value.trim();
    if (!url) { toast('Add a model URL or upload a file first.', 'err'); return; }
    openViewer({ label: $('[data-k=label]', r).value, url, rotation: ['rx', 'ry', 'rz'].map((k) => Number($(`[data-k=${k}]`, r).value) || 0) });
  }
});

/* ================= Uploads ================= */
async function uploadFile(file, folder, prefix) {
  if (!gh.ready()) throw new Error('Not connected to GitHub — sign in again.');
  if (file.size > 50 * 1024 * 1024) throw new Error(`${file.name} is larger than 50 MB. Compress it first (see Settings → 3D model tips).`);
  if (file.size > 25 * 1024 * 1024 && !confirm(`${file.name} is ${(file.size / 1048576).toFixed(1)} MB. Large files load slowly for visitors. Upload anyway?`)) throw new Error('Upload cancelled');
  const dot = file.name.lastIndexOf('.');
  const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : 'bin';
  const base = slugify(dot > 0 ? file.name.slice(0, dot) : file.name);
  const path = `${folder}/${slugify(prefix)}-${base}-${Date.now().toString(36)}.${ext}`;
  toast(`Uploading ${file.name}…`);
  const b64 = bytesToB64(new Uint8Array(await file.arrayBuffer()));
  await gh.putFile(path, b64, `Upload ${path} via dashboard`);
  toast(`Uploaded ${file.name}`, 'ok');
  return path;
}

/* ================= 3D preview ================= */
function disposeViewer() { if (viewer) { viewer.dispose(); viewer = null; } }
async function openViewer(model) {
  const dlg = $('#viewerDlg');
  $('#vdTitle').textContent = model.label || model.url;
  dlg.showModal();
  disposeViewer();
  const stage = $('#vdStage');
  stage.innerHTML = '<div class="v3d-loading mono">Initialising 3D…</div>';
  try {
    const { createViewer } = await import('./viewer3d.js');
    viewer = createViewer(stage, [model]);
  } catch (e) { stage.innerHTML = `<p class="v3d-loading mono">${esc(e.message)}</p>`; }
}
$('#vdClose').addEventListener('click', () => $('#viewerDlg').close());
$('#viewerDlg').addEventListener('close', disposeViewer);

/* ================= Profile ================= */
function renderProfile() {
  const p = data.profile;
  const f = (name, label, ph = '', cls = '') => `<label class="${cls}">${label}<input name="${name}" value="${esc(p[name] || '')}" placeholder="${esc(ph)}"></label>`;
  $('#profileEditor').innerHTML = `
  <form id="profForm" autocomplete="off" onsubmit="return false">
    <h2>Profile</h2>
    <fieldset><legend>Identity</legend>
      <div class="form-grid">
        ${f('name', 'Full name')}${f('title', 'Job title')}
        ${f('tagline', 'Tagline', 'Hardware design · Embedded Linux · PCB', 'span2')}
        <label class="span2">Summary<textarea name="summary" rows="4">${esc(p.summary || '')}</textarea></label>
      </div>
    </fieldset>
    <fieldset><legend>Contact & links</legend>
      <div class="form-grid">
        ${f('email', 'Email')}${f('phone', 'Phone')}${f('location', 'Location')}${f('linkedin', 'LinkedIn URL')}${f('github', 'GitHub URL')}
        <div class="field">CV (PDF path or URL)<span class="r img"><input name="cv" value="${esc(p.cv || '')}" placeholder="assets/cv.pdf"><label class="btn sm ghost file">Upload<input type="file" accept="application/pdf" data-up="cv" hidden></label></span></div>
      </div>
    </fieldset>
    <fieldset><legend>Skills <span class="hint">one group per line — Group: item, item, item</span></legend>
      <textarea name="skills" rows="7">${esc((p.skills || []).map((g) => `${g.group}: ${(g.items || []).join(', ')}`).join('\n'))}</textarea>
    </fieldset>
    <fieldset><legend>Experience</legend>
      <div class="rows" id="expRows">
        ${(p.experience || []).map((x) => `<div class="r exp"><input data-k="role" value="${esc(x.role)}" placeholder="Role"><input data-k="org" value="${esc(x.org)}" placeholder="Organisation"><input data-k="period" value="${esc(x.period)}" placeholder="Mar 2025 – Present"><button type="button" class="x" data-act="rm-row">✕</button><textarea data-k="details" rows="2" placeholder="Details">${esc(x.details || '')}</textarea></div>`).join('')}
      </div>
      <button type="button" class="btn sm ghost" data-act="add-exp">+ Add experience</button>
    </fieldset>
    <fieldset><legend>Education</legend>
      <div class="rows" id="eduRows">
        ${(p.education || []).map((x) => `<div class="r edu3"><input data-k="degree" value="${esc(x.degree)}" placeholder="Degree"><input data-k="org" value="${esc(x.org)}" placeholder="Institution"><input data-k="period" value="${esc(x.period)}" placeholder="2019 – 2025"><button type="button" class="x" data-act="rm-row">✕</button></div>`).join('')}
      </div>
      <button type="button" class="btn sm ghost" data-act="add-edu">+ Add education</button>
    </fieldset>
    <fieldset><legend>Courses <span class="hint">one per line</span></legend>
      <textarea name="courses" rows="5">${esc((p.courses || []).join('\n'))}</textarea>
    </fieldset>
  </form>`;
}
function syncProfile() {
  const form = $('#profForm'); if (!form) return;
  const v = (n) => form.elements[n]?.value ?? '';
  data.profile = {
    ...data.profile,
    ...Object.fromEntries(['name', 'title', 'tagline', 'summary', 'location', 'email', 'phone', 'linkedin', 'github', 'cv'].map((k) => [k, v(k).trim()])),
    skills: v('skills').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const i = l.indexOf(':');
      return i < 0 ? { group: l, items: [] } : { group: l.slice(0, i).trim(), items: l.slice(i + 1).split(',').map((s) => s.trim()).filter(Boolean) };
    }),
    experience: $$('#expRows .exp', form).map((r) => ({ role: $('[data-k=role]', r).value.trim(), org: $('[data-k=org]', r).value.trim(), period: $('[data-k=period]', r).value.trim(), details: $('[data-k=details]', r).value.trim() })),
    education: $$('#eduRows .edu3', form).map((r) => ({ degree: $('[data-k=degree]', r).value.trim(), org: $('[data-k=org]', r).value.trim(), period: $('[data-k=period]', r).value.trim() })),
    courses: v('courses').split('\n').map((l) => l.trim()).filter(Boolean),
  };
  setDirty();
}
$('#profileEditor').addEventListener('input', (e) => { if (e.target.type !== 'file') syncProfile(); });
$('#profileEditor').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'rm-row') b.closest('.r').remove();
  syncProfile();
  if (b.dataset.act === 'add-exp') data.profile.experience.push({ role: '', org: '', period: '', details: '' });
  if (b.dataset.act === 'add-edu') data.profile.education.push({ degree: '', org: '', period: '' });
  renderProfile();
});
$('#profileEditor').addEventListener('change', async (e) => {
  const inp = e.target;
  if (inp.type !== 'file' || !inp.files.length) return;
  const file = inp.files[0]; inp.value = '';
  try {
    $('#profForm').elements.cv.value = await uploadFile(file, 'assets', 'cv');
    syncProfile();
  } catch (err) { toast(err.message, 'err'); }
});

/* ================= Auth (login / setup / settings) ================= */
function guessRepo() {
  const m = location.hostname.match(/^([\w-]+)\.github\.io$/);
  if (!m) return { owner: '', repo: '' };
  const seg = location.pathname.split('/').filter(Boolean)[0];
  return { owner: m[1], repo: seg && !seg.endsWith('.html') ? seg : `${m[1]}.github.io` };
}
async function testRepo(cfg) {
  const prev = auth; auth = { cfg };
  try {
    const repo = await gh.req('');
    if (!repo.permissions?.push) throw new Error('This token has no write access to the repo.');
    return repo;
  } finally { auth = prev; }
}
async function saveVault(cfg, user, pass) {
  const vault = await sealVault(cfg, user, pass);
  const prev = auth; auth = { user, cfg };
  try { await gh.putFile(AUTH_URL, textToB64(`${JSON.stringify(vault, null, 2)}\n`), 'Update dashboard login (encrypted)'); }
  catch (e) { auth = prev; throw e; }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let vault = null;
let failures = 0;

function enterApp(user, cfg) {
  auth = { user, cfg };
  session.set(user, cfg);
  try { localStorage.removeItem('portfolio_github_v1'); } catch { /* old plaintext token storage */ }
  $('#gate').hidden = true;
  $('#app').hidden = false;
  $('#whoami').textContent = user;
  $('#repoInfo').textContent = `${cfg.owner}/${cfg.repo} @ ${cfg.branch}`;
  updateGhPill();
  loadInitial();
}

async function boot() {
  const s = session.get();
  vault = await fetchVault();
  $('#gateLoading').hidden = true;
  if (s && s.cfg) { enterApp(s.user, s.cfg); return; }
  if (vault) { $('#loginForm').hidden = false; $('#loginForm').username.focus(); return; }
  const f = $('#setupForm'); const g = guessRepo();
  f.owner.value = g.owner; f.repo.value = g.repo;
  f.hidden = false;
}

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target; const btn = f.querySelector('button'); const err = $('#loginErr');
  btn.disabled = true; err.textContent = '';
  try {
    if (failures >= 3) await sleep(Math.min(30000, 2000 * 2 ** (failures - 3)));
    const cfg = await openVault(vault, f.username.value, f.password.value);
    failures = 0;
    enterApp(f.username.value.trim(), cfg);
    f.reset();
  } catch (ex) {
    failures += 1;
    err.textContent = ex.message;
    f.password.value = ''; f.password.focus();
  } finally { btn.disabled = false; }
});

$('#setupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target; const btn = f.querySelector('button[type=submit]'); const err = $('#setupErr');
  err.textContent = '';
  if (f.password.value !== f.confirm.value) { err.textContent = 'Passwords do not match.'; return; }
  const user = f.username.value.trim();
  const cfg = { owner: f.owner.value.trim(), repo: f.repo.value.trim(), branch: f.branch.value.trim() || 'main', token: f.token.value.trim() };
  btn.disabled = true; btn.textContent = 'Checking token…';
  try {
    await testRepo(cfg);
    auth = { cfg };
    if (await gh.getFile(AUTH_URL) && !confirm('A login already exists in the repo. Replace it?')) throw new Error('Cancelled.');
    btn.textContent = 'Encrypting & saving…';
    await saveVault(cfg, user, f.password.value);
    f.reset();
    enterApp(user, cfg);
    toast('Login created ✓ Use it to sign in from any device.', 'ok');
  } catch (ex) {
    auth = null;
    err.textContent = ex.message;
  } finally { btn.disabled = false; btn.textContent = 'Create login'; }
});

$('#logoutBtn').addEventListener('click', () => {
  if (dirty && !confirm('You have unpublished changes (kept as a draft in this browser). Sign out anyway?')) return;
  session.clear(); auth = null;
  dirty = false; // draft stays in localStorage
  location.reload();
});

async function verifyCurrent(pass) {
  const v = (await gh.getFile(AUTH_URL)) || null;
  const current = v ? JSON.parse(b64ToText(v.content)) : vault;
  await openVault(current, auth.user, pass); // throws if wrong
}

$('#pwForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target; const out = $('#pwResult'); out.className = 'mono small';
  if (f.password.value !== f.confirm.value) { out.textContent = '✗ Passwords do not match'; out.classList.add('err'); return; }
  out.textContent = 'Saving…';
  try {
    await verifyCurrent(f.current.value);
    const user = f.username.value.trim();
    await saveVault(auth.cfg, user, f.password.value);
    session.set(user, auth.cfg);
    $('#whoami').textContent = user;
    f.reset();
    out.textContent = '✓ Login updated'; out.classList.add('ok');
  } catch (ex) { out.textContent = `✗ ${ex.message.replace('Invalid username or password', 'Current password is wrong')}`; out.classList.add('err'); }
});

$('#tokenForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target; const out = $('#tokenResult'); out.className = 'mono small';
  out.textContent = 'Checking…';
  try {
    await verifyCurrent(f.current.value);
    const cfg = { ...auth.cfg, token: f.token.value.trim() };
    await testRepo(cfg);
    await saveVault(cfg, auth.user, f.current.value);
    session.set(auth.user, cfg);
    f.reset();
    out.textContent = '✓ Token replaced'; out.classList.add('ok');
  } catch (ex) { out.textContent = `✗ ${ex.message.replace('Invalid username or password', 'Current password is wrong')}`; out.classList.add('err'); }
});

/* ================= Publish / import / export ================= */
function serialize() {
  return `${JSON.stringify({ profile: data.profile, projects: data.projects }, null, 2)}\n`;
}
$('#publishBtn').addEventListener('click', async () => {
  if (!gh.ready()) {
    toast('Session expired — sign in again.', 'err');
    return;
  }
  const ids = data.projects.map((p) => p.id);
  if (new Set(ids).size !== ids.length) { toast('Two projects share the same ID. Make them unique first.', 'err'); return; }
  const btn = $('#publishBtn');
  btn.disabled = true; btn.textContent = 'Publishing…';
  try {
    await gh.putFile(DATA_URL, textToB64(serialize()), `Update portfolio content (${new Date().toISOString().slice(0, 16).replace('T', ' ')})`);
    localStorage.removeItem(DRAFT_KEY);
    setDirty(false);
    toast('Published ✓ GitHub Pages will update in about a minute.', 'ok');
  } catch (err) {
    toast(err.message, 'err');
  } finally {
    btn.disabled = false; btn.textContent = 'Save & Publish';
  }
});
$('#exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([serialize()], { type: 'application/json' }));
  a.download = 'site.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0]; e.target.value = '';
  if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!Array.isArray(d.projects)) throw new Error('File has no "projects" array');
    setData(d); setDirty(); toast('Imported — review and publish.');
  } catch (err) { toast(`Import failed: ${err.message}`, 'err'); }
});

/* ================= Boot ================= */
document.addEventListener('input', () => { if (auth) session.touch(); });
setInterval(() => {
  if (auth && !session.get()) { dirty = false; alert('Signed out after 1 hour of inactivity. Your changes are kept as a draft.'); location.reload(); }
}, 60000);
boot();
