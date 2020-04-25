const { getNamespace } = require('cls-hooked');
const { injectDependencyInjections } = require('../injection');
const RecorderManager = require('../manager');

const pre = (meta, params) => {
  const { path, name } = meta;

  // Record meta
  const address = ['recorderState', path, 'exportedFunctions', name, 'meta'];
  RecorderManager.record(address, meta);

  // Set stack in continuation local storage
  const session = getNamespace('default');
  const stack = session.get('stack') || [];
  stack.push(meta);
  session.set('stack', stack);

  // Shim all dependency injections
  // Mutating call
  injectDependencyInjections(params);
};

module.exports = { pre };
