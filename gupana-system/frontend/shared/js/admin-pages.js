/* ============================================================================
   Gupana — admin-pages.js
   Page-specific render functions. Each admin HTML page calls exactly one of
   these (e.g. initDashboardPage()) after initAdminPage() has run.
   Requires: core.js, demo-data.js, admin-shell.js loaded first.
   ============================================================================ */

/* ================= DASHBOARD ================= */
let donutChartInstance = null, lineChartInstance = null;
async function initDashboardPage() {
  await initAdminPage();
  if (!ADMIN_USER) return;

  let stats, statusBreakdown, requestsOverTime, recentRequests, upcomingAppointments;
  if (DEMO_MODE) {
    stats = ADMIN_DEMO.stats; statusBreakdown = ADMIN_DEMO.statusBreakdown; requestsOverTime = ADMIN_DEMO.requestsOverTime;
    recentRequests = ADMIN_DEMO.requests.slice(0, 5); upcomingAppointments = ADMIN_DEMO.appointments.slice(0, 5);
  } else {
    try {
      const d = await api('/reports/dashboard', {}, 'admin');
      stats = d; statusBreakdown = d.status_breakdown; requestsOverTime = d.requests_over_time;
      recentRequests = d.recent_requests; upcomingAppointments = d.upcoming_appointments;
    } catch (e) { toast(e.message, true); return; }
  }

  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Dashboard</h1><p class="page-sub">Overview of your system</p></div></div>
    <div class="grid grid-5" style="margin-bottom:18px;">
      <div class="card stat c-green"><div class="stat-icon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg></div><div class="stat-val">${stats.total_requests}</div><div class="stat-label">Total Requests</div><a class="stat-link" href="requests.html">View all requests</a></div>
      <div class="card stat c-amber"><div class="stat-icon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="stat-val">${stats.pending_requests}</div><div class="stat-label">Pending Requests</div><a class="stat-link" href="requests.html">View pending</a></div>
      <div class="card stat c-blue"><div class="stat-icon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div><div class="stat-val">${stats.confirmed_appointments}</div><div class="stat-label">Confirmed Appointments</div><a class="stat-link" href="appointments.html">View schedule</a></div>
      <div class="card stat c-purple"><div class="stat-icon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div><div class="stat-val">${stats.new_inquiries}</div><div class="stat-label">New Inquiries</div><a class="stat-link" href="inquiries.html">View inquiries</a></div>
      <div class="card stat c-red"><div class="stat-icon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 003.4 0"/></svg></div><div class="stat-val">${stats.unread_notifications}</div><div class="stat-label">Unread Notifications</div><a class="stat-link" href="notifications.html">View all</a></div>
    </div>
    <div class="grid grid-2" style="margin-bottom:18px;">
      <div class="card"><div class="card-head"><h3>Request Status Overview</h3></div><div class="card-pad" style="display:flex; align-items:center; gap:22px; flex-wrap:wrap;">
        <canvas id="donutChart" width="150" height="150" style="max-width:150px;"></canvas>
        <div style="flex:1; min-width:160px; display:flex; flex-direction:column; gap:10px;">
          ${statusBreakdown.map(s => `<div style="display:flex; align-items:center; gap:8px; font-size:13px;"><span style="width:10px;height:10px;border-radius:3px;background:${statusColor(s.status)};display:inline-block;"></span><span style="text-transform:capitalize; flex:1;">${s.status}</span><b>${s.count}</b></div>`).join('')}
        </div>
      </div></div>
      <div class="card"><div class="card-head"><h3>Recent Service Requests</h3><a class="link-sm" href="requests.html">View All</a></div>
        <div>${recentRequests.length ? recentRequests.map(r => `
          <div style="display:flex; align-items:center; gap:12px; padding:12px 20px; border-bottom:1px solid #f0f3f1;">
            <div style="width:34px;height:34px;border-radius:9px;background:var(--blue-bg);color:var(--blue-fg);display:flex;align-items:center;justify-content:center; flex-shrink:0;"><i data-lucide="wrench" width="15" height="15"></i></div>
            <div style="flex:1; min-width:0;"><div class="cell-strong" style="font-size:13px;">${r.service_name}</div><div class="cell-muted">${fmtDate(r.created_at)}</div></div>
            ${badge(r.status)}
          </div>`).join('') : `<div class="empty-state">No requests yet.</div>`}
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:18px;"><div class="card-head"><h3>Requests Over Time</h3></div><div class="card-pad"><canvas id="lineChart" height="80"></canvas></div></div>
    <div class="card">
      <div class="card-head"><h3>Upcoming Appointments</h3><a class="link-sm" href="appointments.html">View All</a></div>
      <div style="overflow-x:auto;"><table><thead><tr><th>Client</th><th>Service</th><th>Date &amp; Time</th><th>Status</th></tr></thead><tbody>
        ${upcomingAppointments.length ? upcomingAppointments.map(a => `<tr><td class="cell-strong">${a.client_name}</td><td>${a.service_name||''}</td><td>${fmtDate(a.appointment_date)} • ${fmtTime(a.start_time)} - ${fmtTime(a.end_time)}</td><td>${badge(a.status)}</td></tr>`).join('') : `<tr><td colspan="4" class="empty-state">No upcoming appointments.</td></tr>`}
      </tbody></table></div>
    </div>`;

  const donutCtx = document.getElementById('donutChart');
  if (donutChartInstance) donutChartInstance.destroy();
  donutChartInstance = new Chart(donutCtx, { type: 'doughnut', data: { labels: statusBreakdown.map(s=>s.status), datasets: [{ data: statusBreakdown.map(s=>s.count), backgroundColor: statusBreakdown.map(s=>statusColor(s.status)), borderWidth:0 }] }, options: { cutout: '68%', plugins: { legend: { display:false } } } });
  const lineCtx = document.getElementById('lineChart');
  if (lineChartInstance) lineChartInstance.destroy();
  lineChartInstance = new Chart(lineCtx, { type: 'line', data: { labels: requestsOverTime.map(d=>d.day||d.date||d.count), datasets: [{ data: requestsOverTime.map(d=>d.count), borderColor:'#0d4229', backgroundColor:'rgba(13,66,41,.08)', fill:true, tension:.4, pointRadius:3, pointBackgroundColor:'#0d4229' }] }, options: { plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true, grid:{color:'#f0f3f1'}}, x:{grid:{display:false}} } } });
  lucide.createIcons();
}

/* ================= USERS ================= */
async function initUsersPage() {
  await initAdminPage();
  if (!ADMIN_USER) return;
  const users = await loadList(ADMIN_DEMO.users, '/users?role=client', 'admin');
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head">
      <div><h1 class="page-title">Users</h1><p class="page-sub">Manage client accounts</p></div>
      <button class="btn btn-yellow" onclick="openUserModal()"><i data-lucide="user-plus" width="15" height="15"></i> Add Client</button>
    </div>
    <div class="card">
      <div class="toolbar"><div class="search-box"><i data-lucide="search"></i><input placeholder="Search users..." oninput="filterTable('userTable', this.value)"/></div></div>
      <div style="overflow-x:auto;"><table id="userTable"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th></th></tr></thead><tbody>
      ${users.map(u => `
        <tr data-search="${(u.full_name+u.email).toLowerCase()}">
          <td class="cell-strong">${u.full_name}</td><td>${u.email}</td><td>${u.phone_number||'—'}</td><td class="cell-muted">${fmtDate(u.created_at)}</td>
          <td>${badge(u.status)}</td>
          <td style="white-space:nowrap;">
            <button class="icon-action" onclick='openUserModal(${JSON.stringify(u).replace(/'/g,"&#39;")})'><i data-lucide="pencil"></i></button>
            <button class="icon-action" onclick="deleteUser(${u.user_id})"><i data-lucide="trash-2"></i></button>
          </td>
        </tr>`).join('') || `<tr><td colspan="6" class="empty-state">No users found.</td></tr>`}
      </tbody></table></div>
    </div>`;
  lucide.createIcons();
}
function openUserModal(user) {
  const editing = !!user;
  openModal(`
    <div class="modal-head"><h3>${editing ? 'Edit Client' : 'Add Client'}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <form id="userForm">
      <div class="modal-body">
        <div class="field"><label>Full name</label><input id="uf_name" value="${editing?user.full_name:''}" required/></div>
        <div class="field"><label>Email</label><input id="uf_email" type="email" value="${editing?user.email:''}" ${editing?'disabled':''} required/></div>
        <div class="field"><label>Phone number</label><input id="uf_phone" value="${editing?(user.phone_number||''):''}"/></div>
        ${editing ? `<div class="field"><label>Status</label><select id="uf_status"><option value="active" ${user.status==='active'?'selected':''}>Active</option><option value="inactive" ${user.status==='inactive'?'selected':''}>Inactive</option><option value="suspended" ${user.status==='suspended'?'selected':''}>Suspended</option></select></div>` :
        `<div class="field"><label>Temporary password</label><input id="uf_password" type="text" placeholder="e.g. Client@123" required/></div>`}
      </div>
      <div class="modal-foot"><button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">${editing?'Save Changes':'Create Client'}</button></div>
    </form>`);
  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { full_name: document.getElementById('uf_name').value, phone_number: document.getElementById('uf_phone').value };
    try {
      if (DEMO_MODE) { toast(editing ? 'Client updated (demo mode).' : 'Client created (demo mode).'); closeModal(); return initUsersPage(); }
      if (editing) { payload.status = document.getElementById('uf_status').value; await api(`/users/${user.user_id}`, { method:'PUT', body: JSON.stringify(payload) }, 'admin'); toast('Client updated.'); }
      else { payload.email = document.getElementById('uf_email').value; payload.password = document.getElementById('uf_password').value; await api('/auth/register', { method:'POST', body: JSON.stringify(payload) }, 'admin'); toast('Client created.'); }
      closeModal(); initUsersPage();
    } catch (err) { toast(err.message, true); }
  });
}
async function deleteUser(id) {
  if (!confirm('Remove this client account?')) return;
  if (DEMO_MODE) { toast('Client removed (demo mode).'); return initUsersPage(); }
  try { await api(`/users/${id}`, { method:'DELETE' }, 'admin'); toast('Client removed.'); initUsersPage(); }
  catch (err) { toast(err.message, true); }
}

/* ================= SERVICES ================= */
async function initServicesPage() {
  await initAdminPage();
  if (!ADMIN_USER) return;
  const services = await loadList(ADMIN_DEMO.services, '/services', 'admin');
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head">
      <div><h1 class="page-title">Services</h1><p class="page-sub">Manage the service catalog clients can browse and request. Pricing is discussed directly with the client, not shown here.</p></div>
      <button class="btn btn-yellow" onclick="openServiceModal()"><i data-lucide="plus" width="15" height="15"></i> Add Service</button>
    </div>
    <div class="card"><div class="services-grid">
      ${services.map(s => `
        <div class="service-tile">
          <div class="s-icon"><i data-lucide="${s.icon||'zap'}"></i></div>
          <h4>${s.service_name}</h4><p>${s.description||''}</p>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:12px;">
            <span class="badge ${s.is_active?'badge-active':'badge-inactive'}">${s.is_active?'Active':'Inactive'}</span>
            <div><button class="icon-action" onclick='openServiceModal(${JSON.stringify(s).replace(/'/g,"&#39;")})'><i data-lucide="pencil"></i></button>
            <button class="icon-action" onclick="deleteService(${s.service_id})"><i data-lucide="trash-2"></i></button></div>
          </div>
        </div>`).join('') || `<div class="empty-state">No services yet.</div>`}
    </div></div>`;
  lucide.createIcons();
}
function openServiceModal(service) {
  const editing = !!service;
  openModal(`
    <div class="modal-head"><h3>${editing?'Edit Service':'Add Service'}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <form id="serviceForm">
      <div class="modal-body">
        <div class="field"><label>Service name</label><input id="sf_name" value="${editing?service.service_name:''}" required/></div>
        <div class="field"><label>Category</label><input id="sf_category" value="${editing?service.category:''}" placeholder="Installation, Repair, Wiring, Maintenance..." required/></div>
        <div class="field"><label>Description</label><textarea id="sf_desc" rows="3">${editing?(service.description||''):''}</textarea></div>
        <div class="field"><label>Icon (lucide name)</label><input id="sf_icon" value="${editing?(service.icon||'zap'):'zap'}" placeholder="home, wrench, plug, settings"/></div>
      </div>
      <div class="modal-foot"><button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">${editing?'Save Changes':'Add Service'}</button></div>
    </form>`);
  document.getElementById('serviceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { service_name: document.getElementById('sf_name').value, category: document.getElementById('sf_category').value, description: document.getElementById('sf_desc').value, icon: document.getElementById('sf_icon').value || 'zap' };
    try {
      if (DEMO_MODE) { toast('Saved (demo mode).'); closeModal(); return initServicesPage(); }
      if (editing) await api(`/services/${service.service_id}`, { method:'PUT', body: JSON.stringify(payload) }, 'admin');
      else await api('/services', { method:'POST', body: JSON.stringify(payload) }, 'admin');
      toast('Service saved.'); closeModal(); initServicesPage();
    } catch (err) { toast(err.message, true); }
  });
}
async function deleteService(id) {
  if (!confirm('Remove this service?')) return;
  if (DEMO_MODE) { toast('Removed (demo mode).'); return initServicesPage(); }
  try { await api(`/services/${id}`, { method:'DELETE' }, 'admin'); toast('Service removed.'); initServicesPage(); }
  catch (err) { toast(err.message, true); }
}

/* ================= SERVICE REQUESTS ================= */
let requestsStatusFilter = 'All';
let requestsCategoryFilter = 'All'; // All | Recent | Old
const RECENT_DAYS_THRESHOLD = 14;

function categorizeRequest(r) {
  const days = (Date.now() - new Date(r.created_at).getTime()) / 86400000;
  return days <= RECENT_DAYS_THRESHOLD ? 'Recent' : 'Old';
}

async function initRequestsPage() {
  await initAdminPage();
  if (!ADMIN_USER) return;
  await drawRequestsPage();
}
async function drawRequestsPage() {
  let requests = await loadList(ADMIN_DEMO.requests, `/service-requests${requestsStatusFilter!=='All' ? '?status='+requestsStatusFilter.toLowerCase() : ''}`, 'admin');
  if (requestsCategoryFilter !== 'All') requests = requests.filter(r => categorizeRequest(r) === requestsCategoryFilter);

  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Service Requests</h1><p class="page-sub">Review and manage incoming service requests</p></div></div>
    <div class="card">
      <div class="tabs">${['All','Recent','Old'].map(t => `<button class="tab ${requestsCategoryFilter===t?'active':''}" onclick="requestsCategoryFilter='${t}'; drawRequestsPage();">${t === 'All' ? 'All' : t + ' Requests'}</button>`).join('')}</div>
      <div class="tabs" style="padding-top:6px;">${['All','Pending','Approved','Completed','Cancelled'].map(t => `<button class="tab ${requestsStatusFilter===t?'active':''}" onclick="requestsStatusFilter='${t}'; drawRequestsPage();">${t}</button>`).join('')}</div>
      <div class="toolbar"><div class="search-box"><i data-lucide="search"></i><input placeholder="Search request, client, or service..." oninput="filterTable('reqTable', this.value)"/></div></div>
      <div style="overflow-x:auto;"><table id="reqTable"><thead><tr><th>Request ID</th><th>Client</th><th>Service</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>
      ${requests.map(r => `
        <tr data-search="${(r.request_code+r.client_name+r.service_name).toLowerCase()}">
          <td class="cell-strong">${r.request_code}</td><td>${r.client_name}</td><td>${r.service_name}</td><td class="cell-muted">${fmtDate(r.created_at)}</td><td>${badge(r.status)}</td>
          <td style="white-space:nowrap;">
            <button class="icon-action" onclick='viewRequest(${JSON.stringify(r).replace(/'/g,"&#39;")})' title="View"><i data-lucide="eye"></i></button>
            <button class="icon-action" onclick="deleteRequest(${r.request_id})" title="Delete"><i data-lucide="trash-2"></i></button>
          </td>
        </tr>`).join('') || `<tr><td colspan="6" class="empty-state">No service requests found.</td></tr>`}
      </tbody></table></div>
    </div>`;
  lucide.createIcons();
}
function viewRequest(r) {
  openModal(`
    <div class="modal-head"><h3>${r.request_code}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">${badge(r.status)}<span class="cell-muted">${fmtDate(r.created_at)}</span></div>
      <div class="field"><label>Client</label><div class="cell-strong">${r.client_name}</div></div>
      <div class="field"><label>Service</label><div>${r.service_name}</div></div>
      <div class="field"><label>Client's comment / problem description</label><div style="font-size:13px; color:var(--muted);">${r.problem_description||'—'}</div></div>
      <div class="field"><label>Preferred schedule</label><div>${r.block_date ? fmtDate(r.block_date)+' • '+fmtTime(r.start_time)+' - '+fmtTime(r.end_time) : 'No preference specified'}</div></div>
      <div class="field"><label>Address</label><div>${r.address||'—'}</div></div>
    </div>
    <div class="modal-foot" style="flex-wrap:wrap;">
      ${r.status==='pending' ? `<button class="btn btn-primary" onclick="scheduleAppointment(${JSON.stringify(r).replace(/"/g,'&quot;')})">Approve &amp; Schedule</button><button class="btn btn-danger-outline" onclick="updateRequestStatus(${r.request_id},'cancelled')">Decline</button>` : ''}
      ${r.status==='approved' ? `<button class="btn btn-primary" onclick="updateRequestStatus(${r.request_id},'completed')">Mark Completed</button>` : ''}
      <button class="btn btn-outline" onclick="closeModal()">Close</button>
    </div>`);
}
async function updateRequestStatus(id, status) {
  if (DEMO_MODE) { toast(`Request set to ${status} (demo mode).`); closeModal(); return drawRequestsPage(); }
  try { await api(`/service-requests/${id}/status`, { method:'PUT', body: JSON.stringify({ status }) }, 'admin'); toast(`Request set to ${status}.`); closeModal(); drawRequestsPage(); }
  catch (err) { toast(err.message, true); }
}
async function deleteRequest(id) {
  if (!confirm('Delete this service request permanently? This cannot be undone.')) return;
  if (DEMO_MODE) { toast('Request deleted (demo mode).'); closeModal(); return drawRequestsPage(); }
  try { await api(`/service-requests/${id}`, { method:'DELETE' }, 'admin'); toast('Request deleted.'); closeModal(); drawRequestsPage(); }
  catch (err) { toast(err.message, true); }
}
function scheduleAppointment(r) {
  openModal(`
    <div class="modal-head"><h3>Approve &amp; Schedule</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <form id="apptForm">
      <div class="modal-body">
        <p class="cell-muted" style="margin-top:0;">Assign a confirmed appointment slot for <b>${r.client_name}</b> — ${r.service_name}</p>
        <div class="field"><label>Date</label><input type="date" id="af_date" value="${r.block_date||''}" required/></div>
        <div style="display:flex; gap:10px;">
          <div class="field" style="flex:1;"><label>Start time</label><input type="time" id="af_start" value="${r.start_time||'08:00'}" required/></div>
          <div class="field" style="flex:1;"><label>End time</label><input type="time" id="af_end" value="${r.end_time||'10:00'}" required/></div>
        </div>
        <div class="field"><label>Location</label><input id="af_location" value="${r.address||''}"/></div>
        <div class="field"><label>Note for client</label><textarea id="af_note" rows="2" placeholder="This note will be visible to the client on their request/appointment."></textarea></div>
      </div>
      <div class="modal-foot"><button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Confirm Appointment</button></div>
    </form>`);
  document.getElementById('apptForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { request_id: r.request_id, appointment_date: document.getElementById('af_date').value, start_time: document.getElementById('af_start').value, end_time: document.getElementById('af_end').value, location: document.getElementById('af_location').value, note: document.getElementById('af_note').value };
    if (DEMO_MODE) { toast('Appointment confirmed (demo mode).'); closeModal(); return drawRequestsPage(); }
    try { await api('/appointments', { method:'POST', body: JSON.stringify(payload) }, 'admin'); toast('Appointment confirmed. Your note is now visible to the client.'); closeModal(); drawRequestsPage(); }
    catch (err) { toast(err.message, true); }
  });
}

/* ================= APPOINTMENTS ================= */
let apptFilter = 'All';
async function initAppointmentsPage() {
  await initAdminPage();
  if (!ADMIN_USER) return;
  await drawAppointmentsPage();
}
async function drawAppointmentsPage() {
  const appts = await loadList(ADMIN_DEMO.appointments, `/appointments${apptFilter!=='All' ? '?status='+apptFilter.toLowerCase() : ''}`, 'admin');
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Appointments</h1><p class="page-sub">Confirmed and pending appointment schedule</p></div></div>
    <div class="card">
      <div class="tabs">${['All','Confirmed','Pending','Completed','Cancelled'].map(t => `<button class="tab ${apptFilter===t?'active':''}" onclick="apptFilter='${t}'; drawAppointmentsPage();">${t}</button>`).join('')}</div>
      <div class="toolbar"><div class="search-box"><i data-lucide="search"></i><input placeholder="Search appointment..." oninput="filterTable('apptTable', this.value)"/></div></div>
      <div style="overflow-x:auto;"><table id="apptTable"><thead><tr><th>Date &amp; Time</th><th>Client</th><th>Service</th><th>Note to Client</th><th>Status</th><th></th></tr></thead><tbody>
      ${appts.map(a => `
        <tr data-search="${(a.client_name+a.service_name).toLowerCase()}">
          <td>${fmtDate(a.appointment_date)}<br/><span class="cell-muted">${fmtTime(a.start_time)} - ${fmtTime(a.end_time)}</span></td>
          <td class="cell-strong">${a.client_name}</td><td>${a.service_name||''}</td>
          <td class="cell-muted" style="max-width:200px; white-space:normal;">${a.note||'—'}</td><td>${badge(a.status)}</td>
          <td style="white-space:nowrap;">
            ${a.status!=='completed'&&a.status!=='cancelled' ? `<button class="icon-action" onclick="updateApptStatus(${a.appointment_id},'completed')" title="Mark completed"><i data-lucide="check"></i></button>
            <button class="icon-action" onclick="updateApptStatus(${a.appointment_id},'cancelled')" title="Cancel"><i data-lucide="x"></i></button>` : ''}
          </td>
        </tr>`).join('') || `<tr><td colspan="6" class="empty-state">No appointments found.</td></tr>`}
      </tbody></table></div>
    </div>`;
  lucide.createIcons();
}
async function updateApptStatus(id, status) {
  if (DEMO_MODE) { toast(`Appointment set to ${status} (demo mode).`); return drawAppointmentsPage(); }
  try { await api(`/appointments/${id}/status`, { method:'PUT', body: JSON.stringify({ status }) }, 'admin'); toast(`Appointment set to ${status}.`); drawAppointmentsPage(); }
  catch (err) { toast(err.message, true); }
}

/* ================= INQUIRIES ================= */
let inqFilter = 'All';
async function initInquiriesPage() {
  await initAdminPage();
  if (!ADMIN_USER) return;
  await drawInquiriesPage();
}
async function drawInquiriesPage() {
  const inquiries = await loadList(ADMIN_DEMO.inquiries, `/inquiries${inqFilter!=='All' ? '?status='+inqFilter.toLowerCase() : ''}`, 'admin');
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Inquiries</h1><p class="page-sub">Respond to client questions and requests for information</p></div></div>
    <div class="card">
      <div class="tabs">${['All','Unanswered','Answered'].map(t => `<button class="tab ${inqFilter===t?'active':''}" onclick="inqFilter='${t}'; drawInquiriesPage();">${t}</button>`).join('')}</div>
      <div class="toolbar"><div class="search-box"><i data-lucide="search"></i><input placeholder="Search inquiries..." oninput="filterTable('inqTable', this.value)"/></div></div>
      <div style="overflow-x:auto;"><table id="inqTable"><thead><tr><th>Inquiry ID</th><th>Client</th><th>Subject</th><th>Status</th><th></th></tr></thead><tbody>
      ${inquiries.map(i => `
        <tr data-search="${(i.inquiry_code+i.client_name+i.subject).toLowerCase()}">
          <td class="cell-strong">${i.inquiry_code}</td><td>${i.client_name}</td><td>${i.subject}</td><td>${badge(i.status)}</td>
          <td style="white-space:nowrap;"><button class="icon-action" onclick='viewInquiry(${JSON.stringify(i).replace(/'/g,"&#39;")})'><i data-lucide="eye"></i></button></td>
        </tr>`).join('') || `<tr><td colspan="5" class="empty-state">No inquiries found.</td></tr>`}
      </tbody></table></div>
    </div>`;
  lucide.createIcons();
}
function viewInquiry(i) {
  openModal(`
    <div class="modal-head"><h3>${i.inquiry_code}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">${badge(i.status)}<span class="cell-muted">${fmtDate(i.created_at)}</span></div>
      <div class="field"><label>From</label><div class="cell-strong">${i.client_name}</div></div>
      <div class="field"><label>Subject</label><div>${i.subject}</div></div>
      <div class="field"><label>Message</label><div style="font-size:13px; color:var(--muted); background:#f8faf8; padding:10px 12px; border-radius:9px;">${i.message}</div></div>
      ${i.reply ? `<div class="field"><label>Your reply</label><div style="font-size:13px; background:var(--green-bg); color:var(--green-fg); padding:10px 12px; border-radius:9px;">${i.reply}</div></div>`
      : `<div class="field"><label>Reply</label><textarea id="replyText" rows="3" placeholder="Type your reply..."></textarea></div>`}
    </div>
    <div class="modal-foot">${!i.reply ? `<button class="btn btn-primary" onclick="sendReply(${i.inquiry_id})">Send Reply</button>` : ''}<button class="btn btn-outline" onclick="closeModal()">Close</button></div>`);
}
async function sendReply(id) {
  const reply = document.getElementById('replyText').value.trim();
  if (!reply) { toast('Write a reply before sending.', true); return; }
  if (DEMO_MODE) { toast('Reply sent (demo mode).'); closeModal(); return drawInquiriesPage(); }
  try { await api(`/inquiries/${id}/reply`, { method:'PUT', body: JSON.stringify({ reply }) }, 'admin'); toast('Reply sent.'); closeModal(); drawInquiriesPage(); }
  catch (err) { toast(err.message, true); }
}

/* ================= NOTIFICATIONS ================= */
async function initNotificationsPage() {
  await initAdminPage();
  if (!ADMIN_USER) return;
  await drawNotificationsPage();
}
async function drawNotificationsPage() {
  const notifs = await loadList(ADMIN_DEMO.notifications, '/notifications', 'admin');
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Notifications</h1><p class="page-sub">System alerts and updates</p></div><button class="btn btn-outline" onclick="markAllRead()">Mark all as read</button></div>
    <div class="card">
      ${notifs.map(n => `
        <div style="display:flex; gap:12px; padding:14px 20px; border-bottom:1px solid #f0f3f1; ${n.is_read?'':'background:#fbfdf5;'}">
          <div style="width:34px;height:34px;border-radius:9px;background:var(--amber-bg);color:var(--amber-fg);display:flex;align-items:center;justify-content:center; flex-shrink:0;"><i data-lucide="bell" width="15" height="15"></i></div>
          <div style="flex:1;"><div class="cell-strong" style="font-size:13px;">${n.title}</div><div class="cell-muted" style="margin:2px 0 4px;">${n.message}</div><div class="cell-muted">${new Date(n.created_at).toLocaleString()}</div></div>
          ${!n.is_read ? '<span style="width:8px;height:8px;border-radius:50%;background:var(--red-fg); margin-top:6px;"></span>' : ''}
        </div>`).join('') || `<div class="empty-state">No notifications.</div>`}
    </div>`;
  lucide.createIcons();
}
async function markAllRead() {
  if (!DEMO_MODE) { try { await api('/notifications/read-all', { method:'PUT' }, 'admin'); } catch(e){} }
  else ADMIN_DEMO.notifications.forEach(n => n.is_read = true);
  toast('All notifications marked as read.'); drawNotificationsPage();
}

/* ================= REPORTS ================= */
async function initReportsPage() {
  await initAdminPage();
  if (!ADMIN_USER) return;
  const main = document.getElementById('mainContent');
  const today = new Date().toISOString().slice(0,10);
  const weekAgo = new Date(Date.now()-6*86400000).toISOString().slice(0,10);
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Reports</h1><p class="page-sub">Generate operational reports</p></div></div>
    <div class="card card-pad">
      <div class="field"><label>Report type</label><select id="rp_type">
        <option value="service_requests">Service Requests Report</option>
        <option value="appointments">Appointments Report</option>
        <option value="inquiries">Inquiries Report</option>
        <option value="activity_logs">Activity Logs Report</option>
      </select></div>
      <div style="display:flex; gap:10px;">
        <div class="field" style="flex:1;"><label>From</label><input type="date" id="rp_from" value="${weekAgo}"/></div>
        <div class="field" style="flex:1;"><label>To</label><input type="date" id="rp_to" value="${today}"/></div>
      </div>
      <button class="btn btn-primary" onclick="generateReport()">Generate Report</button>
      <div id="reportResults" style="margin-top:22px;"></div>
    </div>`;
  lucide.createIcons();
}
async function generateReport() {
  const type = document.getElementById('rp_type').value;
  const from = document.getElementById('rp_from').value;
  const to = document.getElementById('rp_to').value;
  const box = document.getElementById('reportResults');
  box.innerHTML = '<div class="empty-state">Generating…</div>';
  let rows = [];
  if (DEMO_MODE) {
    const map = { service_requests: ADMIN_DEMO.requests, appointments: ADMIN_DEMO.appointments, inquiries: ADMIN_DEMO.inquiries, activity_logs: ADMIN_DEMO.activity };
    rows = map[type] || [];
  } else {
    try { rows = (await api(`/reports/generate?type=${type}&from=${from}&to=${to}`, {}, 'admin')).rows; }
    catch (e) { box.innerHTML = `<div class="empty-state">${e.message}</div>`; return; }
  }
  if (!rows.length) { box.innerHTML = '<div class="empty-state">No records found for this range.</div>'; return; }
  const cols = Object.keys(rows[0]).filter(k => !k.toLowerCase().includes('_id'));
  box.innerHTML = `<div style="overflow-x:auto;"><table><thead><tr>${cols.map(c=>`<th>${c.replace(/_/g,' ')}</th>`).join('')}</tr></thead><tbody>
    ${rows.map(r => `<tr>${cols.map(c=>`<td>${typeof r[c]==='string'&&r[c].match(/^\d{4}-\d{2}-\d{2}/) ? fmtDate(r[c]) : (r[c]??'—')}</td>`).join('')}</tr>`).join('')}
  </tbody></table></div>`;
}

/* ================= ACTIVITY LOGS ================= */
async function initActivityPage() {
  await initAdminPage();
  if (!ADMIN_USER) return;
  const logs = await loadList(ADMIN_DEMO.activity, '/activity-logs', 'admin');
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Activity Logs</h1><p class="page-sub">Track administrative actions for accountability</p></div></div>
    <div class="card"><div style="overflow-x:auto;"><table><thead><tr><th>User</th><th>Action</th><th>Module</th><th>Date &amp; Time</th></tr></thead><tbody>
      ${logs.map(l => `<tr><td class="cell-strong">${l.user_name||'System'}</td><td>${l.action}</td><td><span class="badge badge-active">${l.module||'—'}</span></td><td class="cell-muted">${new Date(l.created_at).toLocaleString()}</td></tr>`).join('') || `<tr><td colspan="4" class="empty-state">No activity recorded.</td></tr>`}
    </tbody></table></div></div>`;
  lucide.createIcons();
}

/* ================= SETTINGS ================= */
async function initSettingsPage() {
  await initAdminPage();
  if (!ADMIN_USER) return;
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Settings</h1><p class="page-sub">Your administrator account</p></div></div>
    <div class="card card-pad" style="max-width:480px;">
      <div class="field"><label>Full name</label><input id="st_name" value="${ADMIN_USER.full_name}"/></div>
      <div class="field"><label>Email</label><input value="${ADMIN_USER.email}" disabled/></div>
      <div class="field"><label>New password (leave blank to keep current)</label><input id="st_password" type="password" placeholder="••••••••"/></div>
      <button class="btn btn-primary" onclick="saveAdminSettings()">Save Changes</button>
    </div>`;
  lucide.createIcons();
}
async function saveAdminSettings() {
  const name = document.getElementById('st_name').value;
  const password = document.getElementById('st_password').value;
  if (DEMO_MODE) { toast('Profile updated (demo mode).'); return; }
  try {
    await api(`/users/${ADMIN_USER.user_id}`, { method:'PUT', body: JSON.stringify({ full_name: name }) }, 'admin');
    if (password) await api(`/users/${ADMIN_USER.user_id}/password`, { method:'PUT', body: JSON.stringify({ password }) }, 'admin');
    ADMIN_USER.full_name = name;
    setSession('admin', getToken('admin'), ADMIN_USER);
    toast('Profile updated.');
  } catch (err) { toast(err.message, true); }
}
