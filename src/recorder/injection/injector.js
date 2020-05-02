const _ = require('lodash');
const { getNamespace } = require('cls-hooked');
const { v4: uuidv4 } = require('uuid');

const RecorderManager = require('../manager');
const { shouldRecordStubParams } = require('../utils/misc');
const { recordToCls } = require('../utils/cls-recordings');

const markForConstructorInjection = () => {
  const session = getNamespace('default');
  const stack = session.get('stack');
  const meta = _.last(stack);
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


const updateUuidLut = (uuid, paramIndex) => {
  const session = getNamespace('default');
  const stack = session.get('stack');
  const top = stack.length - 1;
  _.set(stack, [top, 'uuidLut', uuid], paramIndex);
  session.set('stack', stack);
};

const getTransformedParamIndex = (uuid, defaultParamIndex) => {
  const session = getNamespace('default');
  const stack = session.get('stack');
  const meta = _.last(stack);
  return _.get(meta, ['uuidLut', uuid], defaultParamIndex);
};

const injectFunctionDynamically = (maybeFunction, paramIndex, fppkey) => {
  if (_.isFunction(maybeFunction)) {
    // Already injected
    if (maybeFunction.utrUuid) {
      updateUuidLut(maybeFunction.utrUuid, paramIndex);
      return maybeFunction;
    }

    const OldFp = maybeFunction;
    // eslint-disable-next-line
    function injectedFunction(...paramsOfInjected) {
      // https://stackoverflow.com/a/31060154/1217998
      if (new.target) {
        markForConstructorInjection();
        // https://stackoverflow.com/a/47469377/1217998
        return new OldFp(...paramsOfInjected);
      }
      const clonedParams = shouldRecordStubParams() ? _.cloneDeep(paramsOfInjected) : [];
      const result = OldFp.apply(this, paramsOfInjected);
      const KEY = 'injections'; // TODO: refactor
      const funcUuid = injectedFunction.utrUuid;
      const newParamIndex = getTransformedParamIndex(funcUuid, paramIndex);
      if (result && _.isFunction(result.then)) {
        // It might be a promise
        result.then((res) => {
          const data = {
            paramIndex: newParamIndex, fppkey, params: clonedParams, result: res, funcUuid,
          };
          recordToCls(KEY, data);
        });
      } else {
        const data = {
          paramIndex: newParamIndex, fppkey, params: clonedParams, result, funcUuid,
        };
        recordToCls(KEY, data);
      }
      return result;
    }
    injectedFunction.utrUuid = uuidv4();
    updateUuidLut(injectedFunction.utrUuid, paramIndex);
    return injectedFunction;
  }
  return maybeFunction;
};

module.exports = {
  injectFunctionDynamically,
  markForConstructorInjection,
};
