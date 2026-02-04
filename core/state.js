export const AxiomState = {
  async get(key) {
    return localforage.getItem(key);
  },
  async set(key, value) {
    return localforage.setItem(key, value);
  }
};

console.log("AxiomState initialized");