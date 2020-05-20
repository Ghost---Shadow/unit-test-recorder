const _ = require('lodash');
const isPromise = require('is-promise');
const { v4: uuidv4 } = require('uuid');

const { getNamespace } = require('../../util/cls-provider');

const RecorderManager = require('../manager');
const { shouldRecordStubParams } = require('../utils/misc');
const { recordToCls } = require('../utils/cls-recordings');

const {
  CLS_NAMESPACE,
  KEY_UUID,
  KEY_INJECTIONS,
  KEY_UUID_LUT,
} = require('../../util/constants');

const markForConstructorInjection = () => {
  const session = getNamespace(CLS_NAMESPACE);
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
  const session = getNamespace(CLS_NAMESPACE);
  const stack = session.get('stack');
  const top = stack.length - 1;
  _.set(stack, [top, KEY_UUID_LUT, uuid], paramIndex);
  session.set('stack', stack);
};

const getTransformedParamIndex = (uuid, defaultParamIndex) => {
  const session = getNamespace(CLS_NAMESPACE);
  const stack = session.get('stack');
  const meta = _.last(stack);
  return _.get(meta, [KEY_UUID_LUT, uuid], defaultParamIndex);
};

const injectFunctionDynamically = (maybeFunction, paramIndex, fppkey) => {
  if (_.isFunction(maybeFunction)) {
    // Already injected
    if (maybeFunction[KEY_UUID]) {
      updateUuidLut(maybeFunction[KEY_UUID], paramIndex);
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
      const funcUuid = injectedFunction[KEY_UUID];
      const newParamIndex = getTransformedParamIndex(funcUuid, paramIndex);
      const data = {
        paramIndex: newParamIndex,
        fppkey,
        params: clonedParams,
        [KEY_UUID]: funcUuid,
      };
      if (isPromise(result)) {
        result.then(res => recordToCls(KEY_INJECTIONS, { ...data, result: res }));
      } else {
        recordToCls(KEY_INJECTIONS, { ...data, result });
      }
      return result;
    }
    injectedFunction[KEY_UUID] = uuidv4();
    updateUuidLut(injectedFunction[KEY_UUID], paramIndex);
    return injectedFunction;
  }
  return maybeFunction;
};

module.exports = {
  injectFunctionDynamically,
  markForConstructorInjection,
};
