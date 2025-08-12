// app.js — full UI-only dashboard logic (no backend calls)

// ------------------------- Sample state (replace when hooking backend) -------------------------
let sampleAlerts = [
  { id: 'a1', title: 'Malaria outbreak - Ward A', description: 'Cluster of fever cases reported', severity: 'high', lat: -6.8, lng: 39.2, locationName: 'Ward A', time: new Date().toISOString(), disease: 'malaria', read: false },
  { id: 'a2', title: 'Cholera alert - Riverbank', description: 'Suspected cholera cases near river', severity: 'high', lat: -6.75, lng: 39.25, locationName: 'Riverbank', time: new Date(Date.now()-3600*1000*8).toISOString(), disease: 'cholera', read: false },
  { id: 'a3', title: 'Vaccination drive', description: 'Community vaccination in Zone 3', severity: 'low', lat: -6.82, lng: 39.27, locationName: 'Zone 3', time: new Date(Date.now()-3600*1000*24).toISOString(), disease: 'vaccination', read: false },
  { id: 'a4', title: 'Rise in respiratory symptoms', description: 'Cough & fever reports increasing', severity: 'medium', lat: -6.78, lng: 39.21, locationName: 'Market Area', time: new Date(Date.now()-3600*1000*48).toISOString(), disease: 'respiratory', read: false }
];

let sampleFacilities = [
  { id: 'f1', name: 'Health Centre 1', lat: -6.79, lng: 39.22, phone: '+255 712 000001' },
  { id: 'f2', name: 'Clinic B', lat: -6.77, lng: 39.26, phone: '+255 712 000002' },
  { id: 'f3', name: 'Hospital Central', lat: -6.80, lng: 39.24, phone: '+255 712 000003' }
];

let sampleUsers = [
  { id: 'u1', name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { id: 'u2', name: 'Health Officer', email: 'officer@example.com', role: 'Editor' }
];

// ------------------------- Utilities -------------------------
const qs = (sel, ctx=document) => ctx.querySelector(sel);
const qsa = (sel, ctx=document) => Array.from((ctx || document).querySelectorAll(sel));

const KEY_DARK = 'pahwa_dark_v1';
const KEY_SIDEBAR = 'pahwa_sidebar_v1';

let map, facilityLayer, alertLayer, trendsChart, severityChart;
let sidebarCollapsed = localStorage.getItem(KEY_SIDEBAR) === 'true';

// ------------------------- Init -------------------------
function initUI(){
  applyDark(localStorage.getItem(KEY_DARK) === 'true');
  if (sidebarCollapsed) toggleSidebar(true);
  renderAlerts();
  renderUsersTable();
  renderStats();
  initMap();
  initCharts();
  updateAIInsights();
  populateNotifications();
  setupEventListeners();
}

document.addEventListener('DOMContentLoaded', initUI);

// ------------------------- Event wiring -------------------------
function setupEventListeners(){
  // Dark toggle
  if (qs('#darkModeToggle')){
    qs('#darkModeToggle').addEventListener('change', e => {
      applyDark(e.target.checked);
    });
  }

  // Sidebar collapse
  if (qs('#sidebarCollapse')){
    qs('#sidebarCollapse').addEventListener('click', () => {
      sidebarCollapsed = !sidebarCollapsed;
      localStorage.setItem(KEY_SIDEBAR, sidebarCollapsed);
      toggleSidebar(sidebarCollapsed);
    });
  }

  // Mobile toggle
  if (qs('#mobileMenuToggle')){
    qs('#mobileMenuToggle').addEventListener('click', () => {
      qs('.sidebar').classList.toggle('show');
    });
  }

  // Language selection (simple simulation)
  qsa('.lang-option').forEach(opt => {
    opt.addEventListener('click', e => {
      e.preventDefault();
      const lang = opt.dataset.lang;
      applyLang(lang);
    });
  });

  // Logout
  if (qs('#logoutBtn')) qs('#logoutBtn').addEventListener('click', e => {
    e.preventDefault();
    if (confirm('Are you sure you want to sign out?')){
      alert('Signed out (UI demo). Integrate backend logout endpoint to perform real logout.');
    }
  });

  // Alerts controls
  if (qs('#refreshAlerts')) qs('#refreshAlerts').addEventListener('click', () => {
    renderAlerts();
  });

  if (qs('#markAllRead')) qs('#markAllRead').addEventListener('click', () => {
    sampleAlerts.forEach(a => a.read = true);
    renderAlerts();
  });

  // Create alert form
  const createForm = qs('#createAlertForm');
  if (createForm){
    createForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const form = ev.target;
      const data = Object.fromEntries(new FormData(form).entries());
      const newAlert = {
        id: 'a' + (Date.now()),
        title: data.title,
        description: data.description,
        severity: data.severity,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
        locationName: data.locationName || '',
        disease: data.disease,
        time: new Date().toISOString(),
        read: false
      };
      sampleAlerts.push(newAlert);
      // close modal
      const modal = bootstrap.Modal.getInstance(qs('#createAlertModal'));
      modal.hide();
      renderAlerts();
      addAlertToMap(newAlert);
      updateCharts();
      updateAIInsights();
      toast('Alert created', 'success');
      form.reset();
    });
  }

  // Download report
  if (qs('#downloadReport')) qs('#downloadReport').addEventListener('click', downloadCSV);
  if (qs('#downloadReportFooter')) qs('#downloadReportFooter').addEventListener('click', downloadCSV);

  // Import data
  const importForm = qs('#importForm');
  if (importForm){
    importForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const file = qs('#importFile').files[0];
      if (!file) { toast('Choose a CSV file first', 'warning'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        // Very simple CSV parse: each row -> id,title,severity,disease,lat,lng,description
        const rows = text.split(/\r?\n/).map(r=>r.trim()).filter(Boolean);
        let added = 0;
        rows.forEach((r, idx) => {
          if (idx === 0 && /id/i.test(r.split(',')[0])) return; // skip header
          const cols = r.split(',');
          if (cols.length >= 7){
            const a = {
              id: 'imp' + Date.now() + idx,
              title: cols[1].trim() || 'Imported',
              severity: cols[2].trim() || 'low',
              disease: cols[3].trim() || 'unknown',
              lat: parseFloat(cols[4]) || -6.79,
              lng: parseFloat(cols[5]) || 39.23,
              description: cols[6].trim() || '',
              time: new Date().toISOString(),
              locationName: cols[0].trim() || 'Imported',
              read: false
            };
            sampleAlerts.push(a);
            added++;
          }
        });
        renderAlerts();
        updateCharts();
        updateAIInsights();
        toast(`${added} rows imported`, 'success');
        const modal = bootstrap.Modal.getInstance(qs('#importModal'));
        modal.hide();
      };
      reader.readAsText(file);
    });

    qs('#importFile').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) qs('#importPreview').textContent = `Selected: ${f.name} (${Math.round(f.size/1024)} KB)`;
      else qs('#importPreview').textContent = '';
    });
  }

  // Users: open add user form
  if (qs('#addUserBtn')){
    qs('#addUserBtn').addEventListener('click', () => {
      const form = qs('#userForm');
      form.reset();
      qs('#userFormTitle').textContent = 'Add User';
      const modal = new bootstrap.Modal(qs('#userFormModal'));
      modal.show();
    });
  }

  // Users form submit
  const userForm = qs('#userForm');
  if (userForm){
    userForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(userForm);
      const id = fd.get('id') || 'u' + Date.now();
      const user = { id, name: fd.get('name'), email: fd.get('email'), role: fd.get('role') || 'Viewer' };
      // if id exists update
      const idx = sampleUsers.findIndex(u => u.id === id);
      if (idx >= 0) sampleUsers[idx] = user;
      else sampleUsers.push(user);
      bootstrap.Modal.getInstance(qs('#userFormModal')).hide();
      renderUsersTable();
      toast('User saved', 'success');
    });
  }

  // Users table actions (delegation)
  document.addEventListener('click', (ev) => {
    const ubtn = ev.target.closest('.user-edit');
    if (ubtn){
      const id = ubtn.dataset.id;
      openEditUser(id);
    }
    const udel = ev.target.closest('.user-delete');
    if (udel){
      const id = udel.dataset.id;
      if (confirm('Delete user?')) {
        sampleUsers = sampleUsers.filter(u => u.id !== id);
        renderUsersTable();
        toast('User deleted', 'danger');
      }
    }
  });

  // Alerts delegation (mark read, view on map, open details, delete)
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.mark-read');
    if (btn){
      const id = btn.dataset.id;
      const a = sampleAlerts.find(x => x.id === id);
      if (a) a.read = !a.read;
      renderAlerts();
      return;
    }

    const viewBtn = ev.target.closest('.view-on-map');
    if (viewBtn){
      const id = viewBtn.dataset.id;
      const a = sampleAlerts.find(x => x.id === id);
      if (a && map){
        map.setView([a.lat, a.lng], 15);
      }
      return;
    }

    const detailBtn = ev.target.closest('.alert-detail');
    if (detailBtn){
      const id = detailBtn.dataset.id;
      openAlertDetail(id);
      return;
    }

    const delBtn = ev.target.closest('.alert-delete');
    if (delBtn){
      const id = delBtn.dataset.id;
      if (confirm('Delete alert?')){
        sampleAlerts = sampleAlerts.filter(x => x.id !== id);
        renderAlerts();
        updateCharts();
        toast('Alert deleted', 'danger');
      }
      return;
    }
  });

  // Change password form (UI-only)
  if (qs('#changePasswordForm')){
    qs('#changePasswordForm').addEventListener('submit', (ev) => {
      ev.preventDefault();
      bootstrap.Modal.getInstance(qs('#changePasswordModal')).hide();
      toast('Password change requested (UI-only)', 'success');
    });
  }

  // Settings save (UI-only)
  if (qs('#settingsForm')){
    qs('#settingsForm').addEventListener('submit', (ev) => {
      ev.preventDefault();
      bootstrap.Modal.getInstance(qs('#settingsModal')).hide();
      toast('Settings saved (UI-only)', 'success');
    });
  }
}

// ------------------------- Render helpers -------------------------
function renderAlerts(){
  const c = qs('#alertsContainer');
  c.innerHTML = '';
  // sort by severity then time
  const rank = { high: 3, medium: 2, low: 1 };
  const list = [...sampleAlerts].sort((b,a) => (rank[a.severity] - rank[b.severity]) || (new Date(a.time)-new Date(b.time)));

  list.forEach(a => {
    const div = document.createElement('div');
    div.className = `alert-card ${a.read ? '' : 'unread'}`;
    div.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <div style="flex:1;">
          <div class="d-flex align-items-baseline gap-2">
            <h6 class="mb-1" style="margin:0">${escapeHtml(a.title)}</h6>
            <span class="badge ${sevClass(a.severity)} small">${a.severity.toUpperCase()}</span>
            <small class="ms-2 small-muted">${escapeHtml(a.locationName || '')}</small>
          </div>
          <p class="mb-1 small text-muted">${escapeHtml(a.description)}</p>
          <div class="small text-muted">${timeAgo(new Date(a.time))} • ${new Date(a.time).toLocaleString()}</div>
        </div>
        <div class="text-end ms-3">
          <button class="btn btn-sm ${a.read ? 'btn-outline-secondary' : 'btn-outline-primary'} mt-1 mark-read" data-id="${a.id}">
            ${a.read ? '<i class="bi bi-check-circle"></i>' : '<i class="bi bi-check-circle-fill"></i>'} ${a.read ? 'Read' : 'Mark read'}
          </button>
          <div class="mt-2 d-flex flex-column">
            <button class="btn btn-sm btn-link alert-detail" data-id="${a.id}">Details</button>
            <button class="btn btn-sm btn-link view-on-map" data-id="${a.id}">View on map</button>
            <button class="btn btn-sm btn-link text-danger alert-delete" data-id="${a.id}">Delete</button>
          </div>
        </div>
      </div>
    `;
    c.appendChild(div);
  });

  renderStats();
  updateCharts();
}

// Users table
function renderUsersTable(){
  const container = qs('#usersTableContainer');
  let html = `<table class="table table-sm table-striped"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead><tbody>`;
  sampleUsers.forEach(u => {
    html += `<tr>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${escapeHtml(u.role)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary user-edit" data-id="${u.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger user-delete" data-id="${u.id}">Delete</button>
      </td>
    </tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

// open edit user
function openEditUser(id){
  const u = sampleUsers.find(x => x.id === id);
  if (!u) return;
  qs('#userFormTitle').textContent = 'Edit User';
  const f = qs('#userForm');
  f.elements['id'].value = u.id;
  f.elements['name'].value = u.name;
  f.elements['email'].value = u.email;
  f.elements['role'].value = u.role;
  const modal = new bootstrap.Modal(qs('#userFormModal'));
  modal.show();
}

// stats
function renderStats(){
  qs('#statReports').textContent = sampleAlerts.length;
  qs('#statHighRisk').textContent = sampleAlerts.filter(a=>a.severity==='high').length;
  qs('#statFacilities').textContent = sampleFacilities.length;
}

// ------------------------- Map -------------------------
function initMap(){
  map = L.map('map', { center: [-6.79, 39.23], zoom: 13, preferCanvas: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  facilityLayer = L.layerGroup().addTo(map);
  alertLayer = L.layerGroup().addTo(map);

  // Add facility markers
  sampleFacilities.forEach(f => {
    addFacilityToMap(f);
  });

  // Add alert circles
  sampleAlerts.forEach(a => addAlertToMap(a));
}

function addFacilityToMap(f){
  const m = L.marker([f.lat, f.lng]).addTo(facilityLayer);
  m.bindPopup(`<strong>${escapeHtml(f.name)}</strong><br/>Tel: ${escapeHtml(f.phone)}`);
  m.on('click', () => { map.setView([f.lat,f.lng], 15); });
}

function addAlertToMap(a){
  const color = a.severity === 'high' ? '#e53935' : a.severity === 'medium' ? '#ff9800' : '#0fb4b4';
  const c = L.circle([a.lat, a.lng], { radius: 200, color, fillColor: color, fillOpacity: 0.25 }).addTo(alertLayer);
  c.bindPopup(`<strong>${escapeHtml(a.title)}</strong><br/><small>${escapeHtml(a.locationName || '')}</small><br/><small>${timeAgo(new Date(a.time))}</small>`);
  c.on('click', () => map.setView([a.lat, a.lng], 15));
}

// ------------------------- Charts -------------------------
function initCharts(){
  // Trends chart (sample data last 14 days)
  const ctx = qs('#trendsChart').getContext('2d');
  const labels = [];
  for (let i = 13; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    labels.push(`${d.getMonth()+1}/${d.getDate()}`);
  }
  const data = {
    labels,
    datasets: [
      { label:'Malaria', data: labels.map(()=> Math.floor(Math.random()*20)+5), tension: 0.3, borderWidth: 2, fill:false },
      { label:'Cholera', data: labels.map(()=> Math.floor(Math.random()*8)+1), tension: 0.3, borderWidth: 2, fill:false },
      { label:'Respiratory', data: labels.map(()=> Math.floor(Math.random()*12)+2), tension: 0.3, borderWidth: 2, fill:false }
    ]
  };
  trendsChart = new Chart(ctx, { type:'line', data, options: { plugins:{legend:{position:'bottom'}}, interaction:{mode:'index',intersect:false}, scales:{x:{display:true}, y:{display:true,beginAtZero:true}}, maintainAspectRatio:false } });

  // Severity doughnut
  const sCtx = qs('#severityChart').getContext('2d');
  const severityCounts = getSeverityCounts();
  severityChart = new Chart(sCtx, {
    type: 'doughnut',
    data: {
      labels: ['High','Medium','Low'],
      datasets: [{ data: [severityCounts.high, severityCounts.medium, severityCounts.low] }]
    },
    options: { plugins:{legend:{position:'bottom'}}, maintainAspectRatio:false }
  });
}

// update charts after data change
function updateCharts(){
  if (!trendsChart) return;
  // For demo: randomize trends a bit
  trendsChart.data.datasets.forEach(ds => ds.data = ds.data.map(()=> Math.floor(Math.random()*20)+1));
  trendsChart.update();

  const counts = getSeverityCounts();
  severityChart.data.datasets[0].data = [counts.high, counts.medium, counts.low];
  severityChart.update();
}

function getSeverityCounts(){
  const counts = { high:0, medium:0, low:0 };
  sampleAlerts.forEach(a => { counts[a.severity] = (counts[a.severity]||0) + 1; });
  return counts;
}

// ------------------------- AI Insights (simulated) -------------------------
function updateAIInsights(){
  const counts = getSeverityCounts();
  const most = sampleAlerts.reduce((acc,a)=>{ acc[a.disease] = (acc[a.disease]||0)+1; return acc; },{});
  const top = Object.keys(most).sort((b,a)=>most[a]-most[b])[0] || 'general';
  qs('#aiInsights').innerHTML = `<strong>${escapeHtml(top.toUpperCase())} rising</strong> — Simulation: ${escapeHtml(top)} cases increased by <strong>${10 + counts.high*5}%</strong> in highlighted wards. <br/><small class="text-muted">Recommended: investigate clusters and start targeted testing/vaccination.</small>`;
}

// ------------------------- Notifications -------------------------
function populateNotifications(){
  const menu = qs('#notifMenu');
  menu.querySelectorAll('li:not(.dropdown-divider):not(.small)').forEach(n=>n.remove()); // clear items after header
  sampleAlerts.slice(0,5).forEach(a=>{
    const li = document.createElement('li');
    li.innerHTML = `<a class="dropdown-item" href="#">${escapeHtml(a.title)} <div class="small text-muted">${timeAgo(new Date(a.time))}</div></a>`;
    menu.appendChild(li);
  });
  qs('#notifCount').textContent = sampleAlerts.filter(s=>!s.read).length || '';
}

// ------------------------- Helpers -------------------------
function escapeHtml(txt=''){ return String(txt).replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s])); }
function sevClass(s){ if (s==='high') return 'badge bg-danger px-2 py-1'; if (s==='medium') return 'badge bg-warning text-dark px-2 py-1'; return 'badge bg-info text-dark px-2 py-1'; }
function timeAgo(d){
  const s = Math.floor((Date.now() - d.getTime())/1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function toggleSidebar(collapsed){
  const sidebar = qs('#mainSidebar');
  if (collapsed){
    sidebar.classList.add('collapsed');
    qs('.app-shell').style.marginLeft = 'var(--sidebar-collapsed)';
  } else {
    sidebar.classList.remove('collapsed');
    qs('.app-shell').style.marginLeft = 'var(--sidebar-width)';
  }
}

function applyDark(d){
  document.body.classList.toggle('dark', !!d);
  if (qs('#darkModeToggle')) qs('#darkModeToggle').checked = !!d;
  localStorage.setItem(KEY_DARK, !!d);
}

function applyLang(lang){
  // Very small demo: only updates a label
  qs('#currentLangLabel').textContent = lang === 'sw' ? 'Kiswahili' : lang === 'fr' ? 'Français' : 'English';
  document.documentElement.lang = lang;
}

// CSV download
function downloadCSV(){
  const rows = [['id','title','severity','disease','lat','lng','time']];
  sampleAlerts.forEach(a => rows.push([a.id,a.title,a.severity,a.disease,a.lat,a.lng,a.time]));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'pahwa-report.csv'; a.click();
  URL.revokeObjectURL(url);
  toast('CSV downloaded', 'success');
}

// Simple toast helper (bootstrap)
function toast(message, type='info'){
  const el = document.createElement('div');
  el.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'info'} border-0`;
  el.role = 'alert';
  el.ariaLive = 'assertive';
  el.ariaAtomic = 'true';
  el.style.position = 'fixed';
  el.style.right = '20px';
  el.style.bottom = (20 + document.querySelectorAll('.toast').length*60) + 'px';
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${escapeHtml(message)}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  document.body.appendChild(el);
  const bt = new bootstrap.Toast(el, { delay: 3000 });
  bt.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}

// Alert detail (modal-like)
function openAlertDetail(id){
  const a = sampleAlerts.find(x=>x.id===id);
  if (!a) return;
  // create small modal-like overlay (Bootstrap modal could be used but dynamic)
  const html = `
    <div class="modal fade" id="alertDetailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${escapeHtml(a.title)}</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p><strong>Severity:</strong> <span class="${sevClass(a.severity)}">${a.severity}</span></p>
            <p><strong>Location:</strong> ${escapeHtml(a.locationName || '')} (${a.lat}, ${a.lng})</p>
            <p><strong>Disease/type:</strong> ${escapeHtml(a.disease)}</p>
            <p>${escapeHtml(a.description)}</p>
            <p class="small text-muted">${new Date(a.time).toLocaleString()}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
            <button class="btn btn-sm btn-primary view-on-map" data-id="${a.id}">View on map</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  const modalEl = qs('#alertDetailModal', wrapper);
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
  modalEl.addEventListener('hidden.bs.modal', () => wrapper.remove());
}

//Footer Effect!
// Dashboard metadata
const APP_VERSION = "1.2.3";

// Apply version
document.getElementById('appVersion').textContent = APP_VERSION;

// Apply year
document.getElementById('currentYear').textContent = new Date().getFullYear();


// ------------------------- Coded By Mr Buffett -------------------------
