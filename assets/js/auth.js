// Dashboard login.
//
// GitHub Pages has no server, so a password check in JavaScript alone could be bypassed.
// Instead, the GitHub token (the only thing that can change the site) is stored ENCRYPTED in
// data/auth.json. The key is derived from username + password with PBKDF2 (600k iterations)
// and the token is sealed with AES-256-GCM. Without the right username and password the token
// can't be decrypted, so nobody else can publish, even with full access to the page source.

export const AUTH_URL = 'data/auth.json';
const ITER = 600000;
const enc = new TextEncoder();
const dec = new TextDecoder();

const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(username, password, salt, iterations) {
  const material = await crypto.subtle.importKey(
    'raw', enc.encode(`${username.trim().toLowerCase()}\u0000${password}`), 'PBKDF2', false, ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
}

/** Encrypt the GitHub config ({owner, repo, branch, token}) into a vault object. */
export async function sealVault(cfg, username, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(username, password, salt, ITER);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(cfg)));
  return { v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, cipher: 'AES-256-GCM', salt: toB64(salt), iv: toB64(iv), data: toB64(ct) };
}

/** Returns the GitHub config, or throws if username/password are wrong. */
export async function openVault(vault, username, password) {
  const key = await deriveKey(username, password, fromB64(vault.salt), vault.iter || ITER);
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(vault.iv) }, key, fromB64(vault.data));
    return JSON.parse(dec.decode(pt));
  } catch {
    throw new Error('Invalid username or password');
  }
}

export async function fetchVault() {
  try {
    const r = await fetch(`${AUTH_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const v = await r.json();
    return v && v.data && v.salt ? v : null;
  } catch { return null; }
}

/* ---- tab session (cleared when the tab closes, expires after inactivity) ---- */
const SESSION_KEY = 'portfolio_session_v1';
const IDLE_MS = 60 * 60 * 1000; // 1 hour

export const session = {
  get() {
    try {
      const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!s || Date.now() - s.at > IDLE_MS) { this.clear(); return null; }
      return s;
    } catch { return null; }
  },
  set(user, cfg) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, cfg, at: Date.now() })); } catch { /* ignore */ }
  },
  touch() {
    const s = this.get();
    if (s) { s.at = Date.now(); try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* ignore */ } }
  },
  clear() { try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } },
};
