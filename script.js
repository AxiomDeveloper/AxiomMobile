/**
 * Axiom Mobile - Core Application Logic
 * Event Bus, State Management, and Agent Controller
 */

// Event Bus for decoupled communication
class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
}

// Global Event Bus
window.AxiomBus = new EventBus();

// State Management
class AxiomState {
    constructor() {
        this.store = {
            currentPanel: 'chat',
            activeFile: null,
            openFiles: [],
            messages: [],
            tasks: [],
            memories: [],
            skills: [],
            context: {
                currentProject: null,
                selectedText: null,
                browserUrl: null
            },
            agentStatus: 'idle', // idle, thinking, acting
            settings: {
                autoSave: true,
                theme: 'dark',
                fontSize: 14
            }
        };
        
        this.initStorage();
    }
    
    async initStorage() {
        // Initialize IndexedDB stores
        await localforage.config({
            driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
            name: 'AxiomMobile',
            version: 1.0,
            storeName: 'axiom_store',
            description: 'Axiom Mobile Local Storage'
        });
        
        // Load persisted state
        const saved = await localforage.getItem('appState');
        if (saved) {
            this.store = { ...this.store, ...saved };
        }
        
        // Setup auto-save
        setInterval(() => this.persist(), 5000);
    }
    
    get(key) {
        return key.split('.').reduce((obj, k) => obj?.[k], this.store);
    }
    
    set(key, value) {
        const keys = key.split('.');
        const last = keys.pop();
        const target = keys.reduce((obj, k) => {
            if (!obj[k]) obj[k] = {};
            return obj[k];
        }, this.store);
        
        target[last] = value;
        window.AxiomBus.emit('state:changed', { key, value });
        window.AxiomBus.emit(`state:${key}`, value);
    }
    
    persist() {
        localforage.setItem('appState', {
            messages: this.store.messages,
            tasks: this.store.tasks,
            memories: this.store.memories,
            settings: this.store.settings
        });
    }
}

// Global State
window.AxiomState = new AxiomState();

// Agent Core
class AgentCore {
    constructor() {
        this.tools = new Map();
        this.skills = new Map();
        this.registerCoreTools();
        this.registerCoreSkills();
    }
    
    registerCoreTools() {
        // File System Tool
        this.registerTool('file', {
            name: 'File System',
            description: 'Read, write, and manage files',
            actions: ['read', 'write', 'delete', 'list', 'create'],
            handler: async (action, params) => {
                switch(action) {
                    case 'write':
                        await localforage.setItem(`file:${params.path}`, params.content);
                        return { success: true, path: params.path };
                    case 'read':
                        const content = await localforage.getItem(`file:${params.path}`);
                        return { success: !!content, content, path: params.path };
                    case 'list':
                        const keys = await localforage.keys();
                        const files = keys.filter(k => k.startsWith('file:')).map(k => k.replace('file:', ''));
                        return { success: true, files };
                    default:
                        return { success: false, error: 'Unknown action' };
                }
            }
        });
        
        // Web Search Tool (Simulated)
        this.registerTool('search', {
            name: 'Web Search',
            description: 'Search the internet for information',
            handler: async (query) => {
                // In real implementation, this would use a search API
                // For demo, we simulate results
                await new Promise(r => setTimeout(r, 1000));
                return {
                    results: [
                        { title: `Results for "${query}"`, snippet: 'Simulated search result...', url: '#' }
                    ]
                };
            }
        });
        
        // Task Management Tool
        this.registerTool('task', {
            name: 'Task Manager',
            description: 'Create and manage tasks',
            actions: ['create', 'complete', 'list', 'update'],
            handler: async (action, params) => {
                const tasks = window.AxiomState.get('tasks') || [];
                switch(action) {
                    case 'create':
                        const task = {
                            id: Date.now(),
                            title: params.title,
                            description: params.description,
                            status: 'pending',
                            created: new Date().toISOString()
                        };
                        tasks.push(task);
                        window.AxiomState.set('tasks', tasks);
                        return { success: true, task };
                    case 'complete':
                        const idx = tasks.findIndex(t => t.id === params.id);
                        if (idx > -1) {
                            tasks[idx].status = 'completed';
                            window.AxiomState.set('tasks', tasks);
                            return { success: true };
                        }
                        return { success: false, error: 'Task not found' };
                    case 'list':
                        return { success: true, tasks };
                    default:
                        return { success: false };
                }
            }
        });
        
        // Memory Tool
        this.registerTool('memory', {
            name: 'Memory Store',
            description: 'Store and retrieve memories',
            actions: ['save', 'recall', 'search'],
            handler: async (action, params) => {
                const memories = window.AxiomState.get('memories') || [];
                switch(action) {
                    case 'save':
                        const memory = {
                            id: Date.now(),
                            content: params.content,
                            tags: params.tags || [],
                            timestamp: new Date().toISOString()
                        };
                        memories.push(memory);
                        window.AxiomState.set('memories', memories);
                        return { success: true, memory };
                    case 'search':
                        const results = memories.filter(m => 
                            m.content.includes(params.query) || 
                            m.tags.some(t => t.includes(params.query))
                        );
                        return { success: true, memories: results };
                    default:
                        return { success: false };
                }
            }
        });
    }
    
    registerCoreSkills() {
        // Code Assistant Skill
        this.registerSkill('code-assistant', {
            name: 'Code Assistant',
            description: 'Helps with coding, debugging, and code review',
            triggers: ['code', 'function', 'bug', 'error', 'refactor', 'optimize'],
            tools: ['file'],
            handler: async (context) => {
                return {
                    action: 'code_help',
                    suggestions: ['Analyze code structure', 'Check for errors', 'Suggest improvements']
                };
            }
        });
        
        // Research Skill
        this.registerSkill('researcher', {
            name: 'Web Researcher',
            description: 'Researches topics across multiple sources',
            triggers: ['research', 'find', 'search', 'learn about', 'explain'],
            tools: ['search', 'memory'],
            handler: async (query) => {
                const searchResults = await this.useTool('search', query);
                // Store findings in memory
                await this.useTool('memory', 'save', {
                    content: `Research on ${query}: ${JSON.stringify(searchResults)}`,
                    tags: ['research', 'auto']
                });
                return searchResults;
            }
        });
        
        // Task Planner Skill
        this.registerSkill('planner', {
            name: 'Task Planner',
            description: 'Breaks down goals into actionable tasks',
            triggers: ['plan', 'todo', 'task', 'goal', 'organize'],
            tools: ['task'],
            handler: async (goal) => {
                // Simple task breakdown simulation
                const subtasks = [
                    `Research ${goal}`,
                    `Plan approach for ${goal}`,
                    `Execute ${goal}`,
                    `Review and optimize ${goal}`
                ];
                
                for (const task of subtasks) {
                    await this.useTool('task', 'create', { title: task, description: '' });
                }
                
                return { plan: subtasks, message: `Created ${subtasks.length} tasks for: ${goal}` };
            }
        });
    }
    
    registerTool(name, config) {
        this.tools.set(name, config);
        window.AxiomBus.emit('tool:registered', { name, config });
    }
    
    registerSkill(name, config) {
        this.skills.set(name, config);
        window.AxiomBus.emit('skill:registered', { name, config });
    }
    
    async useTool(toolName, action, params) {
        const tool = this.tools.get(toolName);
        if (!tool) throw new Error(`Tool ${toolName} not found`);
        
        window.AxiomBus.emit('agent:tool:start', { tool: toolName, action, params });
        
        try {
            const result = await tool.handler(action, params);
            window.AxiomBus.emit('agent:tool:end', { tool: toolName, action, result });
            return result;
        } catch (error) {
            window.AxiomBus.emit('agent:tool:error', { tool: toolName, action, error });
            throw error;
        }
    }
    
    async processMessage(message) {
        window.AxiomState.set('agentStatus', 'thinking');
        window.AxiomBus.emit('agent:thinking:start', { message });
        
        // Simple intent detection
        const intent = this.detectIntent(message);
        const skill = this.findSkillForIntent(intent);
        
        // Simulate processing delay
        await new Promise(r => setTimeout(r, 1500));
        
        let response = { type: 'text', content: '' };
        
        if (skill) {
            window.AxiomState.set('agentStatus', 'acting');
            const result = await skill.handler(message);
            response = {
                type: 'skill_result',
                skill: skill.name,
                content: result.message || JSON.stringify(result, null, 2),
                data: result
            };
        } else {
            // Default conversational response
            response = {
                type: 'text',
                content: `I understand you said: "${message}". I'm currently running in demo mode with local functionality. In production, this would connect to an LLM API for intelligent responses.`
            };
        }
        
        window.AxiomState.set('agentStatus', 'idle');
        window.AxiomBus.emit('agent:response', { message, response });
        
        return response;
    }
    
    detectIntent(message) {
        const lower = message.toLowerCase();
        if (lower.includes('code') || lower.includes('function') || lower.includes('bug')) return 'coding';
        if (lower.includes('search') || lower.includes('find') || lower.includes('research')) return 'research';
        if (lower.includes('task') || lower.includes('plan') || lower.includes('todo')) return 'planning';
        if (lower.includes('remember') || lower.includes('save')) return 'memory';
        return 'chat';
    }
    
    findSkillForIntent(intent) {
        for (const [name, skill] of this.skills) {
            if (skill.triggers.some(t => intent.includes(t) || t.includes(intent))) {
                return skill;
            }
        }
        return null;
    }
}

// Initialize Agent
window.Agent = new AgentCore();

// Command Palette
class CommandPalette {
    constructor() {
        this.commands = [
            { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', action: () => window.AxiomBus.emit('file:new') },
            { id: 'open-chat', label: 'Open Chat', shortcut: 'Ctrl+1', action: () => window.AxiomBus.emit('panel:switch', 'chat') },
            { id: 'open-ide', label: 'Open IDE', shortcut: 'Ctrl+2', action: () => window.AxiomBus.emit('panel:switch', 'ide') },
            { id: 'open-tasks', label: 'Open Tasks', shortcut: 'Ctrl+3', action: () => window.AxiomBus.emit('panel:switch', 'tasks') },
            { id: 'toggle-theme', label: 'Toggle Theme', shortcut: 'Ctrl+Shift+L', action: () => this.toggleTheme() },
            { id: 'save-all', label: 'Save All', shortcut: 'Ctrl+S', action: () => window.AxiomState.persist() }
        ];
        
        this.setupKeyboard();
    }
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+P or Cmd+P for command palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.AxiomBus.emit('command-palette:open');
            }
            
            // Panel shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1': e.preventDefault(); window.AxiomBus.emit('panel:switch', 'chat'); break;
                    case '2': e.preventDefault(); window.AxiomBus.emit('panel:switch', 'ide'); break;
                    case '3': e.preventDefault(); window.AxiomBus.emit('panel:switch', 'tasks'); break;
                    case '4': e.preventDefault(); window.AxiomBus.emit('panel:switch', 'memory'); break;
                }
            }
        });
    }
    
    toggleTheme() {
        const html = document.documentElement;
        const current = html.classList.contains('dark') ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        html.classList.remove(current);
        html.classList.add(next);
        window.AxiomState.set('settings.theme', next);
    }
    
    getCommands() {
        return this.commands;
    }
}

window.CommandPalette = new CommandPalette();

// Utility Functions
window.axiomUtils = {
    escapeHtml: (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatTime: (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },
    
    debounce: (fn, ms) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), ms);
        };
    }
};

// Service Worker Registration (for offline capability)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Note: In production, create a proper service worker
        console.log('Axiom Mobile: Service Worker support enabled');
    });
}