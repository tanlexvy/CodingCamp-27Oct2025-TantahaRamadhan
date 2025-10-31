/* ==== script.js ==== */

/* Local array to store todo items */
let todos = [];        // master list
let filteredTodos = []; // result of filter when applied
let isFiltered = false;

/* Utility: generate unique id (timestamp + random) */
function genId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/* Form validation */
function validateForm(todo, date) {
  if (todo.trim() === '' || date === '') {
    return false;
  }
  return true;
}

/* Clear inputs */
function clearInputs() {
  document.getElementById('todo-input').value = '';
  document.getElementById('todo-date').value = '';
  document.getElementById('todo-input').focus();
}

/* Add a new todo item */
function addTodo() {
  const todoInputEl = document.getElementById('todo-input');
  const todoInput = todoInputEl.value;
  const todoDate = document.getElementById('todo-date').value;

  if (!validateForm(todoInput, todoDate)) {
    alert('Form validation failed. Please check your inputs.');
    return;
  }

  const newTodo = {
    id: genId(),
    task: todoInput,
    dueDate: todoDate,
    status: 'Pending'
  };

  todos.push(newTodo);
  clearInputs();
  // if there is an active filter, reset it to show all (optional behavior)
  if (isFiltered) {
    clearFilter();
  } else {
    renderTodos();
  }
}

/* Delete an individual todo */
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  // keep filter in mind
  if (isFiltered) {
    applyCurrentFilter(); // re-apply filter after deletion
  } else {
    renderTodos();
  }
}

/* Toggle Done/Undo */
function toggleDone(id) {
  const item = todos.find(t => t.id === id);
  if (!item) return;
  item.status = item.status === 'Done' ? 'Pending' : 'Done';
  if (isFiltered) {
    applyCurrentFilter();
  } else {
    renderTodos();
  }
}

/* Clear all todos */
function clearAllTodos() {
  if (!confirm('Are you sure you want to clear ALL todos?')) return;
  todos = [];
  filteredTodos = [];
  isFiltered = false;
  renderTodos();
}

/* Render todo items to the table */
function renderTodos(list = null) {
  const tbody = document.getElementById('todo-body');
  const data = list || (isFiltered ? filteredTodos : todos);

  tbody.innerHTML = '';

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-400 py-4">No todos today, wanna do something?</td></tr>`;
    return;
  }

  data.forEach((todo, idx) => {
    const rowNo = idx + 1;
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${rowNo}</td>
      <td>${escapeHtml(todo.task)}</td>
      <td>${escapeHtml(todo.dueDate)}</td>
      <td>${escapeHtml(todo.status)}</td>
      <td>
        <button class="action-btn edit" data-id="${todo.id}">${todo.status === 'Done' ? 'Undo' : 'Done'}</button>
        <button class="action-btn delete" data-id="${todo.id}">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // attach delegated listeners for newly created buttons
  // (we'll handle by event delegation on tbody)
}

/* Escape HTML to avoid injection if user types tags */
function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* Filter logic */
/* applyCurrentFilter() reads the filter UI and filters todos */
function applyCurrentFilter() {
  const type = document.getElementById('filter-type').value;
  const raw = document.getElementById('filter-input').value.trim();

  if (!type || raw === '') {
    // no filter or empty query
    isFiltered = false;
    filteredTodos = [];
    renderTodos();
    return;
  }

  const q = raw.toLowerCase();
  switch (type) {
    case 'no':
      // match row number -> convert to number and compare to index+1
      const num = parseInt(q, 10);
      if (isNaN(num)) {
        filteredTodos = [];
      } else {
        filteredTodos = todos.filter((_, idx) => idx + 1 === num);
      }
      break;

    case 'name':
      filteredTodos = todos.filter(t => t.task.toLowerCase().includes(q));
      break;

    case 'date':
      // expecting exact yyyy-mm-dd string to match our input value
      filteredTodos = todos.filter(t => t.dueDate === raw);
      break;

    case 'status':
      filteredTodos = todos.filter(t => t.status.toLowerCase() === q);
      break;

    default:
      filteredTodos = [];
  }

  isFiltered = true;
  renderTodos(filteredTodos);
}

/* Clear filter UI + state */
function clearFilter() {
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-input').value = '';
  isFiltered = false;
  filteredTodos = [];
  renderTodos();
}

/* Event wiring after DOM loads */
document.addEventListener('DOMContentLoaded', () => {
  // initial render (empty)
  renderTodos();

  // buttons
  document.getElementById('add-todo-btn').addEventListener('click', addTodo);
  document.getElementById('clear-all-btn').addEventListener('click', clearAllTodos);
  document.getElementById('apply-filter-btn').addEventListener('click', applyCurrentFilter);
  document.getElementById('clear-filter-btn').addEventListener('click', clearFilter);

  // allow pressing Enter in filter input to apply filter
  document.getElementById('filter-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      applyCurrentFilter();
    }
  });

  // allow pressing Enter in todo input to add quickly
  document.getElementById('todo-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTodo();
    }
  });

  // delegation for action buttons inside table body
  document.getElementById('todo-body').addEventListener('click', (e) => {
    const target = e.target;
    if (target.matches('button.action-btn.edit')) {
      const id = Number(target.getAttribute('data-id'));
      toggleDone(id);
    } else if (target.matches('button.action-btn.delete')) {
      const id = Number(target.getAttribute('data-id'));
      if (confirm('Delete this todo?')) deleteTodo(id);
    }
  });
});
