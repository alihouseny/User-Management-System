
let users = [];
let activityLog = [];
let currentEditId = null;
let userToDeleteId = null;
let sortField = 'name';
let sortOrder = 'asc';
let currentView = 'table';
let selectedIds = new Set();
let currentPage = 1;
const PAGE_SIZE = 8;
let dragSrcIndex = -1;

const AVATAR_COLORS = [
    '#6C63FF', '#FF6584', '#43B89C', '#F7B731', '#FC5C65',
    '#2BCBBA', '#A55EEA', '#FD9644', '#26C6DA', '#EF5350'
];
function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++)
        hash += name.charCodeAt(i);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
function getInitials(name) {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
const SPECIALTY_LABELS = {
    webdeveloper: 'Web Developer',
    back: 'Back-End',
    front: 'Front-End',
    knowhtml: 'FullStack',
    softwareengineer: 'Software Engineer',
    else: 'Other',
};
const SPECIALTY_ICONS = {
    webdeveloper: 'fa-globe',
    back: 'fa-server',
    front: 'fa-palette',
    knowhtml: 'fa-layer-group',
    softwareengineer: 'fa-microchip',
    else: 'fa-star',
};
const DEFAULT_USERS = [
    { name: 'Ali Housseny Mohammed', email: 'ali@dev.io', age: 19, specialty: 'softwareengineer', createdAt: new Date().toISOString(), avatar: '', status: 'active', notes: 'Legend of the team' },
    { name: 'Yousef Elshaer', email: 'yousef@yahoo.com', age: 20, specialty: 'back', createdAt: new Date().toISOString(), avatar: '', status: 'active', notes: '' },
    { name: 'Ali ElHadad', email: 'hadad@dev.io', age: 19, specialty: 'front', createdAt: new Date().toISOString(), avatar: '', status: 'pending', notes: 'CEO' },
    { name: 'Lionel Messi', email: 'messi@goat.com', age: 37, specialty: 'else', createdAt: new Date().toISOString(), avatar: '', status: 'active', notes: 'GOAT 🐐' },
    { name: 'Zamalek FC', email: 'zsc@1911.com', age: 22, specialty: 'webdeveloper', createdAt: new Date().toISOString(), avatar: '', status: 'inactive', notes: 'The White Knight' },
];
function loadFromStorage() {
    try {
        const raw = localStorage.getItem('ums_users_v2');
        if (raw) {
            users = JSON.parse(raw);
        }
        else {
            users = DEFAULT_USERS.map((u, i) => (Object.assign(Object.assign({}, u), { id: Date.now() + i, avatar: getAvatarColor(u.name) })));
            saveToStorage();
        }
        const logRaw = localStorage.getItem('ums_activity');
        if (logRaw)
            activityLog = JSON.parse(logRaw);
    }
    catch (_a) {
        users = [];
    }
}
function saveToStorage() {
    localStorage.setItem('ums_users_v2', JSON.stringify(users));
}
function saveActivity() {
    localStorage.setItem('ums_activity', JSON.stringify(activityLog.slice(-50)));
}
function logActivity(action, detail) {
    activityLog.unshift({ timestamp: new Date().toISOString(), action, detail });
    saveActivity();
    renderActivityLog();
}

const $ = (id) => document.getElementById(id);
const totalUsersEl = $('totalUsers');
const todayAddedEl = $('todayAdded');
const totalSpecEl = $('totalSpecialties');
const activeUsersEl = $('activeUsers');
const tableBody = $('usersTableBody');
const tableContainer = $('tableContainer');
const cardContainer = $('cardContainer');
const kanbanContainer = $('kanbanContainer');
const noUsersMsg = $('noUsersMessage');
const noResultsMsg = $('noResultsMessage');
const paginationEl = $('pagination');
const searchInput = $('searchInput');
const filterSpecialty = $('filterSpecialty');
const filterStatus = $('filterStatus');
const sortFieldSel = $('sortFieldSel');
const sortOrderBtn = $('sortOrderBtn');
const addUserBtn = $('addUserBtn');
const exportCsvBtn = $('exportCsvBtn');
const importCsvBtn = $('importCsvBtn');
const importFileInput = $('importFileInput');
const bulkDeleteBtn = $('bulkDeleteBtn');
const selectAllCb = $('selectAllCheckbox');
const viewBtns = document.querySelectorAll('.view-btn');
const userModal = $('userModal');
const modalTitle = $('modalTitle');
const closeModalBtn = $('closeModalBtn');
const cancelBtn = $('cancelBtn');
const userForm = $('userForm');
const userName = $('userName');
const userEmail = $('userEmail');
const userAge = $('userAge');
const userSpecialty = $('userSpecialty');
const userStatus = $('userStatus');
const userNotes = $('userNotes');
const nameError = $('nameError');
const emailError = $('emailError');
const ageError = $('ageError');
const specialtyError = $('specialtyError');
const charCounter = $('charCounter');
const nameStrength = $('nameStrength');
const deleteModal = $('deleteModal');
const deleteUserName = $('deleteUserName');
const confirmDeleteBtn = $('confirmDeleteBtn');
const cancelDeleteBtn = $('cancelDeleteBtn');
const profileModal = $('profileModal');
const profileContent = $('profileContent');
const closeProfileBtn = $('closeProfileBtn');
const toast = $('toast');
const toastMsg = $('toastMessage');
const toastIcon = $('toastIcon');
const themeToggle = $('themeToggle');
const shortcutsBtn = $('shortcutsBtn');
const shortcutsModal = $('shortcutsModal');
const closeShortcuts = $('closeShortcuts');
const activityList = $('activityList');
const searchClear = $('searchClear');
 
function getFilteredUsers() {
    const term = searchInput.value.toLowerCase().trim();
    const spec = filterSpecialty.value;
    const status = filterStatus.value;
    let list = users.filter(u => {
        const matchTerm = !term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
        const matchSpec = !spec || u.specialty === spec;
        const matchStatus = !status || u.status === status;
        return matchTerm && matchSpec && matchStatus;
    });
    list.sort((a, b) => {
        var _a, _b;
        const av = (_a = a[sortField]) !== null && _a !== void 0 ? _a : '';
        const bv = (_b = b[sortField]) !== null && _b !== void 0 ? _b : '';
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortOrder === 'asc' ? cmp : -cmp;
    });
    return list;
}

function animateCounter(el, target) {
    const start = parseInt(el.textContent || '0', 10);
    const diff = target - start;
    const dur = 600;
    const step = 16;
    let t = 0;
    const timer = setInterval(() => {
        t += step;
        const progress = Math.min(t / dur, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(start + diff * ease));
        if (t >= dur)
            clearInterval(timer);
    }, step);
}

function updateStatistics() {
    const today = new Date().toDateString();
    const todayCount = users.filter(u => new Date(u.createdAt).toDateString() === today).length;
    const uniqueSpec = new Set(users.map(u => u.specialty)).size;
    const activeCount = users.filter(u => u.status === 'active').length;
    animateCounter(totalUsersEl, users.length);
    animateCounter(todayAddedEl, todayCount);
    animateCounter(totalSpecEl, uniqueSpec);
    animateCounter(activeUsersEl, activeCount);
}

function renderPagination(total) {
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }
    let html = '';
    const mk = (p, label = String(p), active = false, disabled = false) => `<button class="page-btn ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}"
             data-page="${p}" ${disabled ? 'disabled' : ''}>${label}</button>`;
    html += mk(currentPage - 1, '<i class="fas fa-chevron-left"></i>', false, currentPage === 1);
    for (let p = 1; p <= pages; p++) {
        if (p === 1 || p === pages || Math.abs(p - currentPage) <= 1) {
            html += mk(p, String(p), p === currentPage);
        }
        else if (Math.abs(p - currentPage) === 2) {
            html += `<span class="page-ellipsis">…</span>`;
        }
    }
    html += mk(currentPage + 1, '<i class="fas fa-chevron-right"></i>', false, currentPage === pages);
    paginationEl.innerHTML = html;
    paginationEl.querySelectorAll('.page-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderAll();
        });
    });
}
function renderTableView(list) {
    const start = (currentPage - 1) * PAGE_SIZE;
    const page = list.slice(start, start + PAGE_SIZE);
    tableBody.innerHTML = '';
    page.forEach((user, i) => {
        const row = document.createElement('tr');
        row.dataset.id = String(user.id);
        row.draggable = true;
        const checked = selectedIds.has(user.id);
        const icon = SPECIALTY_ICONS[user.specialty] || 'fa-star';
        const label = SPECIALTY_LABELS[user.specialty] || user.specialty;
        const color = getAvatarColor(user.name);
        const initials = getInitials(user.name);
        const statusBadge = `<span class="status-badge status-${user.status}">${user.status}</span>`;
        row.innerHTML = `
      <td><input type="checkbox" class="row-cb" data-id="${user.id}" ${checked ? 'checked' : ''}></td>
      <td class="row-num">${start + i + 1}</td>
      <td>
        <div class="user-cell">
          <div class="avatar" style="background:${color}" title="${user.name}">${initials}</div>
          <div class="user-cell-info">
            <span class="user-name">${user.name}</span>
            ${user.notes ? `<span class="user-note">${user.notes}</span>` : ''}
          </div>
        </div>
      </td>
      <td><a href="mailto:${user.email}" class="email-link">${user.email}</a></td>
      <td><span class="age-chip">${user.age}</span></td>
      <td><span class="specialty-badge spec-${user.specialty}"><i class="fas ${icon}"></i> ${label}</span></td>
      <td>${statusBadge}</td>
      <td class="actions-cell">
        <button class="action-btn view-btn-row" data-id="${user.id}" title="View Profile"><i class="fas fa-eye"></i></button>
        <button class="action-btn edit-btn-row" data-id="${user.id}" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="action-btn delete-btn-row" data-id="${user.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>`;
        // drag
        row.addEventListener('dragstart', () => { dragSrcIndex = users.findIndex(u => u.id === user.id); row.classList.add('dragging'); });
        row.addEventListener('dragend', () => row.classList.remove('dragging'));
        row.addEventListener('dragover', e => { e.preventDefault(); row.classList.add('drag-over'); });
        row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
        row.addEventListener('drop', () => {
            row.classList.remove('drag-over');
            const destIndex = users.findIndex(u => u.id === user.id);
            if (dragSrcIndex === -1 || dragSrcIndex === destIndex)
                return;
            const [moved] = users.splice(dragSrcIndex, 1);
            users.splice(destIndex, 0, moved);
            saveToStorage();
            renderAll();
        });
        tableBody.appendChild(row);
    });
    // Row events
    tableBody.querySelectorAll('.row-cb').forEach(cb => {
        cb.addEventListener('change', () => {
            const id = parseInt(cb.dataset.id);
            cb.checked ? selectedIds.add(id) : selectedIds.delete(id);
            updateBulkUI();
        });
    });
    tableBody.querySelectorAll('.view-btn-row').forEach(btn => btn.addEventListener('click', () => openProfile(parseInt(btn.dataset.id))));
    tableBody.querySelectorAll('.edit-btn-row').forEach(btn => btn.addEventListener('click', () => editUser(parseInt(btn.dataset.id))));
    tableBody.querySelectorAll('.delete-btn-row').forEach(btn => btn.addEventListener('click', () => showDeleteConfirmation(parseInt(btn.dataset.id))));
    // Double click to edit
    tableBody.addEventListener('dblclick', e => {
        const row = e.target.closest('tr');
        if (row === null || row === void 0 ? void 0 : row.dataset.id)
            editUser(parseInt(row.dataset.id));
    });
}
// ── Card view ──────────────────────────────────────────────────
function renderCardView(list) {
    const start = (currentPage - 1) * PAGE_SIZE;
    const page = list.slice(start, start + PAGE_SIZE);
    cardContainer.innerHTML = '';
    page.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';
        const color = getAvatarColor(user.name);
        const initials = getInitials(user.name);
        const icon = SPECIALTY_ICONS[user.specialty] || 'fa-star';
        const label = SPECIALTY_LABELS[user.specialty] || user.specialty;
        const date = new Date(user.createdAt).toLocaleDateString();
        card.innerHTML = `
      <div class="card-header-strip" style="background:${color}"></div>
      <div class="card-body">
        <div class="card-avatar" style="background:${color}">${initials}</div>
        <h3 class="card-name">${user.name}</h3>
        <span class="status-badge status-${user.status}">${user.status}</span>
        <p class="card-email"><i class="fas fa-envelope"></i> ${user.email}</p>
        <p class="card-meta"><i class="fas fa-birthday-cake"></i> Age ${user.age}</p>
        <span class="specialty-badge spec-${user.specialty}"><i class="fas ${icon}"></i> ${label}</span>
        ${user.notes ? `<p class="card-notes">${user.notes}</p>` : ''}
        <p class="card-date"><i class="fas fa-calendar-alt"></i> Joined ${date}</p>
      </div>
      <div class="card-actions">
        <button class="action-btn view-btn-row" data-id="${user.id}" title="Profile"><i class="fas fa-eye"></i></button>
        <button class="action-btn edit-btn-row" data-id="${user.id}" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="action-btn delete-btn-row" data-id="${user.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </div>`;
        cardContainer.appendChild(card);
    });
    cardContainer.querySelectorAll('.view-btn-row').forEach(btn => btn.addEventListener('click', () => openProfile(parseInt(btn.dataset.id))));
    cardContainer.querySelectorAll('.edit-btn-row').forEach(btn => btn.addEventListener('click', () => editUser(parseInt(btn.dataset.id))));
    cardContainer.querySelectorAll('.delete-btn-row').forEach(btn => btn.addEventListener('click', () => showDeleteConfirmation(parseInt(btn.dataset.id))));
}
// ── Kanban view ────────────────────────────────────────────────
function renderKanbanView(list) {
    kanbanContainer.innerHTML = '';
    const columns = [
        { key: 'active', label: 'Active', icon: 'fa-circle-check' },
        { key: 'pending', label: 'Pending', icon: 'fa-clock' },
        { key: 'inactive', label: 'Inactive', icon: 'fa-circle-xmark' },
    ];
    columns.forEach(col => {
        const colEl = document.createElement('div');
        colEl.className = 'kanban-col';
        const colUsers = list.filter(u => u.status === col.key);
        colEl.innerHTML = `
      <div class="kanban-col-header">
        <i class="fas ${col.icon}"></i>
        <span>${col.label}</span>
        <span class="kanban-count">${colUsers.length}</span>
      </div>
      <div class="kanban-cards" id="kcol-${col.key}"></div>`;
        const cardsEl = colEl.querySelector('.kanban-cards');
        colUsers.forEach(user => {
            const card = document.createElement('div');
            card.className = 'kanban-card';
            const color = getAvatarColor(user.name);
            const initials = getInitials(user.name);
            card.innerHTML = `
        <div class="kanban-card-top">
          <div class="avatar" style="background:${color}">${initials}</div>
          <div>
            <strong>${user.name}</strong>
            <p>${SPECIALTY_LABELS[user.specialty] || user.specialty}</p>
          </div>
        </div>
        <div class="kanban-card-actions">
          <button class="action-btn edit-btn-row" data-id="${user.id}" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="action-btn delete-btn-row" data-id="${user.id}" title="Delete"><i class="fas fa-trash"></i></button>
        </div>`;
            cardsEl.appendChild(card);
        });
        kanbanContainer.appendChild(colEl);
    });
    kanbanContainer.querySelectorAll('.edit-btn-row').forEach(btn => btn.addEventListener('click', () => editUser(parseInt(btn.dataset.id))));
    kanbanContainer.querySelectorAll('.delete-btn-row').forEach(btn => btn.addEventListener('click', () => showDeleteConfirmation(parseInt(btn.dataset.id))));
}
// ── Render all ─────────────────────────────────────────────────
function renderAll() {
    const list = getFilteredUsers();
    tableContainer.classList.add('hidden');
    cardContainer.classList.add('hidden');
    kanbanContainer.classList.add('hidden');
    noUsersMsg.classList.add('hidden');
    noResultsMsg.classList.add('hidden');
    if (list.length === 0) {
        const hasFilter = searchInput.value || filterSpecialty.value || filterStatus.value;
        (hasFilter ? noResultsMsg : noUsersMsg).classList.remove('hidden');
        paginationEl.innerHTML = '';
        updateStatistics();
        return;
    }
    if (currentView === 'table') {
        tableContainer.classList.remove('hidden');
        renderTableView(list);
    }
    else if (currentView === 'card') {
        cardContainer.classList.remove('hidden');
        renderCardView(list);
    }
    else {
        kanbanContainer.classList.remove('hidden');
        renderKanbanView(list);
    }
    if (currentView !== 'kanban')
        renderPagination(list.length);
    else
        paginationEl.innerHTML = '';
    updateStatistics();
}
// ── View toggle ────────────────────────────────────────────────
function setView(v) {
    currentView = v;
    currentPage = 1;
    viewBtns.forEach(b => b.classList.toggle('active', b.dataset.view === v));
    renderAll();
}
// ── Bulk selection ─────────────────────────────────────────────
function updateBulkUI() {
    bulkDeleteBtn.classList.toggle('hidden', selectedIds.size === 0);
    bulkDeleteBtn.textContent = selectedIds.size > 0 ? `Delete Selected (${selectedIds.size})` : '';
    if (selectedIds.size > 0) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-trash';
        bulkDeleteBtn.prepend(icon);
    }
}
function bulkDelete() {
    if (!selectedIds.size)
        return;
    if (!confirm(`Delete ${selectedIds.size} users?`))
        return;
    users = users.filter(u => !selectedIds.has(u.id));
    logActivity('delete', `Bulk deleted ${selectedIds.size} users`);
    selectedIds.clear();
    saveToStorage();
    renderAll();
    updateBulkUI();
    showToast(`Deleted users`, 'success');
}
// ── Modal helpers ──────────────────────────────────────────────
function openModal(el) {
    el.classList.remove('hidden');
    requestAnimationFrame(() => el.classList.add('active'));
}
function closeModalEl(el) {
    el.classList.remove('active');
    setTimeout(() => el.classList.add('hidden'), 300);
}
// ── Add/Edit modal ─────────────────────────────────────────────
function openAddUserModal() {
    currentEditId = null;
    modalTitle.textContent = 'Add New User';
    userForm.reset();
    clearErrors();
    restoreDraft();
    openModal(userModal);
}
function closeModal() {
    closeModalEl(userModal);
    userForm.reset();
    clearErrors();
    currentEditId = null;
}
function clearErrors() {
    [nameError, emailError, ageError, specialtyError].forEach(el => el.textContent = '');
    [userName, userEmail, userAge, userSpecialty].forEach(el => el.classList.remove('input-error'));
}
function setError(el, input, msg) {
    el.textContent = msg;
    input.classList.add('input-error');
}
function validateForm() {
    let ok = true;
    clearErrors();
    if (!userName.value.trim() || userName.value.trim().length < 2) {
        setError(nameError, userName, 'Full name must be at least 2 characters');
        ok = false;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(userEmail.value.trim())) {
        setError(emailError, userEmail, 'Please enter a valid email');
        ok = false;
    }
    else if (!currentEditId && users.some(u => u.email === userEmail.value.trim())) {
        setError(emailError, userEmail, 'Email already exists');
        ok = false;
    }
    const age = parseInt(userAge.value);
    if (!userAge.value || age < 10 || age > 120) {
        setError(ageError, userAge, 'Age must be between 10 and 120');
        ok = false;
    }
    if (!userSpecialty.value) {
        setError(specialtyError, userSpecialty, 'Please select a specialty');
        ok = false;
    }
    return ok;
}
function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm())
        return;
    const data = {
        name: userName.value.trim(),
        email: userEmail.value.trim(),
        age: parseInt(userAge.value),
        specialty: userSpecialty.value,
        status: userStatus.value || 'active',
        notes: userNotes.value.trim(),
    };
    if (currentEditId === null) {
        const newUser = Object.assign(Object.assign({}, data), { id: Date.now(), createdAt: new Date().toISOString(), avatar: getAvatarColor(data.name) });
        users.push(newUser);
        logActivity('add', `Added user "${data.name}"`);
        showToast(`User ${data.name} added!`, 'success');
        clearDraft();
    }
    else {
        const idx = users.findIndex(u => u.id === currentEditId);
        if (idx !== -1) {
            users[idx] = Object.assign(Object.assign(Object.assign({}, users[idx]), data), { avatar: getAvatarColor(data.name) });
            logActivity('edit', `Edited user "${data.name}"`);
            showToast(`User ${data.name} updated!`, 'info');
        }
    }
    saveToStorage();
    closeModal();
    renderAll();
}
function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user)
        return;
    currentEditId = id;
    modalTitle.textContent = 'Edit User';
    userName.value = user.name;
    userEmail.value = user.email;
    userAge.value = String(user.age);
    userSpecialty.value = user.specialty;
    userStatus.value = user.status;
    userNotes.value = user.notes;
    charCounter.textContent = `${user.notes.length}/200`;
    clearErrors();
    openModal(userModal);
}
// ── Profile modal ──────────────────────────────────────────────
function openProfile(id) {
    const user = users.find(u => u.id === id);
    if (!user)
        return;
    const color = getAvatarColor(user.name);
    const initials = getInitials(user.name);
    const icon = SPECIALTY_ICONS[user.specialty] || 'fa-star';
    const label = SPECIALTY_LABELS[user.specialty] || user.specialty;
    const date = new Date(user.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    profileContent.innerHTML = `
    <div class="profile-hero" style="background:${color}">
      <div class="profile-avatar-lg">${initials}</div>
    </div>
    <div class="profile-info">
      <h2 class="profile-name">${user.name}</h2>
      <span class="status-badge status-${user.status}">${user.status}</span>
      <div class="profile-grid">
        <div class="profile-item"><i class="fas fa-envelope"></i><span>${user.email}</span></div>
        <div class="profile-item"><i class="fas fa-birthday-cake"></i><span>${user.age} years old</span></div>
        <div class="profile-item"><i class="fas ${icon}"></i><span>${label}</span></div>
        <div class="profile-item"><i class="fas fa-calendar-alt"></i><span>Joined ${date}</span></div>
        ${user.notes ? `<div class="profile-item full"><i class="fas fa-sticky-note"></i><span>${user.notes}</span></div>` : ''}
      </div>
      <div class="profile-actions">
        <button class="btn btn-primary" onclick="editUser(${user.id}); closeModalEl(profileModal)">
          <i class="fas fa-pen"></i> Edit
        </button>
        <button class="btn btn-danger" onclick="showDeleteConfirmation(${user.id}); closeModalEl(profileModal)">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>`;
    openModal(profileModal);
}
// ── Delete modal ───────────────────────────────────────────────
function showDeleteConfirmation(id) {
    const user = users.find(u => u.id === id);
    if (!user)
        return;
    userToDeleteId = id;
    deleteUserName.textContent = user.name;
    openModal(deleteModal);
}
function deleteUser() {
    const idx = users.findIndex(u => u.id === userToDeleteId);
    if (idx !== -1) {
        const name = users[idx].name;
        users.splice(idx, 1);
        saveToStorage();
        logActivity('delete', `Deleted user "${name}"`);
        showToast(`User ${name} deleted`, 'error');
        renderAll();
    }
    closeModalEl(deleteModal);
    userToDeleteId = null;
}
// ── Toast ──────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = 'success') {
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        info: 'fa-circle-info',
        warning: 'fa-triangle-exclamation',
    };
    toastMsg.textContent = msg;
    toastIcon.className = `fas ${icons[type]}`;
    toast.className = `toast toast-${type}`;
    requestAnimationFrame(() => toast.classList.add('active'));
    if (toastTimer)
        clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}
// ── CSV Export ─────────────────────────────────────────────────
function exportCsv() {
    const headers = ['ID', 'Name', 'Email', 'Age', 'Specialty', 'Status', 'Notes', 'Created'];
    const rows = users.map(u => [
        u.id, u.name, u.email, u.age,
        SPECIALTY_LABELS[u.specialty] || u.specialty,
        u.status, u.notes,
        new Date(u.createdAt).toLocaleDateString()
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity('export', `Exported ${users.length} users to CSV`);
    showToast(`Exported ${users.length} users`, 'success');
}
// ── CSV Import ─────────────────────────────────────────────────
function importCsv(e) {
    var _a;
    const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = ev => {
        var _a;
        const lines = ((_a = ev.target) === null || _a === void 0 ? void 0 : _a.result).split('\n').slice(1);
        let added = 0;
        lines.forEach(line => {
            const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
            if (cols.length < 5 || !cols[1] || !cols[2])
                return;
            if (users.some(u => u.email === cols[2]))
                return;
            users.push({
                id: Date.now() + Math.random(),
                name: cols[1],
                email: cols[2],
                age: parseInt(cols[3]) || 18,
                specialty: cols[4] || 'else',
                status: cols[5] || 'active',
                notes: cols[6] || '',
                createdAt: new Date().toISOString(),
                avatar: getAvatarColor(cols[1]),
            });
            added++;
        });
        saveToStorage();
        logActivity('import', `Imported ${added} users from CSV`);
        renderAll();
        showToast(`Imported ${added} users`, 'success');
    };
    reader.readAsText(file);
    e.target.value = '';
}
// ── Draft save ─────────────────────────────────────────────────
function saveDraft() {
    if (currentEditId)
        return;
    localStorage.setItem('ums_draft', JSON.stringify({
        name: userName.value, email: userEmail.value,
        age: userAge.value, specialty: userSpecialty.value, notes: userNotes.value
    }));
}
function restoreDraft() {
    const raw = localStorage.getItem('ums_draft');
    if (!raw)
        return;
    try {
        const d = JSON.parse(raw);
        userName.value = d.name || '';
        userEmail.value = d.email || '';
        userAge.value = d.age || '';
        userSpecialty.value = d.specialty || '';
        userNotes.value = d.notes || '';
        charCounter.textContent = `${(d.notes || '').length}/200`;
    }
    catch (_a) { }
}
function clearDraft() { localStorage.removeItem('ums_draft'); }
// ── Activity log ───────────────────────────────────────────────
function renderActivityLog() {
    if (!activityList)
        return;
    const icons = {
        add: 'fa-plus', edit: 'fa-pen', delete: 'fa-trash', export: 'fa-download', import: 'fa-upload'
    };
    activityList.innerHTML = activityLog.slice(0, 10).map(e => `
    <li class="activity-item activity-${e.action}">
      <i class="fas ${icons[e.action] || 'fa-circle'}"></i>
      <div>
        <span>${e.detail}</span>
        <small>${new Date(e.timestamp).toLocaleString()}</small>
      </div>
    </li>`).join('') || '<li class="activity-empty">No recent activity</li>';
}
// ── Name strength indicator ────────────────────────────────────
function updateNameStrength(val) {
    const len = val.trim().length;
    let cls = '', label = '';
    if (len === 0) {
        cls = '';
        label = '';
    }
    else if (len < 3) {
        cls = 'weak';
        label = 'Too short';
    }
    else if (len < 8) {
        cls = 'fair';
        label = 'Fair';
    }
    else if (len < 15) {
        cls = 'good';
        label = 'Good';
    }
    else {
        cls = 'strong';
        label = 'Great name!';
    }
    nameStrength.className = `name-strength ${cls}`;
    nameStrength.textContent = label;
}
// ── Dark mode ──────────────────────────────────────────────────
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('ums_theme', isLight ? 'light' : 'dark');
    themeToggle.innerHTML = isLight
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
}
// ── Search clear ───────────────────────────────────────────────
function updateSearchClear() {
    searchClear.style.opacity = searchInput.value ? '1' : '0';
    searchClear.style.pointerEvents = searchInput.value ? 'auto' : 'none';
}
// ── Keyboard shortcuts ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        if (e.key === 'Escape')
            e.target.blur();
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddUserModal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportCsv();
    }
    if (e.key === 'Escape') {
        closeModal();
        closeModalEl(deleteModal);
        closeModalEl(profileModal);
        closeModalEl(shortcutsModal);
    }
    if (e.key === '1')
        setView('table');
    if (e.key === '2')
        setView('card');
    if (e.key === '3')
        setView('kanban');
    if (e.key === '?')
        openModal(shortcutsModal);
});
// ── Floating particles ─────────────────────────────────────────
function initParticles() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas)
        return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.4 + 0.1,
    }));
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(108, 99, 255, ${p.alpha})`;
            ctx.fill();
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width)
                p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height)
                p.dy *= -1;
        });
        requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
// ── Init ───────────────────────────────────────────────────────
function init() {
    loadFromStorage();
    // theme
    const savedTheme = localStorage.getItem('ums_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    renderAll();
    renderActivityLog();
    initParticles();
    // Events
    addUserBtn.addEventListener('click', openAddUserModal);
    userForm.addEventListener('submit', handleFormSubmit);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', closeModal);
    confirmDeleteBtn.addEventListener('click', deleteUser);
    cancelDeleteBtn.addEventListener('click', () => closeModalEl(deleteModal));
    document.getElementById('deleteModalOverlay').addEventListener('click', () => closeModalEl(deleteModal));
    closeProfileBtn.addEventListener('click', () => closeModalEl(profileModal));
    document.getElementById('profileModalOverlay').addEventListener('click', () => closeModalEl(profileModal));
    shortcutsBtn.addEventListener('click', () => openModal(shortcutsModal));
    closeShortcuts.addEventListener('click', () => closeModalEl(shortcutsModal));
    exportCsvBtn.addEventListener('click', exportCsv);
    importCsvBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importCsv);
    bulkDeleteBtn.addEventListener('click', bulkDelete);
    selectAllCb.addEventListener('change', () => {
        const list = getFilteredUsers();
        list.forEach(u => selectAllCb.checked ? selectedIds.add(u.id) : selectedIds.delete(u.id));
        renderAll();
        updateBulkUI();
    });
    searchInput.addEventListener('input', () => { currentPage = 1; renderAll(); updateSearchClear(); });
    filterSpecialty.addEventListener('change', () => { currentPage = 1; renderAll(); });
    filterStatus.addEventListener('change', () => { currentPage = 1; renderAll(); });
    searchClear.addEventListener('click', () => { searchInput.value = ''; currentPage = 1; renderAll(); updateSearchClear(); });
    sortFieldSel.addEventListener('change', () => { sortField = sortFieldSel.value; renderAll(); });
    sortOrderBtn.addEventListener('click', () => {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        sortOrderBtn.innerHTML = sortOrder === 'asc'
            ? '<i class="fas fa-arrow-up-a-z"></i>'
            : '<i class="fas fa-arrow-down-z-a"></i>';
        renderAll();
    });
    viewBtns.forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
    themeToggle.addEventListener('click', toggleTheme);
    // Draft autosave
    [userName, userEmail, userAge, userSpecialty, userNotes].forEach(el => el.addEventListener('input', saveDraft));
    // Notes char counter
    userNotes.addEventListener('input', () => {
        const len = userNotes.value.length;
        if (len > 200)
            userNotes.value = userNotes.value.slice(0, 200);
        charCounter.textContent = `${Math.min(len, 200)}/200`;
    });
    // Name strength
    userName.addEventListener('input', () => updateNameStrength(userName.value));
    // scroll-top
    const scrollTopBtn = document.getElementById('scrollTop');
    window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('show', window.scrollY > 300));
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    console.log('%c USER MANAGEMENT SYSTEM v2 ', 'background:#6C63FF;color:#fff;font-size:14px;border-radius:4px;padding:4px 8px');
    console.log('Ctrl+N → New User | Ctrl+F → Search | Ctrl+E → Export | ? → Shortcuts');
}
// make helpers global for inline onclick attrs
window.editUser = editUser;
window.showDeleteConfirmation = showDeleteConfirmation;
window.openProfile = openProfile;
window.closeModalEl = closeModalEl;
window.profileModal = profileModal;
document.addEventListener('DOMContentLoaded', init);
