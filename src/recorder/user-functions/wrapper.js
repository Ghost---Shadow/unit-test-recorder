const _ = require('lodash');
const { createNamespace } = require('cls-hooked');
const { captureUserFunction } = require('./capture-logic');
const { pre } = require('./pre');

const session = createNamespace('default');

const recorderWrapper = (meta, innerFunction, ...params) => {
  const originalParams = _.cloneDeep(params);
  try {
    pre(meta, params);
  } catch (e) {
    console.error(e);
    // Dont try to record if pre fails
    return innerFunction(...originalParams);
  }
  // If the function itself throws exception then
  // the user should handle it
  const result = innerFunction(...params);
  try {
    if (result && _.isFunction(result.then)) {
      // It might be a promise
      const newMeta = session.get('meta');
      newMeta.doesReturnPromise = true;
      session.set('meta', newMeta);
      result.then(res => captureUserFunction(params, res));
    } else {
      const newMeta = session.get('meta');
      newMeta.doesReturnPromise = false;
      session.set('meta', newMeta);
      captureUserFunction(params, result);
    }
  } catch (e) {
    console.error(e);
  }

  return result;
};

const boundRecorderWrapper = session.bind(recorderWrapper);

module.exports = {
  recorderWrapper: boundRecorderWrapper,
  unBoundRecorderWrapper: recorderWrapper, // For testing
};
