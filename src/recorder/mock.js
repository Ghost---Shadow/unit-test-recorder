const _ = require('lodash');
const RecorderManager = require('./manager');
const { checkAndSetHash } = require('./hash-helper');
const { generateTypesObj } = require('./dynamic-type-inference');

const captureMockActivity = (meta, params, result) => {
  const { path, moduleName, name } = meta;
  const basePath = ['recorderState', path, 'mocks', moduleName, name];
  const address = [...basePath, 'captures'];
  if (!_.get(RecorderManager, address)) {
    _.set(RecorderManager, address, []);
  }
  if (checkAndSetHash(RecorderManager, basePath, params)) {
    return;
  }
  // Record types from this capture
  const types = generateTypesObj({ params, result });
  RecorderManager.recorderState[path].mocks[moduleName][name].captures.push({
    params,
    result,
    types,
  });
};

const mockRecorderWrapper = (meta, oldFp, ...p) => {
  const params = p;
  const result = oldFp(...p);
  if (typeof (result.then) === 'function') {
    result.then((res) => {
      captureMockActivity(meta, params, res);
    });
  } else {
    captureMockActivity(meta, params, result);
  }
  return result;
};

module.exports = {
  mockRecorderWrapper,
};
