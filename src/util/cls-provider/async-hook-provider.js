const { AsyncLocalStorage } = require('async_hooks');

const namespaces = {};
process.namespaces = namespaces;

function Namespace(name) {
  this.asyncLocalStorage = new AsyncLocalStorage();
  this.name = name;
  Object.defineProperties(this, {
    active: { get() { return !!this.asyncLocalStorage.getStore(); } },
  });
  this.run = (fn) => {
    const oldStore = this.asyncLocalStorage.getStore();
    const store = Object.create(oldStore || {});
    this.asyncLocalStorage.run(store || {}, fn);
  };
  this.bind = (fn) => {
    const newFn = (...p) => {
      const oldStore = this.asyncLocalStorage.getStore();
      const store = Object.create(oldStore || {});
      return this.asyncLocalStorage.run(store || {}, () => fn(...p));
    };
    return newFn;
  };
  this.get = (key) => {
    const store = this.asyncLocalStorage.getStore();
    return store ? store[key] : undefined;
  };
  this.set = (key, value) => {
    const store = this.asyncLocalStorage.getStore();
    if (!store) { throw new Error('No active context'); }
    store[key] = value;
  };
  this.createContext = () => ({}); // No operation
}

const createNamespace = (name) => {
  const ns = new Namespace(name);
  namespaces[name] = ns;
  return ns;
};

const getNamespace = name => namespaces[name];

module.exports = {
  getNamespace,
  createNamespace,
};
