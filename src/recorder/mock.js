const _ = require('lodash');
const RecorderManager = require('./manager');
const { checkAndSetHash } = require('./utils/hash-helper');
const { generateTypesObj } = require('./utils/dynamic-type-inference');

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
  const old = _.get(RecorderManager, address);
  const newCapture = { params, result, types };
  RecorderManager.record(address, old.concat([newCapture]), old);
};

const mockRecorderWrapper = (meta, oldFp, ...p) => {
  const params = p;
  const result = oldFp(...p);
  try {
    if (typeof (result.then) === 'function') {
      result.then((res) => {
        captureMockActivity(meta, params, res);
      });
    } else {
      captureMockActivity(meta, params, result);
    }
  } catch (e) {
    console.error(e);
  }
  return result;
};

module.exports = {
  mockRecorderWrapper,
};
