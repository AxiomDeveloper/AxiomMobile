class AxiomIde extends HTMLElement {
    constructor() {
        super();
        this.files = [];
        this.activeFile = null;
        this.editor = null;
    }
    
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.render();
        this.initEditor();
        this.loadFiles();
        this.setupListeners();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    height: 100%;
                    background: #0f172a;
                }
                
                .sidebar {
                    width: 240px;
                    background: rgba(15, 23, 42, 0.6);
                    border-right: 1px solid rgba(148, 163, 184, 0.1);
                    display: flex;
                    flex-direction: column;
                }
                
                .sidebar-header {
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
                    font-weight: 600;
                    color: #e2e8f0;
                    font-size: 13px;
                }
                
                .btn-icon-small {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: transparent;
                    border: none;
                }
                
                .btn-icon-small:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #e2e8f0;
                }
                
                .file-tree {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }
                
                .file-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 8px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    color: #94a3b8;
                    transition: all 0.2s;
                    margin-bottom: 2px;
                }
                
                .file-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #e2e8f0;
                }
                
                .file-item.active {
                    background: rgba(99, 102, 241, 0.15);
                    color: #818cf8;
                }
                
                .file-icon {
                    width: 16px;
                    height: 16px;
                    opacity: 0.8;
                }
                
                .editor-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .tabs {
                    height: 36px;
                    background: rgba(15, 23, 42, 0.8);
                    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
                    display: flex;
                    overflow-x: auto;
                    scrollbar-width: none;
                }
                
                .tabs::-webkit-scrollbar {
                    display: none;
                }
                
                .tab {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 12px;
                    font-size: 12px;
                    color: #64748b;
                    border-right: 1px solid rgba(148, 163, 184, 0.1);
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 120px;
                    max-width: 200px;
                }
                
                .tab:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                
                .tab.active {
                    background: rgba(30, 41, 59, 0.6);
                    color: #e2e8f0;
                    border-top: 2px solid #6366f1;
                }
                
                .tab-close {
                    opacity: 0;
                    transition: opacity 0.2s;
                    margin-left: auto;
                }
                
                .tab:hover .tab-close,
                .tab.active .tab-close {
                    opacity: 1;
                }
                
                .tab-close:hover {
                    color: #ef4444;
                }
                
                .editor-wrapper {
                    flex: 1;
                    position: relative;
                }
                
                #monacoEditor {
                    position: absolute;
                    inset: 0;
                }
                
                .empty-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #475569;
                    gap: 16px;
                }
                
                .empty-icon {
                    width: 64px;
                    height: 64px;
                    background: rgba(30, 41, 59, 0.6);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                }
                
                @media (max-width: 768px) {
                    .sidebar {
                        position: absolute;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        z-index: 50;
                        transform: translateX(-100%);
                        transition: transform 0.3s;
                    }
                    
                    .sidebar.open {
                        transform: translateX(0);
                    }
                }
            </style>
            
            <div class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <span>Explorer</span>
                    <div style="display: flex; gap: 4px;">
                        <button class="btn-icon-small" id="newFileBtn" title="New File">
                            <i data-feather="file-plus" width="14" height="14"></i>
                        </button>
                        <button class="btn-icon-small" id="newFolderBtn" title="New Folder">
                            <i data-feather="folder-plus" width="14" height="14"></i>
                        </button>
                        <button class="btn-icon-small" id="refreshBtn" title="Refresh">
                            <i data-feather="refresh-cw" width="14" height="14"></i>
                        </button>
                    </div>
                </div>
                <div class="file-tree" id="fileTree">
                    <!-- Files populated dynamically -->
                </div>
            </div>
            
            <div class="editor-container">
                <div class="tabs" id="tabs">
                    <!-- Tabs populated dynamically -->
                </div>
                <div class="editor-wrapper">
                    <div id="monacoEditor"></div>
                    <div class="empty-state" id="emptyState">
                        <div class="empty-icon">
                            <i data-feather="code" width="32" height="32"></i>
                        </div>
                        <div>Select a file to edit</div>
                        <div style="font-size: 13px; color: #64748b;">or create a new file</div>
                    </div>
                </div>
            </div>
        `;
        
        feather.replace();
    }
    
    async