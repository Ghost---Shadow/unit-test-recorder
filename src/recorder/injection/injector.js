const _ = require('lodash');

const RecorderManager = require('../manager');
const { broadcastFunctions } = require('../utils/broadcast-functions');
const { shouldRecordStubParams } = require('../utils/misc');

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

const injectFunctionDynamically = (maybeFunction, meta, boundRecorder) => {
  if (_.isFunction(maybeFunction)) {
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
      const result = OldFp.apply(this, paramsOfInjected);
      if (result && _.isFunction(result.then)) {
        // It might be a promise
        result.then((res) => {
          injectedFunction.boundRecorder(clonedParams, res);
        });
      } else {
        injectedFunction.boundRecorder(clonedParams, result);
      }
      return result;
    }
    if (OldFp.boundRecorder) {
      OldFp.boundRecorder = broadcastFunctions(OldFp.boundRecorder, boundRecorder);
      return OldFp;
    }
    injectedFunction.boundRecorder = boundRecorder;
    return injectedFunction;
  }
  return maybeFunction;
};

module.exports = {
  injectFunctionDynamically,
  markForConstructorInjection,
};
