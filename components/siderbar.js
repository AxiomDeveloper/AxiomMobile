class AxiomSidebar extends HTMLElement {
    constructor() {
        super();
        this.selected = 'chat';
        this.items = [
            { id: 'chat', icon: 'message-square', label: 'Chat', shortcut: '⌘1' },
            { id: 'ide', icon: 'code', label: 'Editor', shortcut: '⌘2' },
            { id: 'browser', icon: 'globe', label: 'Browser', shortcut: '⌘3' },
            { id: 'tasks', icon: 'check-square', label: 'Tasks', shortcut: '⌘4' },
            { id: 'memory', icon: 'database', label: 'Memory', shortcut: '⌘5' },
            { id: 'skills', icon: 'zap', label: 'Skills', shortcut: '⌘6' }
        ];
    }
    
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.render();
        this.setupListeners();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    width: 64px;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.95);
                    border-right: 1px solid rgba(148, 163, 184, 0.1);
                    backdrop-filter: blur(12px);
                }
                
                .logo {
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
                }
                
                .logo-icon {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #6366f1, #10b981);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                
                .nav-items {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    padding: 12px 8px;
                    gap: 4px;
                }
                
                .nav-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }
                
                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #e2e8f0;
                }
                
                .nav-item.active {
                    background: rgba(99, 102, 241, 0.15);
                    color: #818cf8;
                }
                
                .nav-item.active::before {
                    content: '';
                    position: absolute;
                    left: -8px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 3px;
                    height: 20px;
                    background: #6366f1;
                    border-radius: 0 2px 2px 0;
                }
                
                .tooltip {
                    position: absolute;
                    left: 100%;
                    margin-left: 12px;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .tooltip::before {
                    content: '';
                    position: absolute;
                    left: -4px;
                    top: 50%;
                    transform: translateY(-50%);
                    border: 4px solid transparent;
                    border-right-color: rgba(0, 0, 0, 0.9);
                }
                
                .nav-item:hover .tooltip {
                    opacity: 1;
                }
                
                .shortcut {
                    color: #64748b;
                    font-size: 10px;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .bottom-actions {
                    padding: 12px 8px;
                    border-top: 1px solid rgba(148, 163, 184, 0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                @media (max-width: 768px) {
                    :host {
                        width: 240px;
                    }
                    
                    .nav-items {
                        padding: 16px;
                    }
                    
                    .nav-item {
                        width: 100%;
                        justify-content: flex-start;
                        padding: 0 16px;
                        gap: 12px;
                    }
                    
                    .nav-item.active::before {
                        left: 0;
                    }
                    
                    .tooltip {
                        display: none;
                    }
                    
                    .label {
                        display: block !important;
                    }
                }
            </style>
            
            <div class="logo">
                <div class="logo-icon">
                    <i data-feather="cpu" width="20" height="20"></i>
                </div>
            </div>
            
            <div class="nav-items">
                ${this.items.map(item => `
                    <div class="nav-item ${item.id === this.selected ? 'active' : ''}" 
                         data-panel="${item.id}"
                         title="${item.label}">
                        <i data-feather="${item.icon}" width="20" height="20"></i>
                        <span class="label hidden md:hidden lg:block ml-3">${item.label}</span>
                        <div class="tooltip">
                            <span>${item.label}</span>
                            <span class="shortcut">${item.shortcut}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="bottom-actions">
                <div class="nav-item" data-action="settings" title="Settings">
                    <i data-feather="settings" width="20" height="20"></i>
                    <span class="label hidden md:hidden lg:block ml-3">Settings</span>
                    <div class="tooltip">
                        <span>Settings</span>
                        <span class="shortcut">⌘,</span>
                    </div>
                </div>
                <div class="nav-item" data-action="profile" title="Profile">
                    <i data-feather="user" width="20" height="20"></i>
                    <span class="label hidden md:hidden lg:block ml-3">Profile</span>
                </div>
            </div>
        `;
        
        feather.replace();
    }
    
    setupListeners() {
        // Panel navigation
        this.shadowRoot.querySelectorAll('.nav-item[data-panel]').forEach(item => {
            item.addEventListener('click', (e) => {
                const panel = e.currentTarget.dataset.panel;
                window.AxiomBus.emit('panel:switch', panel);
                this.setSelected(panel);
            });
        });
        
        // Settings
        this.shadowRoot.querySelector('[data-action="settings"]').addEventListener('click', () => {
            window.AxiomBus.emit('settings:open');
        });
        
        // External updates
        window.AxiomBus.on('sidebar:select', (panel) => {
            this.setSelected(panel);
        });
    }
    
    setSelected(id) {
        this.selected = id;
        this.shadowRoot.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.panel === id);
        });
    }
}

customElements.define('axiom-sidebar', AxiomSidebar);