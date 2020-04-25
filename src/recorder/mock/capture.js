const { getNamespace } = require('cls-hooked');
const _ = require('lodash');
const RecorderManager = require('../manager');
// const { checkAndSetHash } = require('./utils/hash-helper');
const { generateTypesObj } = require('../utils/dynamic-type-inference');

const captureMockActivity = (meta, params, result) => {
  const session = getNamespace('default');
  const stack = session.get('stack');
  const { captureIndex, name: functionName } = _.last(stack);

  const { path, moduleName, name } = meta;
  const pathToCapture = ['recorderState', path, 'exportedFunctions', functionName, 'captures', captureIndex];
  const basePath = [...pathToCapture, 'mocks', moduleName, name];
  const address = [...basePath, 'captures'];

  // TODO: Put it back later
  // if (checkAndSetHash(RecorderManager, basePath, params)) {
  //   return;
  // }

  // Record types from this capture
  const types = generateTypesObj({ params, result });
  const old = _.get(RecorderManager, address, []);
  const innerCaptureIndex = old.length;
  const addr = [...address, innerCaptureIndex];
  RecorderManager.recordTrio(addr, params, result, types);
};

module.exports = { captureMockActivity };
