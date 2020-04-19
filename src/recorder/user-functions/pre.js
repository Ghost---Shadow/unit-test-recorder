const { getNamespace } = require('cls-hooked');
const { injectDependencyInjections } = require('../injection');
const RecorderManager = require('../manager');

const pre = (meta, params) => {
  const { path, name } = meta;

  // Record meta
  const address = ['recorderState', path, 'exportedFunctions', name, 'meta'];
  RecorderManager.record(address, meta);

  // Set meta in continuation local storage
  const session = getNamespace('default');
  session.set('meta', meta);

  // Shim all dependency injections
  // Mutating call
  injectDependencyInjections(params);
};

module.exports = { pre };
