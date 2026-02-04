// components/chat-panel.js (enhanced with thinking animation)
import { Agent } from '../core/agent.js';

class ChatPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="h-full flex flex-col">
        <div id="chat-messages" class="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full"></div>
        <div id="chat-input-container" class="p-6 border-t border-surface-700">
          <div class="relative max-w-4xl mx-auto">
            <textarea id="chat-input" rows="1" placeholder="Ask the agent..." class="w-full pr-24"></textarea>
            <button id="send-btn" class="absolute right-3 top-1/2 -translate-y-1/2">Send</button>
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
      const div = document.createElement('div');
      div.className = `chat-bubble ${isUser ? 'user-bubble' : 'agent-bubble'}`;
      div.innerHTML = DOMPurify.sanitize(marked.parse(content));
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    };

    const addThinking = () => {
      const div = document.createElement('div');
      div.className = 'agent-bubble thinking';
      div.innerHTML = '<div class="flex gap-1"><div class="thinking-dot"></div><div class="thinking-dot"></div><div class="thinking-dot"></div></div>';
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    };

    sendBtn.addEventListener('click', async () => {
      const text = input.value.trim();
      if (!text) return;
      addMessage(text, true);
      input.value = '';
      input.style.height = 'auto';

      const thinkingEl = addThinking();
      const reply = await Agent.processMessage(text);
      thinkingEl.remove();
      addMessage(reply.content);
    });

    input.addEventListener('keypress', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight}px`;
    });
  }
}

customElements.define('chat-panel', ChatPanel);