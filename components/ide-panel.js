// components/ide-panel.js (enhanced for agentic coding)
class IdePanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="h-full flex flex-col">
        <div class="border-b border-surface-700 p-4 flex items-center gap-4 bg-surface-900">
          <span class="font-mono text-muted">main.js</span>
          <button class="bg-primary-600 px-4 py-1 rounded-lg hover:bg-primary-700">Run</button>
        </div>
        <div id="monaco-container" class="flex-1"></div>
      </div>
    `;
    this.initEditor();
  }

  async initEditor() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
    require(['vs/editor/editor.main'], () => {
      monaco.editor.create(this.querySelector('#monaco-container'), {
        value: '// Agentic IDE - write code, run with agent tools\nconsole.log("Hello Axiom");',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        fontFamily: 'JetBrains Mono',
        fontSize: 14,
        minimap: { enabled: false }
      });
    });
  }
}

customElements.define('ide-panel', IdePanel);