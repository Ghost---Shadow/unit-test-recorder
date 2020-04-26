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
    const stack = session.get('stack');
    const top = stack.length - 1;

    if (result && _.isFunction(result.then)) {
      // It might be a promise
      stack[top].doesReturnPromise = true;
      session.set('stack', stack);
      result.then(res => captureUserFunction(originalParams, res));
    } else {
      stack[top].doesReturnPromise = false;
      session.set('stack', stack);
      captureUserFunction(originalParams, result);
    }
  } catch (e) {
    console.error(e);
  }

  return result;
};

const boundRecorderWrapper = (...p) => session.bind(recorderWrapper, session.createContext())(...p);

module.exports = {
  recorderWrapper: boundRecorderWrapper,
  unBoundRecorderWrapper: recorderWrapper, // For testing
};
