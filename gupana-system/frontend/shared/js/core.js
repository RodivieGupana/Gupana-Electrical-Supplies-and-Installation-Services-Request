/* ============================================================================
   Gupana — core.js
   Shared config, API helper, and small utilities used on every page.
   Include this file first, before demo-data.js and the page-specific script.
   ============================================================================ */

const API_BASE_URL = "https://gupana-electrical-supplies-and-installation-services-request.onrender.com/api"; // change this to your deployed backend URL
let DEMO_MODE = false;

/** Reads the token/user for the given role ('admin' or 'client') from localStorage. */
function getToken(role) { return localStorage.getItem(`gupana_${role}_token`); }
function getUser(role) { return JSON.parse(localStorage.getItem(`gupana_${role}_user`) || 'null'); }
function setSession(role, token, user) {
  localStorage.setItem(`gupana_${role}_token`, token);
  localStorage.setItem(`gupana_${role}_user`, JSON.stringify(user));
}
function clearSession(role) {
  localStorage.removeItem(`gupana_${role}_token`);
  localStorage.removeItem(`gupana_${role}_user`);
}

/**
 * Redirects to the login page if there's no session for this role.
 * Call at the top of every protected page. Returns the current user, or null (after redirecting).
 */
function requireAuth(role, loginPath) {
  const user = getUser(role);
  const token = getToken(role);
  if (!user || !token) {
    window.location.href = loginPath;
    return null;
  }
  return user;
}

/** Generic fetch wrapper. Throws with a readable message on failure. */
async function api(path, opts = {}, role = 'admin') {
  if (DEMO_MODE) throw new Error('DEMO_MODE');
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken(role);
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...opts, headers });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) throw new Error((data && data.error) || 'Request failed');
  return data;
}

/** Pings the backend; sets DEMO_MODE and shows the yellow banner if it's unreachable. */
async function tryConnectBackend() {
  try {
    const r = await fetch(`${API_BASE_URL}/health`);
    if (!r.ok) throw new Error('unreachable');
    DEMO_MODE = false;
  } catch (e) {
    DEMO_MODE = true;
    const banner = document.getElementById('demoBanner');
    if (banner) banner.style.display = 'block';
  }
}

/** Loads a list from the API, falling back to demo data when DEMO_MODE is on. */
async function loadList(demoArr, path, role = 'admin') {
  if (DEMO_MODE) return demoArr;
  try { return await api(path, {}, role); } catch (e) { toast(e.message, true); return []; }
}

/* ---------- Toast ---------- */
function toast(msg, isError = false) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' error' : '');
  el.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="${isError ? 'M12 8v4M12 16h.01M12 2a10 10 0 100 20 10 10 0 000-20z' : 'M20 6L9 17l-5-5'}"/></svg><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ---------- Modal ---------- */
function openModal(html) {
  document.getElementById('modalBox').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
  if (window.lucide) lucide.createIcons();
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target.id === 'modalOverlay') closeModal(); });
});

/* ---------- Formatters ---------- */
function fmtDate(d) { if (!d) return '—'; const dt = new Date(d); return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtTime(t) { if (!t) return ''; const [h, m] = t.split(':'); const hh = ((+h + 11) % 12) + 1; return `${hh}:${m} ${+h < 12 ? 'AM' : 'PM'}`; }
function badge(status) { return `<span class="badge badge-${status}">${status}</span>`; }
function statusColor(status) {
  return { pending: '#f5b301', approved: '#3b82f6', confirmed: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444', unanswered: '#ef4444', answered: '#22c55e' }[status] || '#94a3b8';
}
function filterTable(tableId, term) {
  term = term.toLowerCase();
  document.querySelectorAll(`#${tableId} tbody tr`).forEach(tr => {
    tr.style.display = (tr.dataset.search || '').includes(term) ? '' : 'none';
  });
}
