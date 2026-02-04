// core/launcher.js – intelligent load & error tracking

const errorLog = [];
const milestones = new Set();
const MAX_LOAD_TIME = 12000; // 12 seconds

function log(type, message, details = {}) {
  const entry = {
    time: new Date().toISOString(),
    type,
    message,
    details,
    stack: new Error().stack.split('\n').slice(1).join('\n').trim()
  };
  errorLog.push(entry);
  console[type === 'error' ? 'error' : 'log'](`[Axiom] ${message}`, details);
  localStorage.setItem('axiom_load_errors', JSON.stringify(errorLog));
  updateErrorUI();
}

function mark(name) {
  if (milestones.has(name)) return;
  milestones.add(name);
  const statusEl = document.getElementById('loading-status');
  if (statusEl) statusEl.textContent = name;
  log('info', `Milestone reached: ${name}`);
}

// Global handlers
window.onerror = (msg, url, line, col, err) => {
  log('error', 'Global error caught', { msg, url, line, col, err: err?.message || err });
  return false;
};

window.addEventListener('unhandledrejection', e => {
  log('error', 'Unhandled rejection', { reason: e.reason?.message || e.reason, stack: e.reason?.stack });
});

// Script load monitoring
document.querySelectorAll('script[src]').forEach(s => {
  s.addEventListener('load',  () => mark(`Loaded: ${s.src.split('/').pop()}`));
  s.addEventListener('error', () => log('error', `Failed to load script: ${s.src}`));
});

// Timeout
const timeout = setTimeout(() => {
  if (milestones.size < 8) {
    log('error', 'Initialization timeout – app appears stuck', {
      reached: Array.from(milestones),
      totalExpected: '~10–12'
    });
  }
  finalizeLoad();
}, MAX_LOAD_TIME);

// Finalize (success or failure)
function finalizeLoad() {
  clearTimeout(timeout);
  const loader = document.getElementById('loading');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 800);
  }
  updateErrorUI();
}

// Success path
window.addEventListener('load', () => {
  mark('Window fully loaded');
  setTimeout(finalizeLoad, 800);
});

// Error UI control
function updateErrorUI() {
  const errors = errorLog.filter(e => e.type === 'error');
  const icon = document.getElementById('error-icon');
  if (icon) icon.classList.toggle('hidden', errors.length === 0);

  if (errors.length > 0) {
    const text = errors.map(e =>
      `[${e.time}] ${e.message}\n` +
      `Details: ${JSON.stringify(e.details, null, 2)}\n` +
      `Stack:\n${e.stack}\n` +
      '─'.repeat(60)
    ).join('\n\n');

    const detailsEl = document.getElementById('error-details');
    if (detailsEl) detailsEl.textContent = text;
  }
}

// Modal controls
document.addEventListener('click', e => {
  if (e.target.id === 'error-icon') {
    document.getElementById('error-modal')?.classList.remove('hidden');
  }
  if (e.target.id === 'close-modal' || e.target.id === 'close-modal-bottom') {
    document.getElementById('error-modal')?.classList.add('hidden');
  }
  if (e.target.id === 'copy-error') {
    const text = document.getElementById('error-details')?.textContent;
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => alert('Error log copied – paste to Grok for help'))
        .catch(() => alert('Copy failed – select text manually'));
    }
  }
});

// Start
mark('Launcher started');
console.log('[Axiom Launcher] Monitoring initialization');