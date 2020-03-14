const _ = require('lodash');

const RecorderManager = require('./manager');

const { injectDependencyInjections } = require('./injection');

const pre = ({ meta, p }) => {
  const { path, name } = meta;
  const paramIds = meta.paramIds.split(',');
  const address = ['recorderState', path, 'exportedFunctions', name];
  if (!_.get(RecorderManager, address)) {
    _.set(RecorderManager, address, {
      meta: { ...meta, paramIds },
      captures: [],
    });
  }
  RecorderManager.recorderState[path].exportedFunctions[name].captures.push({ });
  const captureIndex = RecorderManager
    .recorderState[path].exportedFunctions[name].captures.length - 1;
  injectDependencyInjections(p, paramIds, { path, name, captureIndex });
  const params = p;
  return {
    path, name, captureIndex, params,
  };
};

const captureUserFunction = ({
  result, path, name, captureIndex, params, doesReturnPromise,
}) => {
  RecorderManager.recorderState[path]
    .exportedFunctions[name].meta.doesReturnPromise = doesReturnPromise;

  const existing = RecorderManager
    .recorderState[path].exportedFunctions[name].captures[captureIndex];
  RecorderManager.recorderState[path]
    .exportedFunctions[name].captures[captureIndex] = _.merge(existing, {
      params,
      result,
    });
};

const recorderWrapper = (meta, innerFunction, ...p) => {
  const {
    path, name, captureIndex, params,
  } = pre({ meta, p });
  const result = innerFunction(...p);
  if (typeof (result.then) === 'function') {
    // It might be a promise
    result.then(res => captureUserFunction({
      result: res, path, name, captureIndex, params, doesReturnPromise: true,
    }));
  } else {
    captureUserFunction({
      result, path, name, captureIndex, params, doesReturnPromise: false,
    });
  }
  // If the function is a second order function
  if (typeof (result) === 'function') {
    captureUserFunction({
      result: result.toString(),
      path,
      name,
      captureIndex,
      params,
      doesReturnPromise: false,
    });
  }
  return result;
};

module.exports = {
  recorderWrapper,
};
