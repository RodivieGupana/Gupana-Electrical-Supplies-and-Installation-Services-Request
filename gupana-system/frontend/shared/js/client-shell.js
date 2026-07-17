/* ============================================================================
   Gupana — client-shell.js
   Renders the shared header/sidebar/bottom-nav chrome on every client page.
   Requires: core.js, demo-data.js loaded first. Each page must set
   <body data-page="dashboard"> etc. and include mount points.
   ============================================================================ */

const CLIENT_NAV = [
  { view: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
  { view: 'services', label: 'Services', href: 'services.html', icon: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>' },
  { view: 'requests', label: 'Service Requests', href: 'requests.html', icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
  { view: 'appointments', label: 'Appointments', href: 'appointments.html', icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  { view: 'inquiries', label: 'Inquiries', href: 'inquiries.html', icon: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>' },
  { view: 'profile', label: 'Profile', href: 'profile.html', icon: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
  { view: 'settings', label: 'Settings', href: 'settings.html', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>' },
];
const CLIENT_BOTTOM_NAV = ['dashboard', 'requests', 'appointments', 'inquiries', 'profile'];

let CLIENT_USER = null;

function renderClientShell() {
  CLIENT_USER = requireAuth('client', 'login.html');
  if (!CLIENT_USER) return;

  const currentPage = document.body.dataset.page || 'dashboard';

  document.getElementById('topbar-mount').innerHTML = `
    <div class="topbar">
      <button class="hamburger" id="hamburgerBtn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      <a href="dashboard.html" class="topbar-logo"><div class="mark">G</div><div><b>GUPANA ELECTRICAL SUPPLIES</b><span>Installation Services</span></div></a>
      <div class="topbar-spacer"></div>
      <button class="icon-btn" id="notifBtn" title="Notifications" onclick="openClientNotifications()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        <span class="icon-badge" id="notifBadge" style="display:none;">0</span>
      </button>
      <button class="user-chip" onclick="location.href='profile.html'">
        <div class="user-avatar">${CLIENT_USER.full_name.charAt(0).toUpperCase()}</div>
        <div style="text-align:left;"><div class="u-name">${CLIENT_USER.full_name}</div><div class="u-role">Client</div></div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>`;

  document.getElementById('sidebar-mount').innerHTML = `
    <div class="sidebar" id="sidebar">
      ${CLIENT_NAV.map(item => `<a class="nav-item ${item.view === currentPage ? 'active' : ''}" href="${item.href}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>${item.label}</a>`).join('')}
      <button class="nav-item" id="logoutBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Logout</button>
    </div>`;

  const bottomHtml = CLIENT_BOTTOM_NAV.map(v => {
    const item = CLIENT_NAV.find(n => n.view === v);
    const label = v === 'dashboard' ? 'Home' : item.label.replace('Service ', '');
    return `<a class="bottom-nav-item ${v === currentPage ? 'active' : ''}" href="${item.href}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>${label}</a>`;
  }).join('');
  const bottomMount = document.getElementById('bottomnav-mount');
  if (bottomMount) bottomMount.innerHTML = `<div class="bottom-nav">${bottomHtml}</div>`;

  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('drawerOverlay').classList.add('open');
  });
  document.getElementById('drawerOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('open');
  });
  document.getElementById('logoutBtn').addEventListener('click', () => { clearSession('client'); window.location.href = 'login.html'; });

  if (window.lucide) lucide.createIcons();
  refreshClientNotifBadge();
}

async function refreshClientNotifBadge() {
  let count = 0;
  try { count = DEMO_MODE ? CLIENT_DEMO.notifications.filter(n => !n.is_read).length : (await api('/notifications/unread-count', {}, 'client')).count; } catch (e) {}
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  if (count > 0) { badge.style.display = 'flex'; badge.textContent = count > 9 ? '9+' : count; }
  else badge.style.display = 'none';
}

async function openClientNotifications() {
  const notifs = await loadList(CLIENT_DEMO.notifications, '/notifications', 'client');
  openModal(`
    <div class="modal-head"><h3>Notifications</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body" style="padding:0;">
      ${notifs.map(n => `
        <div style="display:flex; gap:10px; padding:14px 20px; border-bottom:1px solid #f0f3f1; ${n.is_read?'':'background:#fbfdf5;'}">
          <div style="width:32px;height:32px;border-radius:9px;background:var(--amber-bg);color:var(--amber-fg);display:flex;align-items:center;justify-content:center; flex-shrink:0;"><i data-lucide="bell" width="14" height="14"></i></div>
          <div style="flex:1;"><div class="cell-strong" style="font-size:12.5px;">${n.title}</div><div class="cell-muted" style="margin:2px 0;">${n.message}</div><div class="cell-muted">${new Date(n.created_at).toLocaleString()}</div></div>
        </div>`).join('') || `<div class="empty-state">No notifications.</div>`}
    </div>
    <div class="modal-foot"><button class="btn btn-outline" onclick="closeModal()">Close</button></div>`);
}

/** Call this at the top of every client page's script, before rendering page content. */
async function initClientPage() {
  await tryConnectBackend();
  renderClientShell();
}
