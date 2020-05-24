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
  const originalStackRef = session.get('stack');

  // Set stack as own meta
  session.set('stack', [meta]);

  // Set reference to parent's meta
  session.set('originalStackRef', originalStackRef || []);

  // Shim all dependency injections
  // Mutating call
  injectDependencyInjections(params);
};

module.exports = { pre };
