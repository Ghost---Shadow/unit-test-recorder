const { injectDependencyInjections } = require('./param-crawler');
const { markForConstructorInjection, injectFunctionDynamically } = require('./injector');
const { recordInjectedActivity } = require('./di-recorder');

module.exports = {
  markForConstructorInjection,
  recordInjectedActivity,
  injectFunctionDynamically,
  injectDependencyInjections,
};
