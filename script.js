// Global event bus
window.AxiomBus = {
  listeners: {},
  on(event, callback) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);
  },
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
};

// Simple state persistence stub (expand with localForage later)
window.AxiomState = {
  async get(key) {
    return localforage.getItem(key);
  },
  async set(key, value) {
    return localforage.setItem(key, value);
  }
};

// Agent stub – replace with real LLM/tool integration
window.Agent = {
  async processMessage(msg) {
    // Simulate delay + response
    return {
      content: `Agent received: "${msg}"\n\n(This is a placeholder. Connect to Grok / OpenAI / Ollama here.)`
    };
  }
};

// Command Palette stub (expand later)
class CommandPalette {
  constructor() {
    // You can implement Ctrl+K palette here
  }
}

console.log("Axiom Mobile core initialized");