const _ = require('lodash');
const RecorderManager = require('../manager');
// const { checkAndSetHash } = require('./utils/hash-helper');
const { generateTypesObj } = require('../utils/dynamic-type-inference');

const captureMockActivity = (captureIndex, meta, data) => {
  const { name: functionName } = meta;
  const { mockMeta, params, result } = data;
  const { path, moduleName, name } = mockMeta;

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
