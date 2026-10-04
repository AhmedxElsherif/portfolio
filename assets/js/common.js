// Shared helpers for the public site and the admin dashboard.
export const DATA_URL = 'data/site.json';
export const DRAFT_KEY = 'portfolio_draft_v1';

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';
}

// Tiny, safe markdown: paragraphs, "- " lists, **bold**, *italic*, `code`, [text](url)
export function md(src) {
  const inline = (t) => esc(t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|[\w./-]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return String(src || '').trim().split(/\n{2,}/).map((block) => {
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
      return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('')}</ul>`;
    }
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}

export function youtubeId(url) {
  const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export function normalizeProject(p = {}) {
  return {
    id: p.id || slugify(p.title),
    title: p.title || 'Untitled project',
    category: p.category || '',
    year: p.year || '',
    status: p.status || '',
    featured: !!p.featured,
    summary: p.summary || '',
    description: p.description || '',
    features: Array.isArray(p.features) ? p.features : [],
    specs: Array.isArray(p.specs) ? p.specs : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
    tools: Array.isArray(p.tools) ? p.tools : [],
    cover: p.cover || '',
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    models: Array.isArray(p.models) ? p.models.map((m) => ({ label: m.label || '', url: m.url || '', rotation: Array.isArray(m.rotation) ? m.rotation : [0, 0, 0] })) : [],
    links: { github: '', video: '', docs: '', ...(p.links || {}) },
  };
}

export async function loadSite({ preferDraft = false } = {}) {
  if (preferDraft) {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (d && d.data) return d.data;
    } catch { /* ignore */ }
  }
  const res = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${DATA_URL} (${res.status})`);
  return res.json();
}
