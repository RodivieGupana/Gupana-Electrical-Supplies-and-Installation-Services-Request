/* ============================================================================
   Gupana — client-pages.js
   Page-specific render functions. Each client HTML page calls exactly one of
   these after initClientPage() has run.
   Requires: core.js, demo-data.js, client-shell.js loaded first.
   ============================================================================ */

/* ================= DASHBOARD ================= */
async function initDashboardPage() {
  await initClientPage();
  if (!CLIENT_USER) return;

  let stats, recentRequests, nextAppointment, services;
  if (DEMO_MODE) {
    stats = CLIENT_DEMO.stats; recentRequests = CLIENT_DEMO.requests.slice(0,3); nextAppointment = CLIENT_DEMO.appointments[0]; services = CLIENT_DEMO.services;
  } else {
    try {
      const d = await api('/client-dashboard', {}, 'client');
      stats = d; recentRequests = d.recent_requests; nextAppointment = d.next_appointment;
      services = await loadList(CLIENT_DEMO.services, '/services?active=true', 'client');
    } catch (e) { toast(e.message, true); return; }
  }
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="hero-cta">
      <h2>Hi, ${CLIENT_USER.full_name.split(' ')[0]}! 👋</h2>
      <p>What service do you need today?</p>
      <a href="requests.html?new=1" class="btn btn-yellow"><i data-lucide="plus" width="15" height="15"></i> Request a Service</a>
    </div>
    <div class="grid grid-4" style="margin-bottom:18px;">
      <div class="card stat c-green"><div class="stat-icon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="stat-val">${stats.my_requests}</div><div class="stat-label">My Requests</div><a class="stat-link" href="requests.html">View requests</a></div>
      <div class="card stat c-amber"><div class="stat-icon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="stat-val">${stats.upcoming_appointments}</div><div class="stat-label">Upcoming Appointment</div><a class="stat-link" href="appointments.html">View schedule</a></div>
      <div class="card stat c-blue"><div class="stat-icon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div><div class="stat-val">${stats.unanswered_inquiries}</div><div class="stat-label">Unanswered Inquiries</div><a class="stat-link" href="inquiries.html">View inquiries</a></div>
      <div class="card stat c-purple"><div class="stat-icon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 003.4 0"/></svg></div><div class="stat-val">${stats.unread_notifications}</div><div class="stat-label">Unread Notifications</div><a class="stat-link" onclick="openClientNotifications()">View all</a></div>
    </div>
    <div class="grid grid-2" style="margin-bottom:18px;">
      <div class="card"><div class="card-head"><h3>Recent Service Requests</h3><a class="link-sm" href="requests.html">View All</a></div>
        <div>${recentRequests.length ? recentRequests.map(r => `
          <div style="display:flex; align-items:center; gap:12px; padding:14px 20px; border-bottom:1px solid #f0f3f1;">
            <div style="width:34px;height:34px;border-radius:9px;background:var(--blue-bg);color:var(--blue-fg);display:flex;align-items:center;justify-content:center; flex-shrink:0;"><i data-lucide="wrench" width="15" height="15"></i></div>
            <div style="flex:1; min-width:0;"><div class="cell-strong" style="font-size:13px;">${r.service_name}</div><div class="cell-muted">Request #${r.request_code||r.request_id}</div></div>
            ${badge(r.status)}
          </div>`).join('') : `<div class="empty-state">No requests yet.</div>`}
        </div>
      </div>
      <div class="card"><div class="card-head"><h3>Upcoming Appointment</h3><a class="link-sm" href="appointments.html">View All</a></div>
        <div class="card-pad">
        ${nextAppointment ? `
          <div class="cell-strong" style="font-size:14px; margin-bottom:8px;">${nextAppointment.service_name||''}</div>
          <div style="font-size:12.5px; color:var(--muted); display:flex; flex-direction:column; gap:6px; margin-bottom:10px;">
            <span><i data-lucide="calendar" width="13" height="13" style="vertical-align:-2px;"></i> ${fmtDate(nextAppointment.appointment_date)}</span>
            <span><i data-lucide="clock" width="13" height="13" style="vertical-align:-2px;"></i> ${fmtTime(nextAppointment.start_time)} - ${fmtTime(nextAppointment.end_time)}</span>
            <span><i data-lucide="map-pin" width="13" height="13" style="vertical-align:-2px;"></i> ${nextAppointment.location||'—'}</span>
          </div>
          ${nextAppointment.note ? `<div style="font-size:12.5px; background:var(--amber-bg); color:var(--amber-fg); padding:8px 10px; border-radius:8px; margin-bottom:10px;"><b>Note from admin:</b> ${nextAppointment.note}</div>` : ''}
          ${badge(nextAppointment.status)}
        ` : `<div class="empty-state" style="padding:20px;">No upcoming appointment.</div>`}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Our Services</h3><a class="link-sm" href="services.html">View All</a></div>
      <div class="services-grid">
        ${services.slice(0,4).map(s => `
          <a class="service-tile" href="requests.html?new=1&service=${s.service_id}">
            <div class="s-icon"><i data-lucide="${s.icon||'zap'}"></i></div>
            <h4>${s.service_name}</h4><p>${s.description||''}</p>
          </a>`).join('')}
      </div>
    </div>`;
  lucide.createIcons();
}

/* ================= SERVICES ================= */
async function initServicesPage() {
  await initClientPage();
  if (!CLIENT_USER) return;
  const services = await loadList(CLIENT_DEMO.services, '/services?active=true', 'client');
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Services</h1><p class="page-sub">Browse what we offer and request a service. Pricing is discussed directly with our team.</p></div></div>
    <div class="card"><div class="services-grid">
      ${services.map(s => `
        <div class="service-tile">
          <div class="s-icon"><i data-lucide="${s.icon||'zap'}"></i></div>
          <h4>${s.service_name}</h4><p>${s.description||''}</p>
          <a href="requests.html?new=1&service=${s.service_id}" class="btn btn-outline btn-sm" style="margin-top:12px; width:100%; display:block; text-align:center;">Request This</a>
        </div>`).join('') || `<div class="empty-state">No services available.</div>`}
    </div></div>
    <div class="feature-strip">
      <div class="feature-tile"><div class="f-icon"><i data-lucide="file-text" width="17" height="17"></i></div><div><h5>Easy Request</h5><p>Request electrical services in just a few steps.</p></div></div>
      <div class="feature-tile"><div class="f-icon"><i data-lucide="clock" width="17" height="17"></i></div><div><h5>Track Status</h5><p>Track your request status in real-time.</p></div></div>
      <div class="feature-tile"><div class="f-icon"><i data-lucide="shield-check" width="17" height="17"></i></div><div><h5>Secure &amp; Reliable</h5><p>Your data is safe and protected.</p></div></div>
    </div>`;
  lucide.createIcons();
}

/* ================= NEW REQUEST ================= */
async function openNewRequestModal(preselectServiceId) {
  const services = await loadList(CLIENT_DEMO.services, '/services?active=true', 'client');
  const blocks = await loadList(CLIENT_DEMO.scheduleBlocks, '/schedule-blocks', 'client');
  openModal(`
    <div class="modal-head"><h3>New Service Request</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <form id="newReqForm">
      <div class="modal-body">
        <div class="field"><label>Select Service</label><select id="nr_service" required>${services.map(s => `<option value="${s.service_id}" ${Number(preselectServiceId)===s.service_id?'selected':''}>${s.service_name}</option>`).join('')}</select></div>
        <div class="field"><label>Your comment / problem description</label><textarea id="nr_desc" rows="3" placeholder="Please describe the problem..." required></textarea></div>
        <div class="field"><label>Preferred Schedule</label><select id="nr_block"><option value="">No preference</option>${blocks.map(b => `<option value="${b.block_id}">${fmtDate(b.block_date)} • ${fmtTime(b.start_time)} - ${fmtTime(b.end_time)}</option>`).join('')}</select></div>
        <div class="field"><label>Service Address</label><input id="nr_address" value="${CLIENT_USER.address||''}" required/></div>
      </div>
      <div class="modal-foot"><button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Submit Request</button></div>
    </form>`);
  document.getElementById('newReqForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { service_id: Number(document.getElementById('nr_service').value), problem_description: document.getElementById('nr_desc').value, preferred_block_id: document.getElementById('nr_block').value || null, address: document.getElementById('nr_address').value };
    if (DEMO_MODE) { toast('Service request submitted (demo mode).'); closeModal(); return drawRequestsPage(); }
    try { await api('/service-requests', { method:'POST', body: JSON.stringify(payload) }, 'client'); toast('Service request submitted.'); closeModal(); drawRequestsPage(); }
    catch (err) { toast(err.message, true); }
  });
}

/* ================= SERVICE REQUESTS ================= */
let reqFilter = 'All';
async function initRequestsPage() {
  await initClientPage();
  if (!CLIENT_USER) return;
  await drawRequestsPage();
  const params = new URLSearchParams(window.location.search);
  if (params.get('new') === '1') openNewRequestModal(params.get('service'));
}
async function drawRequestsPage() {
  const requests = await loadList(CLIENT_DEMO.requests, `/service-requests${reqFilter!=='All' ? '?status='+reqFilter.toLowerCase() : ''}`, 'client');
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head">
      <div><h1 class="page-title">My Service Requests</h1><p class="page-sub">Track the status of your submitted requests</p></div>
      <button class="btn btn-yellow" onclick="openNewRequestModal()"><i data-lucide="plus" width="15" height="15"></i> New Request</button>
    </div>
    <div class="card">
      <div class="tabs">${['All','Pending','Approved','Completed','Cancelled'].map(t => `<button class="tab ${reqFilter===t?'active':''}" onclick="reqFilter='${t}'; drawRequestsPage();">${t}</button>`).join('')}</div>
      <div style="overflow-x:auto; margin-top:10px;"><table><thead><tr><th>Request ID</th><th>Service</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>
      ${requests.map(r => `
        <tr><td class="cell-strong">${r.request_code}</td><td>${r.service_name}</td><td class="cell-muted">${fmtDate(r.created_at)}</td><td>${badge(r.status)}</td>
        <td><button class="btn btn-outline btn-sm" onclick='viewRequestDetail(${JSON.stringify(r).replace(/'/g,"&#39;")})'>Details</button></td></tr>
      `).join('') || `<tr><td colspan="5" class="empty-state">No requests found.</td></tr>`}
      </tbody></table></div>
    </div>`;
  lucide.createIcons();
}
async function viewRequestDetail(r) {
  // Look up a matching appointment for this request so the admin's note is visible
  // regardless of the request's current status (pending, approved, etc).
  const appts = await loadList(CLIENT_DEMO.appointments, '/appointments', 'client');
  const matched = appts.find(a => a.request_id === r.request_id);
  openModal(`
    <div class="modal-head"><h3>${r.request_code}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">${badge(r.status)}<span class="cell-muted">${fmtDate(r.created_at)}</span></div>
      <div class="field"><label>Service</label><div class="cell-strong">${r.service_name}</div></div>
      <div class="field"><label>Your comment</label><div style="font-size:13px; color:var(--muted);">${r.problem_description||'—'}</div></div>
      <div class="field"><label>Preferred schedule</label><div>${r.block_date ? fmtDate(r.block_date)+' • '+fmtTime(r.start_time)+' - '+fmtTime(r.end_time) : 'No preference specified'}</div></div>
      <div class="field"><label>Address</label><div>${r.address||'—'}</div></div>
      ${matched && matched.note ? `<div class="field"><label>Note from admin</label><div style="font-size:13px; background:var(--amber-bg); color:var(--amber-fg); padding:9px 12px; border-radius:9px;">${matched.note}</div></div>` : ''}
      ${matched ? `<div class="field"><label>Scheduled appointment</label><div>${fmtDate(matched.appointment_date)} • ${fmtTime(matched.start_time)} - ${fmtTime(matched.end_time)} (${matched.status})</div></div>` : ''}
    </div>
    <div class="modal-foot"><button class="btn btn-outline" onclick="closeModal()">Close</button></div>`);
}

/* ================= APPOINTMENTS ================= */
async function initAppointmentsPage() {
  await initClientPage();
  if (!CLIENT_USER) return;
  const appts = await loadList(CLIENT_DEMO.appointments, '/appointments', 'client');
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Appointments</h1><p class="page-sub">Your confirmed and upcoming schedule</p></div></div>
    <div class="card">
      ${appts.length ? appts.map(a => `
        <div style="padding:16px 20px; border-bottom:1px solid #f0f3f1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><span class="cell-strong">${a.service_name||''}</span>${badge(a.status)}</div>
          <div style="font-size:12.5px; color:var(--muted); display:flex; flex-direction:column; gap:5px; margin-bottom:${a.note?'8px':'0'};">
            <span><i data-lucide="calendar" width="13" height="13" style="vertical-align:-2px;"></i> ${fmtDate(a.appointment_date)}</span>
            <span><i data-lucide="clock" width="13" height="13" style="vertical-align:-2px;"></i> ${fmtTime(a.start_time)} - ${fmtTime(a.end_time)}</span>
            <span><i data-lucide="map-pin" width="13" height="13" style="vertical-align:-2px;"></i> ${a.location||'—'}</span>
          </div>
          ${a.note ? `<div style="font-size:12.5px; background:var(--amber-bg); color:var(--amber-fg); padding:8px 10px; border-radius:8px;"><b>Note from admin:</b> ${a.note}</div>` : ''}
        </div>`).join('') : `<div class="empty-state">No appointments scheduled.</div>`}
    </div>`;
  lucide.createIcons();
}

/* ================= INQUIRIES ================= */
async function initInquiriesPage() {
  await initClientPage();
  if (!CLIENT_USER) return;
  await drawInquiriesPage();
}
async function drawInquiriesPage() {
  const inquiries = await loadList(CLIENT_DEMO.inquiries, '/inquiries', 'client');
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head">
      <div><h1 class="page-title">Inquiries</h1><p class="page-sub">Ask us anything about our services</p></div>
      <button class="btn btn-yellow" onclick="openNewInquiryModal()"><i data-lucide="plus" width="15" height="15"></i> New Inquiry</button>
    </div>
    <div class="card">
      ${inquiries.map(i => `
        <div style="padding:16px 20px; border-bottom:1px solid #f0f3f1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><span class="cell-strong">${i.subject}</span>${badge(i.status)}</div>
          <div class="cell-muted" style="margin-bottom:6px;">${fmtDate(i.created_at)}</div>
          <div style="font-size:13px; color:var(--ink); background:#f8faf8; padding:9px 12px; border-radius:9px; margin-bottom:${i.reply?'8px':'0'};">${i.message}</div>
          ${i.reply ? `<div style="font-size:13px; background:var(--green-bg); color:var(--green-fg); padding:9px 12px; border-radius:9px;"><b>Reply:</b> ${i.reply}</div>` : ''}
        </div>`).join('') || `<div class="empty-state">No inquiries yet.</div>`}
    </div>`;
  lucide.createIcons();
}
function openNewInquiryModal() {
  openModal(`
    <div class="modal-head"><h3>New Inquiry</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <form id="newInqForm">
      <div class="modal-body">
        <div class="field"><label>Subject</label><input id="ni_subject" placeholder="Enter subject..." required/></div>
        <div class="field"><label>Message</label><textarea id="ni_message" rows="4" placeholder="Type your message..." required></textarea></div>
      </div>
      <div class="modal-foot"><button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Send Inquiry</button></div>
    </form>`);
  document.getElementById('newInqForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { subject: document.getElementById('ni_subject').value, message: document.getElementById('ni_message').value };
    if (DEMO_MODE) { toast('Inquiry sent (demo mode).'); closeModal(); return drawInquiriesPage(); }
    try { await api('/inquiries', { method:'POST', body: JSON.stringify(payload) }, 'client'); toast('Inquiry sent.'); closeModal(); drawInquiriesPage(); }
    catch (err) { toast(err.message, true); }
  });
}

/* ================= PROFILE (editable by the client) ================= */
async function initProfilePage() {
  await initClientPage();
  if (!CLIENT_USER) return;
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Profile</h1><p class="page-sub">Your account information — keep it up to date</p></div></div>
    <div class="card card-pad" style="max-width:480px;">
      <div class="field"><label>Full name</label><input id="pf_name" value="${CLIENT_USER.full_name}"/></div>
      <div class="field"><label>Email</label><input value="${CLIENT_USER.email}" disabled/></div>
      <div class="field"><label>Phone number</label><input id="pf_phone" value="${CLIENT_USER.phone_number||''}"/></div>
      <div class="field"><label>Address</label><input id="pf_address" value="${CLIENT_USER.address||''}"/></div>
      <button class="btn btn-primary" onclick="saveProfile()">Save Changes</button>
    </div>`;
  lucide.createIcons();
}
async function saveProfile() {
  const payload = { full_name: document.getElementById('pf_name').value, phone_number: document.getElementById('pf_phone').value, address: document.getElementById('pf_address').value };
  if (DEMO_MODE) { Object.assign(CLIENT_USER, payload); toast('Profile updated (demo mode).'); return; }
  try {
    await api(`/users/${CLIENT_USER.user_id}`, { method:'PUT', body: JSON.stringify(payload) }, 'client');
    Object.assign(CLIENT_USER, payload);
    setSession('client', getToken('client'), CLIENT_USER);
    toast('Profile updated.');
  } catch (err) { toast(err.message, true); }
}

/* ================= SETTINGS (password) ================= */
async function initSettingsPage() {
  await initClientPage();
  if (!CLIENT_USER) return;
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="page-head"><div><h1 class="page-title">Settings</h1><p class="page-sub">Change your password</p></div></div>
    <div class="card card-pad" style="max-width:480px;">
      <div class="field"><label>New password</label><input id="set_password" type="password" placeholder="••••••••"/></div>
      <button class="btn btn-primary" onclick="savePassword()">Update Password</button>
    </div>`;
  lucide.createIcons();
}
async function savePassword() {
  const password = document.getElementById('set_password').value;
  if (!password || password.length < 6) { toast('Password must be at least 6 characters.', true); return; }
  if (DEMO_MODE) { toast('Password updated (demo mode).'); return; }
  try { await api(`/users/${CLIENT_USER.user_id}/password`, { method:'PUT', body: JSON.stringify({ password }) }, 'client'); toast('Password updated.'); }
  catch (err) { toast(err.message, true); }
}
