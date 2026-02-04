class IdePanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="h-full bg-surface-900 flex flex-col">
        <div class="h-12 border-b border-gray-800 px-6 flex items-center justify-between bg-surface-800">
          <div class="flex items-center gap-4">
            <span class="font-mono text-sm text-gray-300">main.js</span>
          </div>
          <button class="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 rounded text-sm">Run</button>
        </div>
        <div id="monaco-editor" class="flex-1"></div>
      </div>
    `;

    this.initEditor();
  }

  async initEditor() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

    require(['vs/editor/editor.main'], () => {
      monaco.editor.defineTheme('axiomDark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: { 'editor.background': '#0f172a' }
      });

      monaco.editor.create(this.querySelector('#monaco-editor'), {
        value: '// Welcome to Axiom IDE\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Agent"));\n',
        language: 'javascript',
        theme: 'axiomDark',
        automaticLayout: true,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 14,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false
      });
    });
  }
}

customElements.define('ide-panel', IdePanel);