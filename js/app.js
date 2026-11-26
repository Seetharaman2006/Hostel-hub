// Hostel Hub — Core App Controller & Event Handlers

let db = loadData();
let session = { role: null, studentId: 'S101', page: 'dashboard', pollFilter: 'All', complaintFilter: 'All', roomFilter: 'All' };
let loginRole = 'student';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function getCurrentStudent() {
  return db.students.find(s => s.id === session.studentId) || db.students[0];
}

function showToast(msg) {
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>✓</span><span>${escapeHtml(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = '0.2s';
    setTimeout(() => el.remove(), 220);
  }, 2800);
}

// Auth & Session
function populateStudentLogin() {
  const sel = document.getElementById('loginStudentSelect');
  sel.innerHTML = db.students.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.room)} • ${escapeHtml(s.regNo)})</option>`).join('');
}

function selectLoginRole(role) {
  loginRole = role;
  document.getElementById('tabStudent').classList.toggle('active', role === 'student');
  document.getElementById('tabAdmin').classList.toggle('active', role === 'admin');
  document.getElementById('studentLoginFields').style.display = role === 'student' ? 'block' : 'none';
  document.getElementById('adminLoginFields').style.display = role === 'admin' ? 'block' : 'none';
  const nb = document.getElementById('newStudentBox'); if (nb) nb.style.display = role === 'student' ? 'block' : 'none';
}

function handleLogin(e) {
  e.preventDefault();
  if (loginRole === 'student') {
    session.role = 'student';
    session.studentId = document.getElementById('loginStudentSelect').value || db.students[0].id;
    session.page = 'dashboard';
    enterApp();
    showToast(`Welcome, ${getCurrentStudent().name}!`);
  } else {
    const pwd = document.getElementById('adminPassword').value.trim();
    if (pwd !== 'admin123' && pwd !== '') {
      showToast('Invalid password (default: admin123)');
      return;
    }
    session.role = 'admin';
    session.page = 'dashboard';
    enterApp();
    showToast('Signed in to Admin Portal');
  }
}

function enterApp() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appShell').classList.add('active');
  updateSidebarUser();
  renderNav();
  renderPage();
}

function logout() {
  session.role = null;
  document.getElementById('appShell').classList.remove('active');
  document.getElementById('authScreen').style.display = 'flex';
  populateStudentLogin();
  toggleSidebar(false);
}

function quickSwitchRole() {
  session.role = session.role === 'student' ? 'admin' : 'student';
  session.page = 'dashboard';
  updateSidebarUser();
  renderNav();
  renderPage();
  toggleSidebar(false);
  showToast(`Switched to ${session.role === 'admin' ? 'Admin / Warden' : 'Student'} Portal`);
}

function updateSidebarUser() {
  const pill = document.getElementById('rolePill');
  const avatar = document.getElementById('userAvatar');
  const nameEl = document.getElementById('userNameDisplay');
  const metaEl = document.getElementById('userMetaDisplay');

  if (session.role === 'admin') {
    pill.className = 'role-pill admin';
    pill.textContent = 'Admin / Warden Portal';
    avatar.textContent = 'AD';
    nameEl.textContent = 'Chief Warden';
    metaEl.textContent = 'Hostel Administration';
  } else {
    const st = getCurrentStudent();
    pill.className = 'role-pill student';
    pill.textContent = 'Student Portal';
    avatar.textContent = st.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    nameEl.textContent = st.name;
    metaEl.textContent = `${st.room} • ${st.regNo}`;
  }
}

function toggleSidebar(open) {
  document.getElementById('sidebar').classList.toggle('open', open);
  document.getElementById('sidebarOverlay').classList.toggle('open', open);
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeBtn').textContent = isDark ? '🌙 Dark' : '☀️ Light';
}

function resetAppData() {
  if (!confirm('Reset all polls, votes, complaints, outpasses, and notices to initial values?')) return;
  db = getDefaultData();
  saveData(db);
  renderNav();
  renderPage();
  showToast('Data reset complete');
}

// Navigation & Routing
function getNavItems() {
  const activePolls = db.polls.filter(p => p.status === 'Active').length;
  const openComplaints = db.complaints.filter(c => c.status !== 'Resolved').length;
  const pendingOutpasses = db.outpasses.filter(o => o.status === 'Pending').length;

  if (session.role === 'student') {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'rooms', label: 'Room Vacancies', icon: '🛏️', badge: db.rooms.reduce((s, r) => s + Math.max(0, r.capacity - r.occupied), 0) },
      { id: 'voting', label: 'Food & Snack Voting', icon: '🗳️', badge: activePolls },
      { id: 'menu', label: 'Mess Menu & Ratings', icon: '🍽️' },
      { id: 'complaints', label: 'Complaints & Repair', icon: '🛠️' },
      { id: 'outpass', label: 'Outpass & Leave', icon: '🪪' },
      { id: 'notices', label: 'Notices & Contacts', icon: '📢', badge: db.notices.length }
    ];
  } else {
    return [
      { id: 'dashboard', label: 'Admin Dashboard', icon: '📊' },
      { id: 'voting', label: 'Food Polls & Menu', icon: '🗳️', badge: activePolls },
      { id: 'complaints', label: 'Manage Complaints', icon: '🛠️', badge: openComplaints },
      { id: 'outpass', label: 'Outpass Approvals', icon: '🪪', badge: pendingOutpasses },
      { id: 'notices', label: 'Notice Board', icon: '📢' },
      { id: 'rooms', label: 'Room Vacancies', icon: '🛏️', badge: db.rooms.reduce((s, r) => s + Math.max(0, r.capacity - r.occupied), 0) },
      { id: 'students', label: 'Students Directory', icon: '👥', badge: db.students.length }
    ];
  }
}

function renderNav() {
  const items = getNavItems();
  document.getElementById('navList').innerHTML = items.map(item => `
    <button class="nav-item ${session.page === item.id ? 'active' : ''}" onclick="navigate('${item.id}')">
      <span>${item.icon}</span>
      <span>${item.label}</span>
      ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
    </button>
  `).join('');
}

function navigate(pageId) {
  session.page = pageId;
  renderNav();
  renderPage();
  toggleSidebar(false);
}

function renderPage() {
  const titleMap = {
    dashboard: session.role === 'admin' ? 'Admin Overview' : 'Student Dashboard',
    voting: session.role === 'admin' ? 'Food & Snack Polls Manager' : 'Food & Snacks Voting',
    menu: 'Weekly Mess Menu & Meal Ratings',
    complaints: session.role === 'admin' ? 'Complaint & Maintenance Desk' : 'Room Complaints & Repairs',
    outpass: session.role === 'admin' ? 'Outpass & Leave Approvals' : 'Outpass & Leave Requests',
    notices: session.role === 'admin' ? 'Hostel Notice Board' : 'Notices & Emergency Contacts',
    rooms: 'Room Vacancies & Auto-Allotment',
    students: 'Resident Directory'
  };
  document.getElementById('pageTitle').textContent = titleMap[session.page] || 'Hostel Hub';

  const main = document.getElementById('mainContent');
  if (session.role === 'student') {
    if (session.page === 'dashboard') main.innerHTML = renderStudentDashboard();
    else if (session.page === 'rooms') main.innerHTML = renderStudentRooms();
    else if (session.page === 'voting') main.innerHTML = renderStudentVoting();
    else if (session.page === 'menu') main.innerHTML = renderMessMenu();
    else if (session.page === 'complaints') main.innerHTML = renderStudentComplaints();
    else if (session.page === 'outpass') main.innerHTML = renderStudentOutpass();
    else if (session.page === 'notices') main.innerHTML = renderStudentNotices();
  } else {
    if (session.page === 'dashboard') main.innerHTML = renderAdminDashboard();
    else if (session.page === 'voting') main.innerHTML = renderAdminVoting();
    else if (session.page === 'complaints') main.innerHTML = renderAdminComplaints();
    else if (session.page === 'outpass') main.innerHTML = renderAdminOutpass();
    else if (session.page === 'notices') main.innerHTML = renderAdminNotices();
    else if (session.page === 'rooms') main.innerHTML = renderAdminRooms();
    else if (session.page === 'students') main.innerHTML = renderAdminStudents();
  }
}

// Filters & Voting
function setPollFilter(cat) {
  session.pollFilter = cat;
  renderPage();
}

function setComplaintFilter(f) {
  session.complaintFilter = f;
  renderPage();
}

function castVote(pollId, optionId) {
  const st = getCurrentStudent();
  const poll = db.polls.find(p => p.id === pollId);
  if (!poll || poll.status !== 'Active') return;
  poll.options.forEach(o => { o.votes = o.votes.filter(id => id !== st.id); });
  const chosen = poll.options.find(o => o.id === optionId);
  if (chosen) chosen.votes.push(st.id);
  saveData(db);
  renderPage();
  showToast(`Vote recorded for "${chosen.label}"`);
}

function openSuggestDishModal() {
  openModal('Suggest a Dish or Snack', `
    <form onsubmit="submitDishSuggestion(event)">
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select" id="sugCat"><option>Snacks</option><option>Breakfast</option><option>Lunch</option><option>Dinner</option></select>
      </div>
      <div class="form-group">
        <label class="form-label">Dish / Snack Name</label>
        <input type="text" class="form-input" id="sugDish" placeholder="e.g., Paneer Roll & Cold Coffee" required />
      </div>
      <button type="submit" class="btn btn-primary btn-full">Send to Mess Admin</button>
    </form>
  `);
}

function submitDishSuggestion(e) {
  e.preventDefault();
  const st = getCurrentStudent();
  db.dishSuggestions.unshift({
    id: 'DS' + Date.now().toString().slice(-4),
    studentName: st.name,
    room: st.room,
    dish: document.getElementById('sugDish').value.trim(),
    category: document.getElementById('sugCat').value,
    date: new Date().toISOString().slice(0, 10),
    status: 'Pending'
  });
  saveData(db);
  closeModal();
  showToast('Dish suggestion sent to Admin!');
}

function openCreatePollModal() {
  openModal('Create Food / Snack Voting Poll', `
    <form onsubmit="createPoll(event)">
      <div class="form-group">
        <label class="form-label">Poll Title</label>
        <input type="text" class="form-input" id="newPollTitle" placeholder="e.g., Saturday Evening Snack Vote" required />
      </div>
      <div class="grid-2" style="gap:10px;">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-select" id="newPollCat"><option>Snacks</option><option>Breakfast</option><option>Lunch</option><option>Dinner</option></select>
        </div>
        <div class="form-group">
          <label class="form-label">Closing Time</label>
          <input type="text" class="form-input" id="newPollClose" value="Today, 8:00 PM" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Food / Snack Options (one per line)</label>
        <textarea class="form-textarea" id="newPollOpts" rows="4" placeholder="Samosa & Chai&#10;Pav Bhaji&#10;Veg Sandwich & Juice" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Launch Poll</button>
    </form>
  `);
}

function createPoll(e) {
  e.preventDefault();
  const lines = document.getElementById('newPollOpts').value.split('\n').map(s => s.trim()).filter(Boolean);
  if (lines.length < 2) { showToast('Please enter at least 2 options'); return; }
  db.polls.unshift({
    id: 'P' + Date.now().toString().slice(-4),
    title: document.getElementById('newPollTitle').value.trim(),
    category: document.getElementById('newPollCat').value,
    closesAt: document.getElementById('newPollClose').value.trim(),
    status: 'Active',
    options: lines.map((label, idx) => ({ id: 'o' + Date.now() + idx, label, votes: [] }))
  });
  saveData(db);
  closeModal();
  renderNav();
  renderPage();
  showToast('New food poll published!');
}

function togglePollStatus(pollId) {
  const p = db.polls.find(x => x.id === pollId);
  if (!p) return;
  p.status = p.status === 'Active' ? 'Closed' : 'Active';
  saveData(db);
  renderNav();
  renderPage();
  showToast(`Poll ${p.status === 'Active' ? 'reopened' : 'closed'}`);
}

function deletePoll(pollId) {
  if (!confirm('Delete this poll?')) return;
  db.polls = db.polls.filter(p => p.id !== pollId);
  saveData(db);
  renderNav();
  renderPage();
  showToast('Poll deleted');
}

function applyWinnerToMenu(pollId) {
  const p = db.polls.find(x => x.id === pollId);
  if (!p) return;
  const winner = [...p.options].sort((a, b) => b.votes.length - a.votes.length)[0];
  const map = { Breakfast: 'breakfast', Lunch: 'lunch', Snacks: 'snacks', Dinner: 'dinner' };
  const key = map[p.category] || 'snacks';
  db.todayMenu[key].items = winner.label + ' (Student Voted Winner)';
  saveData(db);
  showToast(`Updated Today's ${p.category} to: ${winner.label}`);
}

function openEditMenuModal() {
  openModal("Edit Today's Mess Menu", `
    <form onsubmit="saveTodayMenu(event)">
      <div class="form-group"><label class="form-label">Breakfast</label><input class="form-input" id="mB" value="${escapeHtml(db.todayMenu.breakfast.items)}" required /></div>
      <div class="form-group"><label class="form-label">Lunch</label><input class="form-input" id="mL" value="${escapeHtml(db.todayMenu.lunch.items)}" required /></div>
      <div class="form-group"><label class="form-label">Evening Snacks</label><input class="form-input" id="mS" value="${escapeHtml(db.todayMenu.snacks.items)}" required /></div>
      <div class="form-group"><label class="form-label">Dinner</label><input class="form-input" id="mD" value="${escapeHtml(db.todayMenu.dinner.items)}" required /></div>
      <button type="submit" class="btn btn-primary btn-full">Save Menu</button>
    </form>
  `);
}

function saveTodayMenu(e) {
  e.preventDefault();
  db.todayMenu.breakfast.items = document.getElementById('mB').value.trim();
  db.todayMenu.lunch.items = document.getElementById('mL').value.trim();
  db.todayMenu.snacks.items = document.getElementById('mS').value.trim();
  db.todayMenu.dinner.items = document.getElementById('mD').value.trim();
  saveData(db);
  closeModal();
  showToast("Today's menu updated!");
}

function handleSuggestion(id, status) {
  const d = db.dishSuggestions.find(x => x.id === id);
  if (!d) return;
  d.status = status;
  saveData(db);
  renderPage();
  showToast(`Suggestion marked as ${status}`);
}

// Meal Ratings
function setRating(n) {
  document.getElementById('fbRating').value = n;
  document.querySelectorAll('#starContainer .star-btn').forEach((btn, idx) => btn.classList.toggle('active', idx < n));
}

function submitMealRating(e) {
  e.preventDefault();
  const st = getCurrentStudent();
  db.feedbacks.unshift({
    id: 'F' + Date.now().toString().slice(-4),
    studentName: st.name,
    meal: document.getElementById('fbMeal').value,
    rating: Number(document.getElementById('fbRating').value),
    comment: document.getElementById('fbComment').value.trim(),
    date: new Date().toISOString().slice(0, 10)
  });
  saveData(db);
  renderPage();
  showToast('Thank you for rating the meal!');
}

// Complaints
function submitComplaint(e) {
  e.preventDefault();
  const st = getCurrentStudent();
  db.complaints.unshift({
    id: 'C' + Math.floor(100 + Math.random() * 900),
    studentId: st.id,
    studentName: st.name,
    room: st.room,
    category: document.getElementById('compCat').value,
    priority: document.getElementById('compPriority').value,
    description: document.getElementById('compDesc').value.trim(),
    status: 'Pending',
    date: new Date().toISOString().slice(0, 10),
    remark: ''
  });
  saveData(db);
  renderPage();
  showToast('Complaint submitted to maintenance desk');
}

function updateComplaintStatus(id, status) {
  const c = db.complaints.find(x => x.id === id);
  if (!c) return;
  c.status = status;
  saveData(db);
  renderNav();
  renderPage();
  showToast(`Ticket #${id} marked as ${status}`);
}

function addComplaintRemark(id) {
  const c = db.complaints.find(x => x.id === id);
  if (!c) return;
  const note = prompt('Enter warden / technician remark:', c.remark || '');
  if (note === null) return;
  c.remark = note.trim();
  saveData(db);
  renderPage();
  showToast('Remark saved');
}

// Outpass
function submitOutpass(e) {
  e.preventDefault();
  const st = getCurrentStudent();
  db.outpasses.unshift({
    id: 'OP-' + Math.floor(1000 + Math.random() * 9000),
    studentId: st.id,
    studentName: st.name,
    room: st.room,
    type: document.getElementById('opType').value,
    destination: document.getElementById('opDest').value.trim(),
    from: document.getElementById('opFrom').value.replace('T', ' '),
    to: document.getElementById('opTo').value.replace('T', ' '),
    parentPhone: document.getElementById('opParent').value.trim(),
    reason: document.getElementById('opReason').value.trim(),
    status: 'Pending',
    adminNote: ''
  });
  saveData(db);
  renderPage();
  showToast('Outpass request submitted for approval');
}

function updateOutpassStatus(id, status) {
  const o = db.outpasses.find(x => x.id === id);
  if (!o) return;
  o.status = status;
  o.adminNote = status === 'Approved' ? 'Approved by Warden.' : 'Not approved — contact warden office.';
  saveData(db);
  renderNav();
  renderPage();
  showToast(`Outpass ${id} ${status}`);
}

// Notices
function publishNotice(e) {
  e.preventDefault();
  db.notices.unshift({
    id: 'N' + Date.now().toString().slice(-4),
    title: document.getElementById('notTitle').value.trim(),
    category: document.getElementById('notCat').value,
    urgent: document.getElementById('notUrgent').checked,
    content: document.getElementById('notBody').value.trim(),
    date: new Date().toISOString().slice(0, 10)
  });
  saveData(db);
  renderNav();
  renderPage();
  showToast('Notice published to all students');
}

function deleteNotice(id) {
  db.notices = db.notices.filter(n => n.id !== id);
  saveData(db);
  renderNav();
  renderPage();
  showToast('Notice removed');
}

// Students
function openAddStudentModal() {
  openModal('Add New Resident', `
    <form onsubmit="addStudent(event)">
      <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="stName" required /></div>
      <div class="grid-2" style="gap:10px;">
        <div class="form-group"><label class="form-label">Register No</label><input class="form-input" id="stReg" required /></div>
        <div class="form-group"><label class="form-label">Room No</label><input class="form-input" id="stRoom" placeholder="B-210" required /></div>
      </div>
      <div class="grid-2" style="gap:10px;">
        <div class="form-group"><label class="form-label">Block</label><input class="form-input" id="stBlock" value="Block B" required /></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="stPhone" placeholder="+91 98..." required /></div>
      </div>
      <div class="form-group"><label class="form-label">Mess Plan</label>
        <select class="form-select" id="stMess"><option>Veg</option><option>Veg + Special</option><option>Non-Veg</option></select>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Add Resident</button>
    </form>
  `);
}

function addStudent(e) {
  e.preventDefault();
  db.students.push({
    id: 'S' + Math.floor(200 + Math.random() * 800),
    name: document.getElementById('stName').value.trim(),
    regNo: document.getElementById('stReg').value.trim(),
    room: document.getElementById('stRoom').value.trim(),
    block: document.getElementById('stBlock').value.trim(),
    phone: document.getElementById('stPhone').value.trim(),
    messPlan: document.getElementById('stMess').value,
    feeStatus: 'Paid'
  });
  saveData(db);
  closeModal();
  renderNav();
  renderPage();
  showToast('Student added to hostel directory');
}

function toggleFeeStatus(id) {
  const s = db.students.find(x => x.id === id);
  if (!s) return;
  s.feeStatus = s.feeStatus === 'Paid' ? 'Pending' : 'Paid';
  saveData(db);
  renderPage();
  showToast(`${s.name}'s fee status updated to ${s.feeStatus}`);
}

// Modal helpers
function openModal(title, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalBackdrop').classList.add('open');
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
}

// Initialize
populateStudentLogin();


// ==================== ROOM VACANCIES & AUTO-ACCEPT ====================

function setRoomFilter(f) {
  session.roomFilter = f;
  renderPage();
}

function bookVacantRoom(roomNo) {
  const st = getCurrentStudent();
  const target = db.rooms.find(r => r.roomNo === roomNo);
  if (!target || target.occupied >= target.capacity) {
    showToast('Sorry, this room is already full.');
    return;
  }
  if (st.room === roomNo) {
    showToast('You are already allotted to this room.');
    return;
  }

  const oldRoomNo = st.room || 'Unassigned';

  if (db.autoAcceptRooms) {
    const oldRoom = db.rooms.find(r => r.roomNo === st.room);
    if (oldRoom && oldRoom.occupied > 0) oldRoom.occupied -= 1;
    target.occupied += 1;
    st.room = target.roomNo;
    st.block = target.block;

    db.roomBookings.unshift({
      id: 'RB-' + Math.floor(100 + Math.random() * 900),
      studentId: st.id,
      studentName: st.name,
      fromRoom: oldRoomNo,
      toRoom: target.roomNo,
      block: target.block,
      date: new Date().toISOString().slice(0, 10),
      status: 'Auto-Approved'
    });

    saveData(db);
    updateSidebarUser();
    renderNav();
    renderPage();
    showToast(`Room ${target.roomNo} automatically approved & allotted to you!`);
  } else {
    db.roomBookings.unshift({
      id: 'RB-' + Math.floor(100 + Math.random() * 900),
      studentId: st.id,
      studentName: st.name,
      fromRoom: oldRoomNo,
      toRoom: target.roomNo,
      block: target.block,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending'
    });
    saveData(db);
    renderPage();
    showToast(`Room ${target.roomNo} request submitted for warden approval.`);
  }
}

function toggleAutoAcceptRooms() {
  db.autoAcceptRooms = !db.autoAcceptRooms;
  saveData(db);
  renderPage();
  showToast(`Auto-Accept Room Requests turned ${db.autoAcceptRooms ? 'ON' : 'OFF'}`);
}

function approveRoomBooking(bookingId) {
  const b = db.roomBookings.find(x => x.id === bookingId);
  if (!b || b.status !== 'Pending') return;
  const st = db.students.find(s => s.id === b.studentId);
  const target = db.rooms.find(r => r.roomNo === b.toRoom);
  if (!st || !target || target.occupied >= target.capacity) {
    showToast('Room is no longer vacant.');
    return;
  }
  const oldRoom = db.rooms.find(r => r.roomNo === st.room);
  if (oldRoom && oldRoom.occupied > 0) oldRoom.occupied -= 1;
  target.occupied += 1;
  st.room = target.roomNo;
  st.block = target.block;
  b.status = 'Approved';
  saveData(db);
  renderNav();
  renderPage();
  showToast(`Approved Room ${target.roomNo} for ${st.name}`);
}

function openAddRoomModal() {
  openModal('Add New Hostel Room', `
    <form onsubmit="addRoom(event)">
      <div class="grid-2" style="gap:10px;">
        <div class="form-group"><label class="form-label">Room No</label><input class="form-input" id="nrNo" placeholder="B-401" required /></div>
        <div class="form-group"><label class="form-label">Block</label><input class="form-input" id="nrBlock" value="Block B" required /></div>
      </div>
      <div class="grid-2" style="gap:10px;">
        <div class="form-group"><label class="form-label">Floor</label><input class="form-input" id="nrFloor" value="4th Floor" required /></div>
        <div class="form-group"><label class="form-label">Type</label>
          <select class="form-select" id="nrType"><option>Single</option><option selected>2-Sharing</option><option>3-Sharing</option></select>
        </div>
      </div>
      <div class="grid-2" style="gap:10px;">
        <div class="form-group"><label class="form-label">Total Beds (Capacity)</label><input type="number" min="1" max="6" class="form-input" id="nrCap" value="2" required /></div>
        <div class="form-group"><label class="form-label">Monthly Rent</label><input class="form-input" id="nrRent" value="₹4,500 / mo" required /></div>
      </div>
      <div class="form-group">
        <label style="display:flex; align-items:center; gap:8px; font-size:0.88rem; font-weight:600; cursor:pointer;">
          <input type="checkbox" id="nrAc" /> Air Conditioned (AC)
        </label>
      </div>
      <div class="form-group"><label class="form-label">Amenities</label><input class="form-input" id="nrAmen" value="Wi-Fi, Study Desk, Attached Bath" required /></div>
      <button type="submit" class="btn btn-primary btn-full">Add Room</button>
    </form>
  `);
}

function addRoom(e) {
  e.preventDefault();
  db.rooms.push({
    id: 'R' + Date.now().toString().slice(-4),
    roomNo: document.getElementById('nrNo').value.trim(),
    block: document.getElementById('nrBlock').value.trim(),
    floor: document.getElementById('nrFloor').value.trim(),
    type: document.getElementById('nrType').value,
    capacity: Number(document.getElementById('nrCap').value),
    occupied: 0,
    rent: document.getElementById('nrRent').value.trim(),
    ac: document.getElementById('nrAc').checked,
    amenities: document.getElementById('nrAmen').value.trim()
  });
  saveData(db);
  closeModal();
  renderNav();
  renderPage();
  showToast('New vacant room added!');
}

function openRegisterStudentModal() {
  const vacantRooms = db.rooms.filter(r => r.occupied < r.capacity);
  openModal('New Student Sign-Up & Room Selection', `
    <form onsubmit="registerNewStudent(event)">
      <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="regName" placeholder="Your full name" required /></div>
      <div class="grid-2" style="gap:10px;">
        <div class="form-group"><label class="form-label">Register No</label><input class="form-input" id="regNo" placeholder="2024EEE150" required /></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="regPhone" placeholder="+91 98..." required /></div>
      </div>
      <div class="form-group">
        <label class="form-label">Choose a Vacant Room (Auto-Accepted)</label>
        <select class="form-select" id="regRoom" required>
          ${vacantRooms.map(r => `<option value="${r.roomNo}">Room ${escapeHtml(r.roomNo)} (${escapeHtml(r.block)} • ${escapeHtml(r.type)} • ${r.capacity - r.occupied} vacant • ${escapeHtml(r.rent)})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Mess Plan</label>
        <select class="form-select" id="regMess"><option>Veg</option><option selected>Veg + Special</option><option>Non-Veg</option></select>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Sign Up &amp; Auto-Accept Room →</button>
    </form>
  `);
}

function registerNewStudent(e) {
  e.preventDefault();
  const roomNo = document.getElementById('regRoom').value;
  const target = db.rooms.find(r => r.roomNo === roomNo);
  if (!target || target.occupied >= target.capacity) {
    showToast('Selected room is no longer available.');
    return;
  }

  const newId = 'S' + Math.floor(200 + Math.random() * 800);
  const newStudent = {
    id: newId,
    name: document.getElementById('regName').value.trim(),
    regNo: document.getElementById('regNo').value.trim(),
    room: target.roomNo,
    block: target.block,
    phone: document.getElementById('regPhone').value.trim(),
    messPlan: document.getElementById('regMess').value,
    feeStatus: 'Paid'
  };

  target.occupied += 1;
  db.students.push(newStudent);
  db.roomBookings.unshift({
    id: 'RB-' + Math.floor(100 + Math.random() * 900),
    studentId: newId,
    studentName: newStudent.name,
    fromRoom: 'New Admission',
    toRoom: target.roomNo,
    block: target.block,
    date: new Date().toISOString().slice(0, 10),
    status: 'Auto-Approved'
  });

  saveData(db);
  closeModal();
  session.role = 'student';
  session.studentId = newId;
  session.page = 'rooms';
  enterApp();
  showToast(`Welcome ${newStudent.name}! Room ${target.roomNo} was automatically accepted.`);
}
