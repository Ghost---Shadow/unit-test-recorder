const _ = require('lodash');
const { getNamespace } = require('cls-hooked');

const RecorderManager = require('../manager');
const { shouldRecordStubParams } = require('../utils/misc');
const { recordToCls } = require('./di-recorder');

const markForConstructorInjection = (meta) => {
  const { path, name } = meta;
  // No tests will be generated for this
  // For now
  const address = ['recorderState', path, 'exportedFunctions', name, 'meta', 'requiresContructorInjection'];
  try {
    RecorderManager.record(address, true);
  } catch (e) {
    console.error(e);
    // Do nothing?
  }
};

const injectFunctionDynamically = (maybeFunction, paramIndex, fppkey) => {
  const session = getNamespace('default');
  const meta = session.get('meta');
  if (_.isFunction(maybeFunction)) {
    // Already injected
    if (maybeFunction.utrIsInjected) return maybeFunction;

    const OldFp = maybeFunction;
    // eslint-disable-next-line
    function injectedFunction(...paramsOfInjected) {
      // https://stackoverflow.com/a/31060154/1217998
      if (new.target) {
        markForConstructorInjection(meta);
        // https://stackoverflow.com/a/47469377/1217998
        return new OldFp(...paramsOfInjected);
      }
      const clonedParams = shouldRecordStubParams() ? _.cloneDeep(paramsOfInjected) : [];
      const curiedRecorder = recordToCls.bind(null, paramIndex, fppkey, clonedParams);
      const result = OldFp.apply(this, paramsOfInjected);
      if (result && _.isFunction(result.then)) {
        // It might be a promise
        result.then((res) => {
          curiedRecorder(res);
        });
      } else {
        curiedRecorder(result);
      }
      return result;
    }
    injectedFunction.utrIsInjected = true;
    return injectedFunction;
  }
  return maybeFunction;
};

module.exports = {
  injectFunctionDynamically,
  markForConstructorInjection,
};
