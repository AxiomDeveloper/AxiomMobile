class AppShell extends HTMLElement {
    constructor() {
        super();
        this.currentPanel = 'chat';
    }
    
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.render();
        this.setupEventListeners();
        this.loadMonaco();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    height: 100vh;
                    width: 100vw;
                    overflow: hidden;
                }
                
                .app-container {
                    display: flex;
                    height: 100%;
                    width: 100%;
                    background: #020617;
                }
                
                .main-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative;
                }
                
                .panel-container {
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                }
                
                .status-bar {
                    height: 28px;
                    background: rgba(15, 23, 42, 0.9);
                    border-top: 1px solid rgba(148, 163, 184, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 12px;
                    font-size: 12px;
                    color: #64748b;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .status-left, .status-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                
                .status-item:hover {
                    color: #e2e8f0;
                }
                
                .panel {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }
                
                .panel.active {
                    opacity: 1;
                    pointer-events: all;
                }
                
                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .sidebar-container {
                        position: fixed;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        z-index: 100;
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                    }
                    
                    .sidebar-container.open {
                        transform: translateX(0);
                    }
                    
                    .mobile-overlay {
                        display: none;
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.5);
                        z-index: 99;
                    }
                    
                    .mobile-overlay.active {
                        display: block;
                    }
                }
            </style>
            
            <div class="app-container">
                <div class="sidebar-container" id="sidebarContainer">
                    <axiom-sidebar></axiom-sidebar>
                </div>
                <div class="mobile-overlay" id="mobileOverlay"></div>
                
                <div class="main-content">
                    <div class="panel-container">
                        <div class="panel ${this.currentPanel === 'chat' ? 'active' : ''}" id="panel-chat">
                            <axiom-chat></axiom-chat>
                        </div>
                        <div class="panel ${this.currentPanel === 'ide' ? 'active' : ''}" id="panel-ide">
                            <axiom-ide></axiom-ide>
                        </div>
                        <div class="panel ${this.currentPanel === 'browser' ? 'active' : ''}" id="panel-browser">
                            <axiom-browser></axiom-browser>
                        </div>
                        <div class="panel ${this.currentPanel === 'tasks' ? 'active' : ''}" id="panel-tasks">
                            <axiom-tasks></axiom-tasks>
                        </div>
                        <div class="panel ${this.currentPanel === 'memory' ? 'active' : ''}" id="panel-memory">
                            <axiom-memory></axiom-memory>
                        </div>
                        <div class="panel ${this.currentPanel === 'skills' ? 'active' : ''}" id="panel-skills">
                            <axiom-skills></axiom-skills>
                        </div>
                    </div>
                    
                    <div class="status-bar">
                        <div class="status-left">
                            <div class="status-item" id="branchBtn">
                                <i data-feather="git-branch" class="w-3 h-3"></i>
                                <span>main</span>
                            </div>
                            <div class="status-item" id="errorsBtn">
                                <i data-feather="alert-circle" class="w-3 h-3"></i>
                                <span>0</span>
                            </div>
                            <div class="status-item" id="warningsBtn">
                                <i data-feather="alert-triangle" class="w-3 h-3"></i>
                                <span>0</span>
                            </div>
                        </div>
                        <div class="status-right">
                            <div class="status-item" id="agentStatus">
                                <span class="status-dot ${window.AxiomState.get('agentStatus') === 'idle' ? 'status-idle' : 'status-busy'}"></span>
                                <span>${window.AxiomState.get('agentStatus')}</span>
                            </div>
                            <div class="status-item">
                                <span>Ln 1, Col 1</span>
                            </div>
                            <div class="status-item">
                                <span>UTF-8</span>
                            </div>
                            <div class="status-item" id="settingsBtn">
                                <i data-feather="settings" class="w-3 h-3"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        feather.replace();
    }
    
    setupEventListeners() {
        // Panel switching
        window.AxiomBus.on('panel:switch', (panel) => {
            this.switchPanel(panel);
        });
        
        // Mobile sidebar toggle
        window.AxiomBus.on('sidebar:toggle', () => {
            const sidebar = this.shadowRoot.getElementById('sidebarContainer');
            const overlay = this.shadowRoot.getElementById('mobileOverlay');
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
        
        this.shadowRoot.getElementById('mobileOverlay').addEventListener('click', () => {
            window.AxiomBus.emit('sidebar:toggle');
        });
        
        // Agent status updates
        window.AxiomBus.on('state:agentStatus', (status) => {
            const dot = this.shadowRoot.querySelector('.status-dot');
            const label = this.shadowRoot.querySelector('#agentStatus span:last-child');
            if (dot && label) {
                dot.className = `status-dot status-${status}`;
                label.textContent = status;
            }
        });
        
        // Settings button
        this.shadowRoot.getElementById('settingsBtn').addEventListener('click', () => {
            window.AxiomBus.emit('settings:open');
        });
    }
    
    switchPanel(panel) {
        this.currentPanel = panel;
        
        // Hide all panels
        const panels = this.shadowRoot.querySelectorAll('.panel');
        panels.forEach(p => p.classList.remove('active'));
        
        // Show selected
        const target = this.shadowRoot.getElementById(`panel-${panel}`);
        if (target) {
            target.classList.add('active');
            window.AxiomState.set('currentPanel', panel);
        }
        
        // Update sidebar selection
        window.AxiomBus.emit('sidebar:select', panel);
    }
    
    loadMonaco() {
        // Configure Monaco loader
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});
        
        window.MonacoEnvironment = {
            getWorkerUrl: function(workerId, label) {
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                    self.MonacoEnvironment = {
                        baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/'
                    };
                    importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/base/worker/workerMain.js');
                `)}`;
            }
        };
    }
}

customElements.define('app-shell', AppShell);