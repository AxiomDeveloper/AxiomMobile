class AxiomSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <aside class="w-[var(--sidebar-width)] bg-surface-900 border-r border-gray-800 h-full flex flex-col items-center py-6 gap-8">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center font-bold text-white shadow-lg">
          A
        </div>

        <nav class="flex flex-col gap-6">
          <button data-panel="chat" class="sidebar-btn active text-primary-500" title="Chat">
            <i data-feather="message-circle" class="w-6 h-6"></i>
          </button>
          <button data-panel="ide" class="sidebar-btn" title="IDE">
            <i data-feather="code" class="w-6 h-6"></i>
          </button>
          <button data-panel="tasks" class="sidebar-btn" title="Tasks">
            <i data-feather="check-square" class="w-6 h-6"></i>
          </button>
          <button data-panel="browser" class="sidebar-btn" title="Browser" disabled>
            <i data-feather="globe" class="w-6 h-6"></i>
          </button>
          <button data-panel="memory" class="sidebar-btn" title="Memory" disabled>
            <i data-feather="database" class="w-6 h-6"></i>
          </button>
          <button data-panel="skills" class="sidebar-btn" title="Skills" disabled>
            <i data-feather="zap" class="w-6 h-6"></i>
          </button>
        </nav>

        <div class="mt-auto flex flex-col gap-4">
          <button id="cmd-palette-btn" class="sidebar-btn" title="Command Palette (Ctrl+K)">
            <i data-feather="command" class="w-6 h-6"></i>
          </button>
          <button id="theme-toggle" class="sidebar-btn" title="Toggle theme">
            <i data-feather="moon" class="w-6 h-6"></i>
          </button>
        </div>
      </aside>
    `;

    this.setupListeners();
  }

  setupListeners() {
    this.querySelectorAll('[data-panel]').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.panel;
        window.AxiomBus.emit('panel:switch', panel);
        this.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active', 'text-primary-500'));
        btn.classList.add('active', 'text-primary-500');
      });
    });

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const icon = this.querySelector('#theme-toggle i');
      icon.setAttribute('data-feather', document.documentElement.classList.contains('dark') ? 'moon' : 'sun');
      feather.replace();
    });
  }
}

customElements.define('axiom-sidebar', AxiomSidebar);