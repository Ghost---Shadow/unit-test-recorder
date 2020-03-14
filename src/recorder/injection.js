const { flatten, unflatten } = require('flat');
const _ = require('lodash');
const RecorderManager = require('./manager');

const recordInjectedActivity = (idObj, paramIds, index, fppkey, paramsOfInjected, result) => {
  const { path, name, captureIndex } = idObj;
  // Fully qualified name
  const fqn = fppkey ? `${paramIds[index]}.${fppkey}` : paramIds[index];
  const destinationPath = ['recorderState', path, 'exportedFunctions', name, 'captures', captureIndex, 'injections', fqn];
  if (!_.get(RecorderManager, destinationPath)) {
    _.set(RecorderManager, destinationPath, []);
  }
  RecorderManager.recorderState[path].exportedFunctions[name]
    .captures[captureIndex].injections[fqn].push({ params: paramsOfInjected, result });
};

const injectFunctionDynamically = (maybeFunction, paramIds, idObj, index, fppkey) => {
  if (typeof (maybeFunction) === 'function') {
    const oldFp = maybeFunction;
    maybeFunction = (...paramsOfInjected) => {
      const result = oldFp(...paramsOfInjected);
      if (typeof (result.then) === 'function') {
        // It might be a promise
        result.then((res) => {
          recordInjectedActivity(idObj, paramIds, index, fppkey, paramsOfInjected, res);
        });
      } else {
        recordInjectedActivity(idObj, paramIds, index, fppkey, paramsOfInjected, result);
      }
      return result;
    };
  }
  return maybeFunction;
};

const injectDependencyInjections = (params, paramIds, idObj) => {
  params.forEach((param, index) => {
    // If param is an object with functions
    if (typeof (param) === 'object') {
      const flatObj = flatten(param);
      Object.keys(flatObj).forEach((fppkey) => {
        // If a property of the object is a function
        // then inject it
        flatObj[fppkey] = injectFunctionDynamically(
          flatObj[fppkey],
          paramIds,
          idObj,
          index,
          fppkey,
        );
      });
      const newParam = unflatten(flatObj, paramIds, idObj);
      params[index] = newParam;
    } else {
      params[index] = injectFunctionDynamically(
        param,
        paramIds,
        idObj,
        index,
        null,
      );
    }
  });
};

module.exports = { injectDependencyInjections };
