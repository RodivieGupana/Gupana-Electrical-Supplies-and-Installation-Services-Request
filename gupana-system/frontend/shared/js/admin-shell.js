/* ============================================================================
   Gupana — admin-shell.js
   Renders the shared header/sidebar/bottom-nav chrome on every admin page,
   using real <a href> links (multi-page navigation, no client-side router).
   Requires: core.js, demo-data.js loaded first. Each page must set
   <body data-page="dashboard"> (or users/services/requests/...) and include
   mount points: #topbar-mount, #sidebar-mount, #bottomnav-mount, #drawerOverlay.
   ============================================================================ */

const ADMIN_NAV = [
  { view: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>' },
  { view: 'users', label: 'Users', href: 'users.html', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { view: 'services', label: 'Services', href: 'services.html', icon: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>' },
  { view: 'requests', label: 'Service Requests', href: 'requests.html', icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' },
  { view: 'appointments', label: 'Appointments', href: 'appointments.html', icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  { view: 'inquiries', label: 'Inquiries', href: 'inquiries.html', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
  { view: 'notifications', label: 'Notifications', href: 'notifications.html', icon: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>' },
  { group: 'Insights' },
  { view: 'reports', label: 'Reports', href: 'reports.html', icon: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>' },
  { view: 'activity', label: 'Activity Logs', href: 'activity.html', icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
  { group: 'Account' },
  { view: 'settings', label: 'Settings', href: 'settings.html', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
];
const ADMIN_BOTTOM_NAV = ['dashboard', 'requests', 'inquiries'];

let ADMIN_USER = null;

function renderAdminShell() {
  ADMIN_USER = requireAuth('admin', 'login.html');
  if (!ADMIN_USER) return;

  const currentPage = document.body.dataset.page || 'dashboard';

  document.getElementById('topbar-mount').innerHTML = `
    <div class="topbar">
      <button class="hamburger" id="hamburgerBtn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      <a href="dashboard.html" class="topbar-logo"><div class="mark">G</div><div><b>GUPANA ELECTRICAL SUPPLIES</b><span>and Installation Services</span></div></a>
      <div class="topbar-spacer"></div>
      <button class="icon-btn" id="notifBtn" title="Notifications" onclick="location.href='notifications.html'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        <span class="icon-badge" id="notifBadge" style="display:none;">0</span>
      </button>
      <button class="user-chip" onclick="location.href='settings.html'">
        <div class="user-avatar">${ADMIN_USER.full_name.charAt(0).toUpperCase()}</div>
        <div style="text-align:left;"><div class="u-name">${ADMIN_USER.full_name}</div><div class="u-role">${ADMIN_USER.role}</div></div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>`;

  document.getElementById('sidebar-mount').innerHTML = `
    <div class="sidebar" id="sidebar">
      ${ADMIN_NAV.map(item => item.group
        ? `<div class="nav-group-label">${item.group}</div>`
        : `<a class="nav-item ${item.view === currentPage ? 'active' : ''}" href="${item.href}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>${item.label}</a>`
      ).join('')}
      <button class="nav-item" id="logoutBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Logout</button>
    </div>`;

  const bottomHtml = ADMIN_BOTTOM_NAV.map(v => {
    const item = ADMIN_NAV.find(n => n.view === v);
    return `<a class="bottom-nav-item ${v === currentPage ? 'active' : ''}" href="${item.href}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>${item.label}</a>`;
  }).join('') + `<a class="bottom-nav-item ${['services','appointments','notifications','reports','activity','settings'].includes(currentPage) ? 'active' : ''}" href="more.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>More</a>`;
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
  document.getElementById('logoutBtn').addEventListener('click', () => { clearSession('admin'); window.location.href = 'login.html'; });

  if (window.lucide) lucide.createIcons();
  refreshAdminNotifBadge();
}

async function refreshAdminNotifBadge() {
  let count = 0;
  try { count = DEMO_MODE ? ADMIN_DEMO.notifications.filter(n => !n.is_read).length : (await api('/notifications/unread-count', {}, 'admin')).count; } catch (e) {}
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  if (count > 0) { badge.style.display = 'flex'; badge.textContent = count > 9 ? '9+' : count; }
  else badge.style.display = 'none';
}

/** Call this at the top of every admin page's script, before rendering page content. */
async function initAdminPage() {
  await tryConnectBackend();
  renderAdminShell();
}
