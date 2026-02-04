class AppShell extends HTMLElement {
  constructor() {
    super();
    this.currentPanel = 'chat';
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="flex h-screen">
        <axiom-sidebar></axiom-sidebar>

        <div class="flex-1 flex flex-col overflow-hidden">
          <header class="h-14 bg-surface-900 border-b border-gray-800 px-6 flex items-center justify-between">
            <div class="text-lg font-semibold">Axiom Mobile</div>
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <span>Agent ready</span>
            </div>
          </header>

          <main class="flex-1 relative overflow-hidden">
            <chat-panel class="panel absolute inset-0 ${this.currentPanel === 'chat' ? 'active' : ''}"></chat-panel>
            <ide-panel   class="panel absolute inset-0 ${this.currentPanel === 'ide'  ? 'active' : ''}"></ide-panel>
            <task-panel  class="panel absolute inset-0 ${this.currentPanel === 'tasks'? 'active' : ''}"></task-panel>
            <!-- Add more panels here as needed -->
          </main>
        </div>
      </div>
    `;

    window.AxiomBus.on('panel:switch', (panel) => {
      this.currentPanel = panel;
      this.querySelectorAll('.panel').forEach(el => {
        el.classList.toggle('active', el.tagName.toLowerCase() === `${panel}-panel`);
      });
    });
  }
}

customElements.define('app-shell', AppShell);