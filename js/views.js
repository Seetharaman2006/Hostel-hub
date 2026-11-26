// Hostel Hub — Student & Admin View Templates

function statusBadgeClass(status) {
  if (status === 'Approved' || status === 'Auto-Approved' || status === 'Resolved') return 'badge-success';
  if (status === 'In Progress') return 'badge-info';
  if (status === 'Rejected' || status === 'Dismissed') return 'badge-danger';
  return 'badge-warning';
}

// ==================== STUDENT VIEWS ====================

function renderStudentDashboard() {
  const st = getCurrentStudent();
  const activePolls = db.polls.filter(p => p.status === 'Active');
  const myComplaints = db.complaints.filter(c => c.studentId === st.id);
  const myOutpasses = db.outpasses.filter(o => o.studentId === st.id);
  const votedCount = activePolls.filter(p => p.options.some(o => o.votes.includes(st.id))).length;

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div>
          <div class="stat-label">Room &amp; Mess Plan</div>
          <div class="stat-value">${escapeHtml(st.room)}</div>
          <div class="stat-sub">${escapeHtml(st.block)} • ${escapeHtml(st.messPlan)}</div>
        </div>
        <div class="stat-icon" style="background:var(--primary-soft); color:var(--primary);">🏠</div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">Active Food Polls</div>
          <div class="stat-value">${activePolls.length}</div>
          <div class="stat-sub">You voted in ${votedCount}/${activePolls.length}</div>
        </div>
        <div class="stat-icon" style="background:var(--warning-soft); color:var(--warning);">🗳️</div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">My Complaints</div>
          <div class="stat-value">${myComplaints.filter(c => c.status !== 'Resolved').length}</div>
          <div class="stat-sub">${myComplaints.length} total submitted</div>
        </div>
        <div class="stat-icon" style="background:var(--danger-soft); color:var(--danger);">🛠️</div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">Hostel Fee Status</div>
          <div class="stat-value" style="color:${st.feeStatus === 'Paid' ? 'var(--success)' : 'var(--warning)'};">${escapeHtml(st.feeStatus)}</div>
          <div class="stat-sub">${myOutpasses.filter(o => o.status === 'Approved').length} approved outpass</div>
        </div>
        <div class="stat-icon" style="background:var(--success-soft); color:var(--success);">💳</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">🍽️ Today's Confirmed Mess Menu</div>
        <button class="btn btn-primary btn-sm" onclick="navigate('voting')">Vote for Tomorrow's Food →</button>
      </div>
      <div class="meal-grid">
        ${['breakfast', 'lunch', 'snacks', 'dinner'].map(key => {
          const m = db.todayMenu[key];
          const labels = { breakfast: '☕ Breakfast', lunch: '🍛 Lunch', snacks: '🥟 Evening Snacks', dinner: '🍲 Dinner' };
          return `
            <div class="meal-box">
              <div class="meal-time">${escapeHtml(m.time)}</div>
              <div class="meal-name">${labels[key]}</div>
              <div class="meal-items">${escapeHtml(m.items)}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="grid-2">
      <div class="card" style="margin-bottom:0;">
        <div class="card-header">
          <div class="card-title">🔥 Live Food &amp; Snack Polls</div>
          <button class="btn btn-secondary btn-sm" onclick="navigate('voting')">View All</button>
        </div>
        <div class="list-stack">
          ${activePolls.slice(0, 2).map(p => renderPollSummaryMini(p, st.id)).join('') || '<div class="empty-state">No active polls right now.</div>'}
        </div>
      </div>

      <div class="card" style="margin-bottom:0;">
        <div class="card-header">
          <div class="card-title">📢 Latest Hostel Notices</div>
          <button class="btn btn-secondary btn-sm" onclick="navigate('notices')">View All</button>
        </div>
        <div class="list-stack">
          ${db.notices.slice(0, 3).map(n => `
            <div class="list-item" style="padding:12px 14px;">
              <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
                  <strong style="font-size:0.92rem;">${escapeHtml(n.title)}</strong>
                  ${n.urgent ? '<span class="badge badge-danger">Urgent</span>' : `<span class="badge badge-info">${escapeHtml(n.category)}</span>`}
                </div>
                <p style="font-size:0.84rem; color:var(--text-muted);">${escapeHtml(n.content)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderPollSummaryMini(poll, studentId) {
  const total = poll.options.reduce((a, o) => a + o.votes.length, 0);
  const userVoted = poll.options.find(o => o.votes.includes(studentId));
  const leader = [...poll.options].sort((a, b) => b.votes.length - a.votes.length)[0];
  return `
    <div class="list-item" style="padding:13px 15px;">
      <div style="flex:1;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
          <strong>${escapeHtml(poll.title)}</strong>
          <span class="badge badge-primary">${escapeHtml(poll.category)}</span>
        </div>
        <div style="font-size:0.82rem; color:var(--text-muted);">
          Leading: <strong>${escapeHtml(leader.label)}</strong> (${total} total votes)
        </div>
        <div style="font-size:0.78rem; margin-top:4px; color:${userVoted ? 'var(--success)' : 'var(--warning)'}; font-weight:600;">
          ${userVoted ? `✓ You voted: ${escapeHtml(userVoted.label)}` : "• You haven't voted yet"}
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="navigate('voting')">${userVoted ? 'Change' : 'Vote'}</button>
    </div>
  `;
}

function renderStudentVoting() {
  const st = getCurrentStudent();
  const cats = ['All', 'Snacks', 'Breakfast', 'Lunch', 'Dinner'];
  const filtered = db.polls.filter(p => session.pollFilter === 'All' || p.category === session.pollFilter);

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
      <div class="filter-row" style="margin-bottom:0;">
        ${cats.map(c => `<button class="filter-pill ${session.pollFilter === c ? 'active' : ''}" onclick="setPollFilter('${c}')">${c}</button>`).join('')}
      </div>
      <button class="btn btn-primary" onclick="openSuggestDishModal()">✨ Suggest a Dish / Snack</button>
    </div>

    <div class="grid-2">
      ${filtered.map(poll => renderPollCard(poll, st.id, false)).join('') || '<div class="card empty-state">No polls in this category.</div>'}
    </div>
  `;
}

function renderPollCard(poll, studentId, isAdmin) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  const maxVotes = Math.max(...poll.options.map(o => o.votes.length), 0);
  const isClosed = poll.status !== 'Active';

  return `
    <div class="poll-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
        <div>
          <div style="display:flex; gap:7px; align-items:center; flex-wrap:wrap; margin-bottom:6px;">
            <span class="badge ${poll.category === 'Snacks' ? 'badge-warning' : 'badge-primary'}">${escapeHtml(poll.category)}</span>
            <span class="badge ${isClosed ? 'badge-neutral' : 'badge-success'}">${isClosed ? 'Closed' : 'Live Voting'}</span>
          </div>
          <h3 style="font-size:1.05rem; font-weight:700;">${escapeHtml(poll.title)}</h3>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">Closes: ${escapeHtml(poll.closesAt)} • ${totalVotes} vote${totalVotes === 1 ? '' : 's'}</div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px;">
        ${poll.options.map(opt => {
          const count = opt.votes.length;
          const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
          const isVoted = !isAdmin && opt.votes.includes(studentId);
          const isLeader = maxVotes > 0 && count === maxVotes;
          const clickAttr = (!isAdmin && !isClosed) ? `onclick="castVote('${poll.id}', '${opt.id}')"` : '';
          return `
            <div class="poll-option ${isVoted ? 'voted' : ''} ${(isAdmin || isClosed) ? 'disabled' : ''}" ${clickAttr}>
              <div class="poll-opt-top">
                <span>${isVoted ? '✓ ' : ''}${escapeHtml(opt.label)} ${isLeader ? '<span class="badge badge-success" style="margin-left:6px; font-size:0.7rem;">Leading</span>' : ''}</span>
                <span style="font-size:0.84rem; color:var(--text-muted);">${pct}% (${count})</span>
              </div>
              <div class="poll-bar-bg">
                <div class="poll-bar-fill ${isLeader ? 'winner' : ''}" style="width:${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      ${isAdmin ? `
        <div style="display:flex; gap:8px; flex-wrap:wrap; padding-top:8px; border-top:1px solid var(--border);">
          <button class="btn btn-success btn-sm" onclick="applyWinnerToMenu('${poll.id}')">✓ Set Winner to Today's Menu</button>
          <button class="btn btn-secondary btn-sm" onclick="togglePollStatus('${poll.id}')">${isClosed ? 'Reopen Poll' : 'Close Poll'}</button>
          <button class="btn btn-danger btn-sm" onclick="deletePoll('${poll.id}')">Delete</button>
        </div>
      ` : `
        <div style="font-size:0.79rem; color:var(--text-muted);">
          ${isClosed ? 'Voting has ended for this poll.' : 'Click any option above to cast or update your vote.'}
        </div>
      `}
    </div>
  `;
}

function renderMessMenu() {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">📅 Weekly Mess Timetable</div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Day</th><th>Breakfast</th><th>Lunch</th><th>Evening Snacks</th><th>Dinner</th></tr>
          </thead>
          <tbody>
            ${db.weeklyMenu.map(r => `
              <tr>
                <td><strong>${escapeHtml(r.day)}</strong></td>
                <td>${escapeHtml(r.breakfast)}</td>
                <td>${escapeHtml(r.lunch)}</td>
                <td><span class="badge badge-warning">${escapeHtml(r.snacks)}</span></td>
                <td>${escapeHtml(r.dinner)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">⭐ Rate Today's Meal</div></div>
        <form onsubmit="submitMealRating(event)">
          <div class="form-group">
            <label class="form-label">Meal</label>
            <select class="form-select" id="fbMeal">
              <option>Breakfast</option><option>Lunch</option><option>Snacks</option><option>Dinner</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Rating</label>
            <input type="hidden" id="fbRating" value="5" />
            <div class="stars" id="starContainer">
              ${[1, 2, 3, 4, 5].map(n => `<button type="button" class="star-btn active" onclick="setRating(${n})">★</button>`).join('')}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Feedback Comment</label>
            <textarea class="form-textarea" id="fbComment" placeholder="Taste, hygiene, quantity..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Submit Feedback</button>
        </form>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">💬 Recent Student Meal Reviews</div></div>
        <div class="list-stack">
          ${db.feedbacks.map(f => `
            <div class="list-item" style="padding:12px 14px;">
              <div>
                <div style="display:flex; gap:8px; align-items:center; margin-bottom:4px;">
                  <strong>${escapeHtml(f.studentName)}</strong>
                  <span class="badge badge-primary">${escapeHtml(f.meal)}</span>
                  <span style="color:#f59e0b; font-weight:700;">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span>
                </div>
                <div style="font-size:0.86rem; color:var(--text-muted);">${escapeHtml(f.comment)}</div>
              </div>
              <span style="font-size:0.76rem; color:var(--text-muted);">${escapeHtml(f.date)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderStudentComplaints() {
  const st = getCurrentStudent();
  const mine = db.complaints.filter(c => c.studentId === st.id);
  return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">🛠️ Raise a Complaint / Repair Request</div></div>
        <form onsubmit="submitComplaint(event)">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" id="compCat">
              <option>Electrical</option><option>Plumbing</option><option>Wi-Fi / Network</option><option>Housekeeping</option><option>Furniture</option><option>Mess Quality</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select class="form-select" id="compPriority">
              <option>Low</option><option selected>Medium</option><option>High</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Describe the Issue</label>
            <textarea class="form-textarea" id="compDesc" placeholder="e.g., Study lamp flickering in Room ${escapeHtml(st.room)}..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Submit Complaint</button>
        </form>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">📋 My Complaint History (${mine.length})</div></div>
        <div class="list-stack">
          ${mine.map(c => `
            <div class="list-item">
              <div style="flex:1;">
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:5px;">
                  <strong>${escapeHtml(c.category)}</strong>
                  <span class="badge ${statusBadgeClass(c.status)}">${escapeHtml(c.status)}</span>
                  <span class="badge ${c.priority === 'High' ? 'badge-danger' : 'badge-neutral'}">${escapeHtml(c.priority)}</span>
                </div>
                <p style="font-size:0.88rem; margin-bottom:5px;">${escapeHtml(c.description)}</p>
                ${c.remark ? `<div style="font-size:0.8rem; color:var(--primary); font-weight:600;">Warden Note: ${escapeHtml(c.remark)}</div>` : ''}
                <div style="font-size:0.76rem; color:var(--text-muted); margin-top:4px;">Logged on ${escapeHtml(c.date)} • Ticket #${escapeHtml(c.id)}</div>
              </div>
            </div>
          `).join('') || '<div class="empty-state">No complaints filed yet.</div>'}
        </div>
      </div>
    </div>
  `;
}

function renderStudentOutpass() {
  const st = getCurrentStudent();
  const mine = db.outpasses.filter(o => o.studentId === st.id);
  return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">🪪 Request Outpass / Leave</div></div>
        <form onsubmit="submitOutpass(event)">
          <div class="form-group">
            <label class="form-label">Pass Type</label>
            <select class="form-select" id="opType">
              <option>Day Outpass</option><option>Weekend Home Leave</option><option>Medical Leave</option><option>Emergency Leave</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Destination</label>
            <input type="text" class="form-input" id="opDest" placeholder="City / Local Address" required />
          </div>
          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Leaving Date &amp; Time</label>
              <input type="datetime-local" class="form-input" id="opFrom" required />
            </div>
            <div class="form-group">
              <label class="form-label">Return Date &amp; Time</label>
              <input type="datetime-local" class="form-input" id="opTo" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Parent / Guardian Contact</label>
            <input type="text" class="form-input" id="opParent" placeholder="+91 98XXX XXXXX" required />
          </div>
          <div class="form-group">
            <label class="form-label">Reason</label>
            <textarea class="form-textarea" id="opReason" placeholder="Brief reason for leave..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Apply for Outpass</button>
        </form>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🎟️ My Outpass Requests</div></div>
        <div class="list-stack">
          ${mine.map(o => `
            <div class="list-item" style="flex-direction:column; align-items:stretch;">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                <strong>${escapeHtml(o.type)} — ${escapeHtml(o.destination)}</strong>
                <span class="badge ${statusBadgeClass(o.status)}">${escapeHtml(o.status)}</span>
              </div>
              <div style="font-size:0.84rem; color:var(--text-muted);">
                ${escapeHtml(o.from)} → ${escapeHtml(o.to)}<br/>
                Reason: ${escapeHtml(o.reason)}
              </div>
              ${o.status === 'Approved' ? `
                <div class="digital-pass">
                  <div>
                    <div style="font-size:0.72rem; opacity:0.85; text-transform:uppercase; letter-spacing:0.06em;">Verified Digital Gate Pass</div>
                    <div style="font-weight:800; font-size:1.05rem;">${escapeHtml(o.id)} • ${escapeHtml(st.name)} (${escapeHtml(st.room)})</div>
                  </div>
                  <div style="background:rgba(255,255,255,0.2); padding:6px 12px; border-radius:8px; font-weight:700; font-size:0.82rem;">SHOW AT GATE</div>
                </div>
              ` : ''}
              ${o.adminNote ? `<div style="font-size:0.8rem; color:var(--primary); font-weight:600;">Warden Note: ${escapeHtml(o.adminNote)}</div>` : ''}
            </div>
          `).join('') || '<div class="empty-state">No outpass requests yet.</div>'}
        </div>
      </div>
    </div>
  `;
}

function renderStudentNotices() {
  return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">📢 Hostel Announcements</div></div>
        <div class="list-stack">
          ${db.notices.map(n => `
            <div class="list-item">
              <div>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:5px;">
                  <strong>${escapeHtml(n.title)}</strong>
                  ${n.urgent ? '<span class="badge badge-danger">Urgent</span>' : `<span class="badge badge-info">${escapeHtml(n.category)}</span>`}
                </div>
                <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:6px;">${escapeHtml(n.content)}</p>
                <div style="font-size:0.76rem; color:var(--text-muted);">Posted on ${escapeHtml(n.date)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">🚨 Emergency &amp; Hostel Contacts</div></div>
        <div class="list-stack">
          ${[
            ['Chief Warden', 'Dr. R. Subramanian', '+91 94440 10001', '24/7 Emergency'],
            ['Deputy Warden (Block B)', 'Mr. S. Venkatesh', '+91 94440 10002', 'Hostel Office'],
            ['Campus Medical / Ambulance', 'Health Center', '+91 44 2680 1108', 'Emergency'],
            ['Hostel Security Gate', 'Main Security Desk', '+91 94440 10099', 'Gate Pass'],
            ['Electrician & Plumber', 'Maintenance Desk', '+91 94440 10055', '8 AM – 8 PM'],
            ['Mess Supervisor', 'Mr. K. Murugan', '+91 94440 10077', 'Mess Hall']
          ].map(c => `
            <div class="list-item" style="padding:12px 15px;">
              <div>
                <strong>${c[0]}</strong>
                <div style="font-size:0.83rem; color:var(--text-muted);">${c[1]} • ${c[3]}</div>
              </div>
              <span class="badge badge-primary">${c[2]}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ==================== ADMIN VIEWS ====================

function renderAdminDashboard() {
  const totalVotes = db.polls.reduce((s, p) => s + p.options.reduce((a, o) => a + o.votes.length, 0), 0);
  const openComplaints = db.complaints.filter(c => c.status !== 'Resolved').length;
  const pendingOutpasses = db.outpasses.filter(o => o.status === 'Pending').length;
  const pendingFees = db.students.filter(s => s.feeStatus !== 'Paid').length;

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div>
          <div class="stat-label">Total Residents</div>
          <div class="stat-value">${db.students.length}</div>
          <div class="stat-sub">${pendingFees} fee pending</div>
        </div>
        <div class="stat-icon" style="background:var(--primary-soft); color:var(--primary);">👥</div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">Food &amp; Snack Votes</div>
          <div class="stat-value">${totalVotes}</div>
          <div class="stat-sub">${db.polls.filter(p => p.status === 'Active').length} active polls</div>
        </div>
        <div class="stat-icon" style="background:var(--success-soft); color:var(--success);">🗳️</div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">Open Complaints</div>
          <div class="stat-value">${openComplaints}</div>
          <div class="stat-sub">${db.complaints.length} total tickets</div>
        </div>
        <div class="stat-icon" style="background:var(--danger-soft); color:var(--danger);">🛠️</div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">Pending Outpasses</div>
          <div class="stat-value">${pendingOutpasses}</div>
          <div class="stat-sub">Awaiting approval</div>
        </div>
        <div class="stat-icon" style="background:var(--warning-soft); color:var(--warning);">🪪</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">🏆 Live Food Voting Leaders</div>
          <button class="btn btn-primary btn-sm" onclick="navigate('voting')">Manage Polls</button>
        </div>
        <div class="list-stack">
          ${db.polls.map(p => {
            const sorted = [...p.options].sort((a, b) => b.votes.length - a.votes.length);
            const total = p.options.reduce((a, o) => a + o.votes.length, 0);
            const top = sorted[0];
            return `
              <div class="list-item" style="padding:13px 15px;">
                <div>
                  <div style="display:flex; gap:8px; align-items:center; margin-bottom:4px;">
                    <strong>${escapeHtml(p.title)}</strong>
                    <span class="badge badge-warning">${escapeHtml(p.category)}</span>
                  </div>
                  <div style="font-size:0.85rem; color:var(--success); font-weight:600;">
                    Winner: ${escapeHtml(top.label)} (${top.votes.length}/${total} votes)
                  </div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="applyWinnerToMenu('${p.id}')">Apply to Menu</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">⚡ Pending Actions</div>
        </div>
        <div class="list-stack">
          ${db.outpasses.filter(o => o.status === 'Pending').map(o => `
            <div class="list-item" style="padding:12px 14px;">
              <div>
                <strong>Outpass: ${escapeHtml(o.studentName)} (${escapeHtml(o.room)})</strong>
                <div style="font-size:0.83rem; color:var(--text-muted);">${escapeHtml(o.type)} → ${escapeHtml(o.destination)}</div>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-success btn-sm" onclick="updateOutpassStatus('${o.id}', 'Approved')">Approve</button>
                <button class="btn btn-danger btn-sm" onclick="updateOutpassStatus('${o.id}', 'Rejected')">Reject</button>
              </div>
            </div>
          `).join('')}
          ${db.dishSuggestions.filter(d => d.status === 'Pending').map(d => `
            <div class="list-item" style="padding:12px 14px;">
              <div>
                <strong>Dish Suggestion (${escapeHtml(d.category)})</strong>
                <div style="font-size:0.83rem; color:var(--text-muted);">"${escapeHtml(d.dish)}" — by ${escapeHtml(d.studentName)}</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="navigate('voting')">Review</button>
            </div>
          `).join('')}
          ${pendingOutpasses === 0 && db.dishSuggestions.filter(d => d.status === 'Pending').length === 0 ? '<div class="empty-state">All caught up! No pending approvals.</div>' : ''}
        </div>
      </div>
    </div>
  `;
}

function renderAdminVoting() {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
      <div style="font-size:0.92rem; color:var(--text-muted);">Create food &amp; snack polls, monitor live student votes, and update today's menu in one click.</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="openEditMenuModal()">🍽️ Edit Today's Menu</button>
        <button class="btn btn-primary" onclick="openCreatePollModal()">+ Create New Food Poll</button>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:22px;">
      ${db.polls.map(poll => renderPollCard(poll, null, true)).join('') || '<div class="card empty-state">No polls created yet.</div>'}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">💡 Student Dish &amp; Snack Suggestions</div>
      </div>
      <div class="list-stack">
        ${db.dishSuggestions.map(d => `
          <div class="list-item">
            <div>
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:4px;">
                <strong>${escapeHtml(d.dish)}</strong>
                <span class="badge badge-warning">${escapeHtml(d.category)}</span>
                <span class="badge ${statusBadgeClass(d.status)}">${escapeHtml(d.status)}</span>
              </div>
              <div style="font-size:0.82rem; color:var(--text-muted);">Suggested by ${escapeHtml(d.studentName)} (${escapeHtml(d.room)}) on ${escapeHtml(d.date)}</div>
            </div>
            ${d.status === 'Pending' ? `
              <div style="display:flex; gap:8px;">
                <button class="btn btn-success btn-sm" onclick="handleSuggestion('${d.id}', 'Approved')">Approve</button>
                <button class="btn btn-danger btn-sm" onclick="handleSuggestion('${d.id}', 'Dismissed')">Dismiss</button>
              </div>
            ` : ''}
          </div>
        `).join('') || '<div class="empty-state">No student suggestions yet.</div>'}
      </div>
    </div>
  `;
}

function renderAdminComplaints() {
  const filters = ['All', 'Pending', 'In Progress', 'Resolved'];
  const list = db.complaints.filter(c => session.complaintFilter === 'All' || c.status === session.complaintFilter);

  return `
    <div class="filter-row">
      ${filters.map(f => `<button class="filter-pill ${session.complaintFilter === f ? 'active' : ''}" onclick="setComplaintFilter('${f}')">${f}</button>`).join('')}
    </div>
    <div class="card">
      <div class="list-stack">
        ${list.map(c => `
          <div class="list-item">
            <div style="flex:1; min-width:240px;">
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:5px;">
                <strong>#${escapeHtml(c.id)} • ${escapeHtml(c.category)}</strong>
                <span class="badge ${statusBadgeClass(c.status)}">${escapeHtml(c.status)}</span>
                <span class="badge ${c.priority === 'High' ? 'badge-danger' : 'badge-neutral'}">${escapeHtml(c.priority)} Priority</span>
              </div>
              <p style="font-size:0.9rem; margin-bottom:6px;">${escapeHtml(c.description)}</p>
              <div style="font-size:0.8rem; color:var(--text-muted);">Reported by <strong>${escapeHtml(c.studentName)}</strong> (${escapeHtml(c.room)}) • ${escapeHtml(c.date)}</div>
              ${c.remark ? `<div style="font-size:0.82rem; color:var(--primary); font-weight:600; margin-top:4px;">Remark: ${escapeHtml(c.remark)}</div>` : ''}
            </div>
            <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
              <select class="form-select" style="width:auto; padding:6px 10px; font-size:0.83rem;" onchange="updateComplaintStatus('${c.id}', this.value)">
                ${['Pending', 'In Progress', 'Resolved'].map(st => `<option ${c.status === st ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
              <button class="btn btn-secondary btn-sm" onclick="addComplaintRemark('${c.id}')">Add Note</button>
            </div>
          </div>
        `).join('') || '<div class="empty-state">No complaints matching this filter.</div>'}
      </div>
    </div>
  `;
}

function renderAdminOutpass() {
  return `
    <div class="card">
      <div class="card-header"><div class="card-title">🪪 Student Outpass &amp; Leave Requests</div></div>
      <div class="list-stack">
        ${db.outpasses.map(o => `
          <div class="list-item">
            <div style="flex:1; min-width:250px;">
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:5px;">
                <strong>${escapeHtml(o.studentName)} (${escapeHtml(o.room)})</strong>
                <span class="badge badge-info">${escapeHtml(o.type)}</span>
                <span class="badge ${statusBadgeClass(o.status)}">${escapeHtml(o.status)}</span>
              </div>
              <div style="font-size:0.88rem; margin-bottom:4px;"><strong>Destination:</strong> ${escapeHtml(o.destination)} • <strong>Reason:</strong> ${escapeHtml(o.reason)}</div>
              <div style="font-size:0.82rem; color:var(--text-muted);">Duration: ${escapeHtml(o.from)} → ${escapeHtml(o.to)} • Parent: ${escapeHtml(o.parentPhone)}</div>
            </div>
            <div style="display:flex; gap:8px;">
              ${o.status !== 'Approved' ? `<button class="btn btn-success btn-sm" onclick="updateOutpassStatus('${o.id}', 'Approved')">Approve</button>` : ''}
              ${o.status !== 'Rejected' ? `<button class="btn btn-danger btn-sm" onclick="updateOutpassStatus('${o.id}', 'Rejected')">Reject</button>` : ''}
            </div>
          </div>
        `).join('') || '<div class="empty-state">No outpass requests found.</div>'}
      </div>
    </div>
  `;
}

function renderAdminNotices() {
  return `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">✍️ Publish New Notice</div></div>
        <form onsubmit="publishNotice(event)">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" class="form-input" id="notTitle" placeholder="e.g., Special Feast on Sunday" required />
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" id="notCat">
              <option>General</option><option>Mess</option><option>Maintenance</option><option>Events</option><option>Rules</option>
            </select>
          </div>
          <div class="form-group">
            <label style="display:flex; align-items:center; gap:8px; font-size:0.88rem; font-weight:600; cursor:pointer;">
              <input type="checkbox" id="notUrgent" /> Mark as Urgent Notice
            </label>
          </div>
          <div class="form-group">
            <label class="form-label">Message</label>
            <textarea class="form-textarea" id="notBody" placeholder="Write announcement details..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Publish Notice</button>
        </form>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">📢 Published Notices (${db.notices.length})</div></div>
        <div class="list-stack">
          ${db.notices.map(n => `
            <div class="list-item">
              <div style="flex:1;">
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:4px;">
                  <strong>${escapeHtml(n.title)}</strong>
                  ${n.urgent ? '<span class="badge badge-danger">Urgent</span>' : `<span class="badge badge-info">${escapeHtml(n.category)}</span>`}
                </div>
                <p style="font-size:0.86rem; color:var(--text-muted);">${escapeHtml(n.content)}</p>
              </div>
              <button class="btn btn-danger btn-sm" onclick="deleteNotice('${n.id}')">Delete</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderAdminStudents() {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">👥 Resident Directory (${db.students.length} Students)</div>
        <button class="btn btn-primary btn-sm" onclick="openAddStudentModal()">+ Add Student</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Reg No</th><th>Room / Block</th><th>Phone</th><th>Mess Plan</th><th>Fee Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            ${db.students.map(s => `
              <tr>
                <td><strong>${escapeHtml(s.name)}</strong></td>
                <td>${escapeHtml(s.regNo)}</td>
                <td>${escapeHtml(s.room)} (${escapeHtml(s.block)})</td>
                <td>${escapeHtml(s.phone)}</td>
                <td>${escapeHtml(s.messPlan)}</td>
                <td><span class="badge ${s.feeStatus === 'Paid' ? 'badge-success' : 'badge-warning'}">${escapeHtml(s.feeStatus)}</span></td>
                <td><button class="btn btn-secondary btn-sm" onclick="toggleFeeStatus('${s.id}')">Toggle Fee</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}


// ==================== ROOM VACANCIES VIEWS ====================

function renderBedDots(occupied, capacity) {
  let html = '<div class="bed-dots">';
  for (let i = 0; i < capacity; i++) {
    if (i < occupied) {
      html += '<span class="bed-dot filled" title="Occupied">👤</span>';
    } else {
      html += '<span class="bed-dot empty" title="Vacant Bed">✓</span>';
    }
  }
  html += '</div>';
  return html;
}

function renderStudentRooms() {
  const st = getCurrentStudent();
  const totalVacantBeds = db.rooms.reduce((sum, r) => sum + Math.max(0, r.capacity - r.occupied), 0);
  const availableRooms = db.rooms.filter(r => r.occupied < r.capacity).length;
  const filters = ['All', 'Available Only', 'AC', 'Non-AC'];

  const filtered = db.rooms.filter(r => {
    if (session.roomFilter === 'Available Only') return r.occupied < r.capacity;
    if (session.roomFilter === 'AC') return r.ac;
    if (session.roomFilter === 'Non-AC') return !r.ac;
    return true;
  });

  const myBookings = db.roomBookings.filter(b => b.studentId === st.id);

  return `
    <div class="auto-banner">
      <div>
        <strong>⚡ Instant Auto-Accept is ${db.autoAcceptRooms ? 'ON' : 'OFF'}:</strong>
        ${db.autoAcceptRooms
          ? 'Pick any vacant room below and your allotment will be automatically approved right away.'
          : 'Room requests will be sent to the Warden for manual approval.'}
      </div>
      <span class="badge ${db.autoAcceptRooms ? 'badge-success' : 'badge-warning'}">${db.autoAcceptRooms ? 'Auto-Accept Active' : 'Manual Approval'}</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div>
          <div class="stat-label">Your Current Room</div>
          <div class="stat-value">${escapeHtml(st.room)}</div>
          <div class="stat-sub">${escapeHtml(st.block)}</div>
        </div>
        <div class="stat-icon" style="background:var(--primary-soft); color:var(--primary);">🏠</div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">Vacant Beds</div>
          <div class="stat-value" style="color:var(--success);">${totalVacantBeds}</div>
          <div class="stat-sub">Across ${availableRooms} rooms</div>
        </div>
        <div class="stat-icon" style="background:var(--success-soft); color:var(--success);">🛏️</div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">Total Rooms</div>
          <div class="stat-value">${db.rooms.length}</div>
          <div class="stat-sub">Blocks B &amp; G</div>
        </div>
        <div class="stat-icon" style="background:var(--info-soft); color:var(--info);">🏢</div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">Allotment Mode</div>
          <div class="stat-value" style="font-size:1.25rem; color:var(--success);">${db.autoAcceptRooms ? 'Instant' : 'Manual'}</div>
          <div class="stat-sub">${myBookings.length} booking${myBookings.length === 1 ? '' : 's'} logged</div>
        </div>
        <div class="stat-icon" style="background:var(--warning-soft); color:var(--warning);">⚡</div>
      </div>
    </div>

    <div class="filter-row">
      ${filters.map(f => `<button class="filter-pill ${session.roomFilter === f ? 'active' : ''}" onclick="setRoomFilter('${f}')">${f}</button>`).join('')}
    </div>

    <div class="grid-3" style="margin-bottom:24px;">
      ${filtered.map(r => {
        const vacant = Math.max(0, r.capacity - r.occupied);
        const isCurrent = st.room === r.roomNo;
        return `
          <div class="room-card ${isCurrent ? 'current-room' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div>
                <h3 style="font-size:1.1rem; font-weight:800;">Room ${escapeHtml(r.roomNo)}</h3>
                <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(r.block)} • ${escapeHtml(r.floor)}</div>
              </div>
              <span class="badge ${vacant > 0 ? 'badge-success' : 'badge-danger'}">
                ${vacant > 0 ? `${vacant} Vacant` : 'Full'}
              </span>
            </div>

            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <span class="badge badge-primary">${escapeHtml(r.type)}</span>
              <span class="badge ${r.ac ? 'badge-info' : 'badge-neutral'}">${r.ac ? '❄️ AC' : '🌀 Non-AC'}</span>
              <span class="badge badge-warning">${escapeHtml(r.rent)}</span>
            </div>

            <div>
              <div style="font-size:0.8rem; color:var(--text-muted);">${r.occupied} / ${r.capacity} beds occupied</div>
              ${renderBedDots(r.occupied, r.capacity)}
            </div>

            <div style="font-size:0.82rem; color:var(--text-muted);">${escapeHtml(r.amenities)}</div>

            <div style="margin-top:auto; padding-top:8px;">
              ${isCurrent
                ? `<button class="btn btn-secondary btn-full btn-sm" disabled>✓ Your Current Room</button>`
                : vacant > 0
                  ? `<button class="btn btn-primary btn-full btn-sm" onclick="bookVacantRoom('${r.roomNo}')">${db.autoAcceptRooms ? '⚡ Select & Auto-Accept' : 'Request Room'}</button>`
                  : `<button class="btn btn-secondary btn-full btn-sm" disabled>No Vacancy</button>`
              }
            </div>
          </div>
        `;
      }).join('')}
    </div>

    ${myBookings.length ? `
      <div class="card">
        <div class="card-header"><div class="card-title">📋 My Room Allotment History</div></div>
        <div class="list-stack">
          ${myBookings.map(b => `
            <div class="list-item" style="padding:12px 15px;">
              <div>
                <strong>${escapeHtml(b.fromRoom)} → Room ${escapeHtml(b.toRoom)} (${escapeHtml(b.block)})</strong>
                <div style="font-size:0.8rem; color:var(--text-muted);">Booking #${escapeHtml(b.id)} • ${escapeHtml(b.date)}</div>
              </div>
              <span class="badge ${statusBadgeClass(b.status)}">${escapeHtml(b.status)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

function renderAdminRooms() {
  const totalCap = db.rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOcc = db.rooms.reduce((s, r) => s + r.occupied, 0);
  const totalVac = Math.max(0, totalCap - totalOcc);

  return `
    <div class="auto-banner">
      <div>
        <strong>⚡ Automatic Room Acceptance:</strong>
        When enabled, students who pick a vacant room are automatically allotted that room without waiting for manual approval.
      </div>
      <button class="btn ${db.autoAcceptRooms ? 'btn-success' : 'btn-secondary'} btn-sm" onclick="toggleAutoAcceptRooms()">
        ${db.autoAcceptRooms ? '✓ Auto-Accept: ON' : 'Auto-Accept: OFF'}
      </button>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
      <div style="font-size:0.92rem; color:var(--text-muted);">
        Total Beds: <strong>${totalCap}</strong> • Occupied: <strong>${totalOcc}</strong> • Vacant: <strong style="color:var(--success);">${totalVac}</strong>
      </div>
      <button class="btn btn-primary" onclick="openAddRoomModal()">+ Add New Room</button>
    </div>

    <div class="grid-3" style="margin-bottom:22px;">
      ${db.rooms.map(r => {
        const vacant = Math.max(0, r.capacity - r.occupied);
        return `
          <div class="room-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h3 style="font-size:1.08rem; font-weight:800;">Room ${escapeHtml(r.roomNo)}</h3>
                <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(r.block)} • ${escapeHtml(r.floor)}</div>
              </div>
              <span class="badge ${vacant > 0 ? 'badge-success' : 'badge-danger'}">${vacant > 0 ? `${vacant} Vacant` : 'Full'}</span>
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <span class="badge badge-primary">${escapeHtml(r.type)}</span>
              <span class="badge ${r.ac ? 'badge-info' : 'badge-neutral'}">${r.ac ? 'AC' : 'Non-AC'}</span>
              <span class="badge badge-warning">${escapeHtml(r.rent)}</span>
            </div>
            <div>
              <div style="font-size:0.8rem; color:var(--text-muted);">${r.occupied} / ${r.capacity} beds occupied</div>
              ${renderBedDots(r.occupied, r.capacity)}
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(r.amenities)}</div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">📋 Recent Room Allotments &amp; Requests</div></div>
      <div class="list-stack">
        ${db.roomBookings.map(b => `
          <div class="list-item">
            <div>
              <strong>${escapeHtml(b.studentName)}</strong> — ${escapeHtml(b.fromRoom)} → <strong>Room ${escapeHtml(b.toRoom)}</strong> (${escapeHtml(b.block)})
              <div style="font-size:0.8rem; color:var(--text-muted);">Booking #${escapeHtml(b.id)} • ${escapeHtml(b.date)}</div>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span class="badge ${statusBadgeClass(b.status)}">${escapeHtml(b.status)}</span>
              ${b.status === 'Pending' ? `<button class="btn btn-success btn-sm" onclick="approveRoomBooking('${b.id}')">Approve</button>` : ''}
            </div>
          </div>
        `).join('') || '<div class="empty-state">No room allotments yet.</div>'}
      </div>
    </div>
  `;
}
