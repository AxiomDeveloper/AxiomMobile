import { Agent } from '../core/agent.js';

class ChatPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="h-full flex flex-col bg-surface-900">
        <div id="chat-messages" class="flex-1 p-6 overflow-y-auto space-y-6"></div>

        <div class="p-6 border-t border-gray-800 bg-surface-900">
          <div class="flex gap-3 max-w-4xl mx-auto">
            <textarea id="chat-input" rows="1" placeholder="Ask anything... (Shift+Enter for new line)"
              class="flex-1 bg-surface-800 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
            <button id="send-btn" class="px-6 bg-primary-600 hover:bg-primary-700 rounded-xl font-medium transition">
              Send
            </button>
          </div>
        </div>
      </div>
    `;

    this.setup();
  }

  setup() {
    const input = this.querySelector('#chat-input');
    const sendBtn = this.querySelector('#send-btn');
    const messages = this.querySelector('#chat-messages');

    const addMessage = (content, isUser = false) => {
      const msg = document.createElement('div');
      msg.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
      msg.innerHTML = `
        <div class="max-w-3xl ${isUser ? 'bg-primary-600 text-white' : 'bg-surface-800'} rounded-2xl px-5 py-3.5">
          ${marked.parse(DOMPurify.sanitize(content))}
        </div>
      `;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    };

    const send = async () => {
      const text = input.value.trim();
      if (!text) return;
      addMessage(text, true);
      input.value = '';

      addMessage("Thinking...");
      const reply = await Agent.processMessage(text);
      messages.lastElementChild.remove();
      addMessage(reply.content);
    };

    sendBtn.onclick = send;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    });
  }
}

customElements.define('chat-panel', ChatPanel);