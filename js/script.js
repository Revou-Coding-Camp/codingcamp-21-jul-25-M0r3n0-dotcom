document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const todoInput = document.getElementById('todo-input');
  const todoDate = document.getElementById('todo-date');
  const addBtn = document.getElementById('add-btn');
  const deleteAllBtn = document.getElementById('delete-all-btn');
  const todoList = document.getElementById('todo-list');
  const filterBtn = document.getElementById('filter-btn');
  const filterMenu = document.getElementById('filter-menu');
  const notification = document.getElementById('notification');
  const modal = document.getElementById('modal-overlay');
  const confirmDelete = document.getElementById('confirm-delete');
  const cancelDelete = document.getElementById('cancel-delete');

  let todos = [];
  let currentFilter = 'all';

  // Notification
  function showNotification(message, duration = 3000) {
    notification.textContent = message;
    notification.classList.remove('hidden');

    setTimeout(() => {
      notification.classList.add('hidden');
      notification.textContent = '';
    }, duration);
  }

  // LocalStorage
  function saveToLocal() {
    localStorage.setItem('todo-data', JSON.stringify(todos));
  }

  function loadFromLocal() {
    const stored = localStorage.getItem('todo-data');
    if (stored) todos = JSON.parse(stored);
  }

  // Render Todos
  function renderTodos() {
    todoList.innerHTML = '';
    const filtered = todos.filter(todo => currentFilter === 'all' || todo.status === currentFilter);
    if (filtered.length === 0) {
      todoList.innerHTML = `<tr><td colspan="4" class="empty">No task found</td></tr>`;
      return;
    }

    filtered.forEach((todo, index) => {
      const tr = document.createElement('tr');
      const taskTd = document.createElement('td');
      taskTd.textContent = todo.task;

      const dateTd = document.createElement('td');
      dateTd.textContent = todo.date;

      const statusTd = document.createElement('td');
      const status = document.createElement('span');
      status.className = `status ${todo.status === 'finished' ? 'finished' : ''}`;
      status.textContent = todo.status === 'finished' ? 'Finished' : 'On Progress';
      statusTd.appendChild(status);

      const actionTd = document.createElement('td');
      const checkBtn = document.createElement('button');
      checkBtn.textContent = '✓';
      checkBtn.className = 'check-btn';
      checkBtn.disabled = todo.status === 'finished';
      checkBtn.onclick = () => {
        todos[index].status = 'finished';
        saveToLocal();
        renderTodos();
      };

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'X';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = () => {
        todos.splice(index, 1);
        saveToLocal();
        renderTodos();
      };

      actionTd.append(checkBtn, deleteBtn);
      tr.append(taskTd, dateTd, statusTd, actionTd);
      todoList.appendChild(tr);
    });
  }

  // Add Task
  function addTask() {
    const task = todoInput.value.trim();
    const date = todoDate.value;

    if (!task || !date) {
      showNotification('Please fill in both fields!');
      return;
    }

    const now = new Date();
    const selectedDate = new Date(date);
    now.setHours(0, 0, 0, 0);
    if (selectedDate < now) {
      showNotification('Tanggal tidak boleh di masa lalu!');
      return;
    }

    todos.push({ task, date, status: 'progress' });
    saveToLocal();
    renderTodos();
    todoInput.value = '';
    todoDate.value = '';
  }

  // Add Button
  addBtn.addEventListener('click', addTask);
  todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
  todoDate.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

  // Delete All Modal
  deleteAllBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    trapFocusInModal();
  });

  confirmDelete.addEventListener('click', () => {
    todos = [];
    saveToLocal();
    renderTodos();
    modal.classList.add('hidden');
  });

  cancelDelete.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Trap focus in modal
  function trapFocusInModal() {
    const elements = [confirmDelete, cancelDelete];
    let currentIndex = 0;
    elements[0].focus();

    function handleModalKeys(e) {
      if (e.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % elements.length;
        elements[currentIndex].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'Tab') {
        e.preventDefault();
        currentIndex = (currentIndex - 1 + elements.length) % elements.length;
        elements[currentIndex].focus();
      } else if (e.key === 'Enter') {
        elements[currentIndex].click();
      } else if (e.key === 'Escape') {
        modal.classList.add('hidden');
        document.removeEventListener('keydown', handleModalKeys);
      }
    }

    document.addEventListener('keydown', handleModalKeys);
  }

  // Filter Dropdown
  filterBtn.addEventListener('click', () => {
    filterMenu.classList.toggle('hidden');
    if (!filterMenu.classList.contains('hidden')) {
      const options = Array.from(filterMenu.querySelectorAll('div'));
      let currentOption = 0;
      options[currentOption].focus();

      function handleFilterKeys(e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          currentOption = (currentOption + 1) % options.length;
          options[currentOption].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          currentOption = (currentOption - 1 + options.length) % options.length;
          options[currentOption].focus();
        } else if (e.key === 'Enter') {
          const selected = options[currentOption];
          currentFilter = selected.getAttribute('data-value');
          filterBtn.textContent = `FILTER: ${selected.textContent}`;
          filterMenu.classList.add('hidden');
          renderTodos();
          document.removeEventListener('keydown', handleFilterKeys);
        } else if (e.key === 'Escape') {
          filterMenu.classList.add('hidden');
          document.removeEventListener('keydown', handleFilterKeys);
        }
      }

      document.addEventListener('keydown', handleFilterKeys);
    }
  });

  // Filter click support (mouse)
  filterMenu.querySelectorAll('div').forEach(option => {
    option.setAttribute('tabindex', '0');
    option.addEventListener('click', () => {
      currentFilter = option.getAttribute('data-value');
      filterBtn.textContent = `FILTER: ${option.textContent}`;
      filterMenu.classList.add('hidden');
      renderTodos();
    });
  });

  // Init
  loadFromLocal();
  renderTodos();
});
