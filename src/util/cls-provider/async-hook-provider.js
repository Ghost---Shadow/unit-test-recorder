const { AsyncLocalStorage } = require('async_hooks');
const _ = require('lodash');

const namespaces = {};

function Namespace(name) {
  this.asyncLocalStorage = new AsyncLocalStorage();
  this.name = name;
  this.contexts = [];
  this.active = null;
  this.bind = (fn, context = null) => {
    const newFn = async (...p) => {
      this.enter(context);
      const result = await fn(...p);
      this.exit();
      return result;
    };

    return newFn;
  };
  this.run = (fn) => {
    this.createContext();
    const context = this.active;
    try {
      this.enter(context);
      fn();
      return context;
    } catch (e) {
      throw e;
    } finally {
      this.exit();
    }
  };
  this.get = key => this.active[key];
  this.set = (key, value) => { this.active[key] = value; };
  this.createContext = () => {
    this.contexts.push(_.cloneDeep(this.active || {}));
    this.active = _.last(this.contexts);
  };
  this.enter = (context) => {
    if (context) this.active = _.cloneDeep(context);
    this.asyncLocalStorage.enterWith(this.active);
  };
  this.exit = () => {
    this.contexts.pop();
    this.active = _.last(this.contexts);
  };
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
