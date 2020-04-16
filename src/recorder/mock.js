const { getNamespace } = require('cls-hooked');
const _ = require('lodash');
const RecorderManager = require('./manager');
// const { checkAndSetHash } = require('./utils/hash-helper');
const { generateTypesObj } = require('./utils/dynamic-type-inference');
const { shouldRecordStubParams } = require('./utils/misc');

const captureMockActivity = (meta, params, result) => {
  const session = getNamespace('default');
  const { captureIndex, name: functionName } = session.get('meta');

  const { path, moduleName, name } = meta;
  const pathToCapture = ['recorderState', path, 'exportedFunctions', functionName, 'captures', captureIndex];
  const basePath = [...pathToCapture, 'mocks', moduleName, name];
  const address = [...basePath, 'captures'];
  if (!_.get(RecorderManager, address)) {
    _.set(RecorderManager, address, []);
  }

  // TODO: Put it back later
  // if (checkAndSetHash(RecorderManager, basePath, params)) {
  //   return;
  // }

  // Record types from this capture
  const types = generateTypesObj({ params, result });
  const old = _.get(RecorderManager, address);
  const newCapture = { params, result, types };
  RecorderManager.record(address, old.concat([newCapture]), old);
};

const mockRecorderWrapper = (meta, oldFp, ...p) => {
  const clonedParams = shouldRecordStubParams() ? _.cloneDeep(p) : [];
  const result = oldFp(...p);
  try {
    if (typeof (result.then) === 'function') {
      result.then((res) => {
        captureMockActivity(meta, clonedParams, res);
      });
    } else {
      captureMockActivity(meta, clonedParams, result);
    }
  } catch (e) {
    console.error(e);
  }
  return result;
};

module.exports = {
  mockRecorderWrapper,
};
