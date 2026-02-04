class AxiomChat extends HTMLElement {
    constructor() {
        super();
        this.messages = [];
        this.isProcessing = false;
    }
    
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.render();
        this.setupEventListeners();
        this.loadMessages();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #0f172a;
                }
                
                .chat-header {
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(8px);
                }
                
                .header-title {
                    font-weight: 600;
                    color: #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .header-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .btn-icon {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: transparent;
                    border: none;
                }
                
                .btn-icon:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #e2e8f0;
                }
                
                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .message {
                    display: flex;
                    gap: 12px;
                    max-width: 90%;
                    animation: slideIn 0.3s ease-out;
                }
                
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .message.user {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }
                
                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-weight: 600;
                    font-size: 12px;
                }
                
                .message.assistant .message-avatar {
                    background: linear-gradient(135deg, #6366f1, #10b981);
                    color: white;
                }
                
                .message.user .message-avatar {
                    background: #334155;
                    color: #e2e8f0;
                }
                
                .message-content {
                    background: rgba(30, 41, 59, 0.6);
                    border: 1px solid rgba(148, 163, 184, 0.1);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: #e2e8f0;
                    line-height: 1.6;
                    font-size: 14px;
                }
                
                .message.user .message-content {
                    background: rgba(99, 102, 241, 0.15);
                    border-color: rgba(99, 102, 241, 0.2);
                }
                
                .message-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 4px;
                    font-size: 11px;
                    color: #64748b;
                }
                
                .thinking-indicator {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #818cf8;
                    font-size: 12px;
                    padding: 8px 12px;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 8px;
                    width: fit-content;
                }
                
                .dot {
                    width: 6px;
                    height: 6px;
                    background: currentColor;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out;
                }
                
                .dot:nth-child(1) { animation-delay: -0.32s; }
                .dot:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
                
                .input-container {
                    padding: 16px 24px 24px;
                    border-top: 1px solid rgba(148, 163, 184, 0.1);
                }
                
                .input-wrapper {
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                    background: rgba(30, 41, 59, 0.6);
                    border: 1px solid rgba(148, 163, 184, 0.2);
                    border-radius: 16px;
                    padding: 12px 16px;
                    transition: all 0.2s;
                }
                
                .input-wrapper:focus-within {
                    border-color: rgba(99, 102, 241, 0.5);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }
                
                textarea {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #e2e8f0;
                    font-size: 14px;
                    line-height: 1.5;
                    resize: none;
                    max-height: 200px;
                    font-family: inherit;
                    outline: none;
                }
                
                textarea::placeholder {
                    color: #475569;
                }
                
                .input-actions {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                
                .btn-send {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #6366f1;
                    color: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-send:hover {
                    background: #4f46e5;
                    transform: scale(1.05);
                }
                
                .btn-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .tool-call {
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 8px;
                    padding: 8px 12px;
                    margin-top: 8px;
                    font-size: 12px;
                    font-family: 'JetBrains Mono', monospace;
                    color: #34d399;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .welcome-screen {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 24px;
                    color: #64748b;
                }
                
                .welcome-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #e2e8f0;
                    margin-bottom: 8px;
                    background: linear-gradient(135deg, #e2e8f0, #818cf8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .suggestions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: center;
                    margin-top: 24px;
                    max-width: 600px;
                }
                
                .suggestion-chip {
                    padding: 8px 16px;
                    background: rgba(30, 41, 59, 0.6);
                    border: 1px solid rgba(148, 163, 184, 0.1);
                    border-radius: 20px;
                    font-size: 13px;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .suggestion-chip:hover {
                    background: rgba(99, 102, 241, 0.1);
                    border-color: rgba(99, 102, 241, 0.3);
                    color: #e2e8f0;
                }
            </style>
            
            <div class="chat-header">
                <div class="header-title">
                    <i data-feather="message-circle" width="18" height="18"></i>
                    <span>Agent Chat</span>
                </div>
                <div class="header-actions">
                    <button class="btn-icon" title="Clear chat" id="clearBtn">
                        <i data-feather="trash-2" width="16" height="16"></i>
                    </button>
                    <button class="btn-icon" title="Export" id="exportBtn">
                        <i data-feather="download" width="16" height="16"></i>
                    </button>
                </div>
            </div>
            
            <div class="messages-container" id="messagesContainer">
                ${this.messages.length === 0 ? `
                    <div class="welcome-screen">
                        <div class="welcome-title">Welcome to Axiom Mobile</div>
                        <p>Your personal AI assistant. Ask me anything, have me code, research, or manage tasks.</p>
                        
                        <div class="suggestions">
                            <div class="suggestion-chip" data-prompt="Create a React component for a todo list">Create a todo app</div>
                            <div class="suggestion-chip" data-prompt="Research the latest in quantum computing">Research quantum computing</div>
                            <div class="suggestion-chip" data-prompt="Plan my week with focus on deep work">Plan my week</div>
                            <div class="suggestion-chip" data-prompt="Review this code for bugs">Review code</div>
                            <div class="suggestion-chip" data-prompt="Remember that my API key is xyz">Save to memory</div>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="input-container">
                <div class="input-wrapper">
                    <textarea 
                        id="messageInput" 
                        placeholder="Ask Axiom anything..." 
                        rows="1"
                        ${this.isProcessing ? 'disabled' : ''}
                    ></textarea>
                    <div class="input-actions">
                        <button class="btn-icon" title="Attach file" id="attachBtn">
                            <i data-feather="paperclip" width="18" height="18"></i>
                        </button>
                        <button class="btn-send" id="sendBtn" ${this.isProcessing ? 'disabled' : ''}>
                            <i data-feather="arrow-up" width="18" height="18"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        feather.replace();
        this.scrollToBottom();
    }
    
    setupEventListeners() {
        const input = this.shadowRoot.getElementById('messageInput');
        const sendBtn = this.shadowRoot.getElementById('sendBtn');
        
        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 200) + 'px';
        });
        
        // Send on Enter (Shift+Enter for new line)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Suggestion chips
        this.shadowRoot.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                input.value = chip.dataset.prompt;
                this.sendMessage();
            });
        });
        
        // Clear chat
        this.shadowRoot.getElementById('clearBtn').addEventListener('click', () => {
            this.messages = [];
            this.render();
            localforage.removeItem('chat_messages');
        });
        
        // Listen for agent responses
        window.AxiomBus.on('agent:thinking:start', () => {
            this.isProcessing = true;
            this.showThinking();
            this.render();
        });
        
        window.AxiomBus.on('agent:response', ({ response }) => {
            this.isProcessing = false;
            this.hideThinking();
            this.addMessage('assistant', response.content, response);
        });
        
        window.AxiomBus.on('agent:tool:start', ({ tool, action }) => {
            this.addToolCall(tool, action);
        });
    }
    
    async sendMessage() {
        const input = this.shadowRoot.getElementById('messageInput');
        const text = input.value.trim();
        
        if (!text || this.isProcessing) return;
        
        this.addMessage('user', text);
        input.value = '';
        input.style.height = 'auto';
        
        // Process through agent
        await window.Agent.processMessage(text);
    }
    
    addMessage(role, content, meta = null) {
        const message = {
            id: Date.now(),
            role,
            content,
            meta,
            timestamp: new Date().toISOString()
        };
        
        this.messages.push(message);
        this.saveMessages();
        
        // If not showing welcome screen, append to DOM
        const container = this.shadowRoot.getElementById('messagesContainer');
        if (container && !container.querySelector('.welcome-screen')) {
            const msgEl = this.createMessageElement(message);
            container.appendChild(msgEl);
            this.scrollToBottom();
        } else {
            this.render(); // First message, re-render to remove welcome
        }
    }
    
    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message ${message.role}`;
        
        const avatar = message.role === 'user' ? 'You' : 'AI';
        const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let contentHtml = '';
        if (message.meta?.type === 'skill_result') {
            contentHtml = `
                <div class="tool-call">
                    <i data-feather="zap" width="14" height="14"></i>
                    <span>Used ${message.meta.skill}</span>
                </div>
                <div style="margin-top: 8px;">${this.formatContent(message.content)}</div>
            `;
        } else {
            contentHtml = this.formatContent(message.content);
        }
        
        div.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div>
                <div class="message-content">
                    ${contentHtml}
                </div>
                <div class="message-meta">
                    <span>${time}</span>
                    ${message.role === 'assistant' ? '<span>• Axiom Agent</span>' : ''}
                </div>
            </div>
        `;
        
        return div;
    }
    
    formatContent(content) {
        // Convert markdown to HTML safely
        if (typeof marked !== 'undefined') {
            const raw = marked.parse(content);
            return DOMPurify ? DOMPurify.sanitize(raw) : raw;
        }
        return content.replace(/\n/g, '<br>');
    }
    
    showThinking() {
        const container = this.shadowRoot.getElementById('messagesContainer');
        const existing = container.querySelector('.thinking-indicator');
        if (existing) return;
        
        const div = document.createElement('div');
        div.className = 'thinking-indicator';
        div.innerHTML = `
            <span>Thinking</span>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;
        container.appendChild(div);
        this.scrollToBottom();
    }
    
    hideThinking() {
        const indicator = this.shadowRoot.querySelector('.thinking-indicator');
        if (indicator) indicator.remove();
    }
    
    addToolCall(tool, action) {
        const container = this.shadowRoot.getElementById('messagesContainer');
        const lastMsg = container.lastElementChild;
        
        if (lastMsg && lastMsg.classList.contains('assistant')) {
            const toolDiv = document.createElement('div');
            toolDiv.className = 'tool-call';
            toolDiv.innerHTML = `
                <i data-feather="tool" width="14" height="14"></i>
                <span>Running ${tool}.${action}...</span>
            `;
            const content = lastMsg.querySelector('.message-content');
            if (content) content.appendChild(toolDiv);
            feather.replace();
        }
    }
    
    scrollToBottom() {
        const container = this.shadowRoot.getElementById('messagesContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }
    
    async saveMessages() {
        await localforage.setItem('chat_messages', this.messages);
    }
    
    async loadMessages() {
        const saved = await localforage.getItem('chat_messages');
        if (saved && saved.length > 0) {
            this.messages = saved;
            this.render();
            // Restore messages to DOM
            const container = this.shadowRoot.getElementById('messagesContainer');
            if (container) {
                container.innerHTML = '';
                this.messages.forEach(msg => {
                    container.appendChild(this.createMessageElement(msg));
                });
                this.scrollToBottom();
            }
        }
    }
}

customElements.define('axiom-chat', AxiomChat);