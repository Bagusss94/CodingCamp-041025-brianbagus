// DOM
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const addBtn = document.getElementById('addBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const taskList = document.getElementById('taskList');
const filterDropdownBtn = document.getElementById('filterDropdown');
const filterOptions = document.querySelectorAll('.filter-option');

// State
let tasks = []; // { id, text, dueDate (yyyy-mm-dd or ''), status: 'Pending'|'Done' }
let currentFilter = 'all';

// Helpers
function formatDisplayDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d)) return '-';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function isOverdue(task) {
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  const due = new Date(task.dueDate);
  due.setHours(0,0,0,0);
  return due < today && task.status === 'Pending';
}

// Render
function renderTasks() {
  taskList.innerHTML = '';

  let filtered = tasks.filter(t => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'pending') return t.status === 'Pending';
    if (currentFilter === 'done') return t.status === 'Done';
    if (currentFilter === 'overdue') return isOverdue(t);
    return true;
  });

  if (filtered.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="4" class="text-muted">Tidak Ada Tugas</td>`;
    taskList.appendChild(tr);
    return;
  }

  filtered.forEach(task => {
    const tr = document.createElement('tr');
    tr.dataset.id = task.id;

    const actionHtml = task.status === 'Pending'
      ? `<button class="btn btn-primary btn-sm me-1 doneBtn" data-id="${task.id}">✔</button>
         <button class="btn btn-danger btn-sm deleteBtn" data-id="${task.id}">✖</button>`
      : `<button class="btn btn-danger btn-sm deleteBtn" data-id="${task.id}">✖</button>`;

    tr.innerHTML = `
      <td class="${task.status === 'Done' ? 'completed' : ''}">${escapeHtml(task.text)}</td>
      <td>${formatDisplayDate(task.dueDate)}</td>
      <td class="status">${task.status}${isOverdue(task) ? ' (Overdue)' : ''}</td>
      <td>${actionHtml}</td>
    `;

    // done button (only when pending)
    if (task.status === 'Pending') {
      tr.querySelector('.doneBtn').addEventListener('click', () => {
        tasks = tasks.map(t => t.id === task.id ? { ...t, status: 'Done' } : t);
        renderTasks();
        showAlert("Task berhasil dihapus!", "danger");

      });
    }
    
    
    // delete button
    tr.querySelector('.deleteBtn').addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== task.id);
        renderTasks();
        showAlert("Task berhasil dihapus!", "danger");
    });

    taskList.appendChild(tr);
  });
}

// Safety: basic escaping to avoid accidental HTML injection
function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Add task
function addTask() {
  const text = taskInput.value.trim();
  const due = dateInput.value; // yyyy-mm-dd or ''
  if (text === '') return;

  const id = Date.now().toString() + Math.floor(Math.random()*1000);
  tasks.push({ id, text, dueDate: due || '', status: 'Pending' });

  taskInput.value = '';
  dateInput.value = '';

  renderTasks();
  showAlert("Task berhasil ditambahkan!", "success");

}

// Filter setting
function setFilter(filterKey, labelText = null) {
  currentFilter = filterKey;
  // update dropdown label
  filterDropdownBtn.textContent = `FILTER: ${labelText || filterKey}`;
  // update active class
  filterOptions.forEach(opt => {
    if (opt.dataset.filter === filterKey) opt.classList.add('active');
    else opt.classList.remove('active');
  });
  renderTasks();
}

    //Notifikasi
function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alert-container");
  const wrapper = document.createElement("div");
  
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
  `;
  
  alertContainer.appendChild(wrapper);

  // Auto close setelah 3 detik
  setTimeout(() => {
    wrapper.remove();
  }, 3000);
}

// Event listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
dateInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

deleteAllBtn.addEventListener('click', () => {
  if (!confirm('Delete all tasks?')) return;
  tasks = [];
  renderTasks();
});

filterOptions.forEach(opt => {
  opt.addEventListener('click', (e) => {
    e.preventDefault();
    const f = opt.dataset.filter;
    const label = opt.textContent.trim();
    setFilter(f, label);
  });
});

// initial
setFilter('all', 'All');
renderTasks();
