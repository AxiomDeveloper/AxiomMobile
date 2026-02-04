// core/state.js (fixed capitalization + error handling)
export const AxiomState = {
  async get(key) {
    if (typeof localForage === 'undefined') {
      await new Promise(r => setTimeout(r, 100)); // Brief retry
      if (typeof localForage === 'undefined') throw new Error('localForage not available');
    }
    return localForage.getItem(key);
  },
  async set(key, value) {
    if (typeof localForage === 'undefined') throw new Error('localForage not available');
    return localForage.setItem(key, value);
  }
};
console.log('AxiomState ready');