import { AxiomState } from '../core/state.js';

class TaskPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="h-full p-8 bg-surface-900 overflow-y-auto">
        <h1 class="text-2xl font-bold mb-8">Tasks & Goals</h1>
        
        <ul id="task-list" class="space-y-4 mb-10"></ul>

        <div class="max-w-2xl">
          <input id="new-task-input" type="text" placeholder="Add a new task or goal..." 
                 class="w-full bg-surface-800 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3">
          <button id="add-task-btn" class="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-xl font-medium">
            Add Task
          </button>
        </div>
      </div>
    `;

    this.loadTasks();
    this.setup();
  }

  async loadTasks() {
    const tasks = await AxiomState.get('tasks') || [];
    const list = this.querySelector('#task-list');
    list.innerHTML = tasks.length ? tasks.map(t => `
      <li class="flex items-center gap-4 p-4 bg-surface-800 rounded-xl">
        <input type="checkbox" ${t.done ? 'checked' : ''} class="w-5 h-5 accent-primary-500">
        <span class="${t.done ? 'line-through text-gray-500' : ''}">${t.title}</span>
      </li>
    `).join('') : '<p class="text-gray-500">No tasks yet. Add one above!</p>';
  }

  setup() {
    const input = this.querySelector('#new-task-input');
    const btn = this.querySelector('#add-task-btn');

    btn.onclick = async () => {
      const title = input.value.trim();
      if (!title) return;

      let tasks = await AxiomState.get('tasks') || [];
      tasks.push({ title, done: false });
      await AxiomState.set('tasks', tasks);

      input.value = '';
      this.loadTasks();
    };

    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') btn.click();
    });
  }
}

customElements.define('task-panel', TaskPanel);