const _ = require('lodash');

const RecorderManager = require('./manager');

const { injectDependencyInjections } = require('./injection');

const sanitize = (obj) => {
  if (typeof (obj) === 'function') return obj.toString();
  return obj;
};

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
  const params = p.map(sanitize);
  return {
    path, name, captureIndex, params,
  };
};

const post = ({
  unsanitizedResult, path, name, captureIndex, params, doesReturnPromise,
}) => {
  RecorderManager.recorderState[path]
    .exportedFunctions[name].meta.doesReturnPromise = doesReturnPromise;

  const result = sanitize(unsanitizedResult);
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
  const unsanitizedResult = innerFunction(...p);
  if (typeof (unsanitizedResult.then) === 'function') {
    // It might be a promise
    unsanitizedResult.then(res => post({
      unsanitizedResult: res, path, name, captureIndex, params, doesReturnPromise: true,
    }));
  } else {
    post({
      unsanitizedResult, path, name, captureIndex, params, doesReturnPromise: false,
    });
  }
  return unsanitizedResult;
};

module.exports = {
  recorderWrapper,
};
