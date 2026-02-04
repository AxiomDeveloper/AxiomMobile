export const Agent = {
  async processMessage(msg) {
    // Simulate delay + response (replace with real LLM later)
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      content: `Agent received: "${msg}"\n\n(This is a placeholder. Connect to Grok / OpenAI / Ollama here.)`
    };
  }
};

console.log("Agent initialized");