const { getNamespace } = require('../../util/cls-provider');
const { injectDependencyInjections } = require('../injection');
const RecorderManager = require('../manager');

const {
  CLS_NAMESPACE,
} = require('../../util/constants');

const pre = (meta, params) => {
  const { path, name } = meta;

  // Record meta
  const address = ['recorderState', path, 'exportedFunctions', name, 'meta'];
  RecorderManager.record(address, meta);

  // Set stack in continuation local storage
  const session = getNamespace(CLS_NAMESPACE);
  const stack = session.get('stack') || [];
  stack.push(meta);
  session.set('stack', stack);

  // Shim all dependency injections
  // Mutating call
  injectDependencyInjections(params);
};

module.exports = { pre };
