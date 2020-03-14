const { flatten, unflatten } = require('flat');
const _ = require('lodash');
const RecorderManager = require('./manager');

const recordInjectedActivity = (idObj, paramIds, index, fppkey, paramsOfInjected, result) => {
  const { path, name, captureIndex } = idObj;
  const fqn = `${paramIds[index]}.${fppkey}`;
  const destinationPath = ['recorderState', path, 'exportedFunctions', name, 'captures', captureIndex, 'injections', fqn];
  if (!_.get(RecorderManager, destinationPath)) {
    _.set(RecorderManager, destinationPath, []);
  }
  RecorderManager.recorderState[path].exportedFunctions[name]
    .captures[captureIndex].injections[fqn].push({ params: paramsOfInjected, result });
};

const injectDependencyInjections = (params, paramIds, idObj) => {
  params.forEach((param, index) => {
    if (typeof (param) === 'object') {
      const flatObj = flatten(param);
      Object.keys(flatObj).forEach((fppkey) => {
        if (typeof (flatObj[fppkey]) === 'function') {
          const oldFp = flatObj[fppkey];
          flatObj[fppkey] = (...paramsOfInjected) => {
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
      });
      const newParam = unflatten(flatObj);
      params[index] = newParam;
    }
  });
};

module.exports = { injectDependencyInjections };
