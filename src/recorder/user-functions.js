const _ = require('lodash');

const RecorderManager = require('./manager');

const { injectDependencyInjections } = require('./injection');
const { checkAndSetHash } = require('./hash-helper');
const { generateTypesObj } = require('./dynamic-type-inference');

const pre = ({ meta, p }) => {
  const { path, name, paramIds } = meta;
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
  injectDependencyInjections(p, paramIds, { ...meta, captureIndex });
  const params = p;
  return {
    path, name, captureIndex, params,
  };
};

const captureUserFunction = ({
  result, path, name, captureIndex, params, doesReturnPromise,
}) => {
  // Record types from this capture
  const types = generateTypesObj({ params, result });

  // TODO: Handle higher order functions
  if (_.isFunction(result)) {
    result = result.toString();
  }
  RecorderManager.recorderState[path]
    .exportedFunctions[name].meta.doesReturnPromise = doesReturnPromise;

  const basePath = ['recorderState', path, 'exportedFunctions', name];
  if (checkAndSetHash(RecorderManager, basePath, params)) {
    // Capture already exists
    RecorderManager.recorderState[path].exportedFunctions[name].captures[captureIndex] = null;
    return;
  }

  // Merge with recordings of dependency injections
  const existing = RecorderManager
    .recorderState[path].exportedFunctions[name].captures[captureIndex];
  RecorderManager.recorderState[path]
    .exportedFunctions[name].captures[captureIndex] = _.merge(existing, {
      params,
      result,
      types,
    });
};

const recorderWrapper = (meta, innerFunction, ...p) => {
  const {
    path, name, captureIndex, params,
  } = pre({ meta, p });
  const result = innerFunction(...p);
  if (result && _.isFunction(result.then)) {
    // It might be a promise
    result.then(res => captureUserFunction({
      result: res, path, name, captureIndex, params, doesReturnPromise: true,
    }));
  } else {
    captureUserFunction({
      result, path, name, captureIndex, params, doesReturnPromise: false,
    });
  }
  return result;
};

module.exports = {
  recorderWrapper,
};
