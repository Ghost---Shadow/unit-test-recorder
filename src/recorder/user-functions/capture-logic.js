const { getNamespace } = require('cls-hooked');
const _ = require('lodash');

const RecorderManager = require('../manager');
const { checkAndSetHash } = require('../utils/hash-helper');
const { generateTypesObj } = require('../utils/dynamic-type-inference');
const {
  recordInjectedActivity,
} = require('../injection/di-recorder');
const {
  recordAllToRecorderState,
  promoteInjections,
} = require('../utils/cls-recordings');

const processFunctionLikeParam = (param) => {
  // Ignore falsey types
  if (!param) return param;

  if (_.isFunction(param) && !param.utrIsInjected) {
    return param.toString();
  }
  // Will be mocked separately
  if (param.utrIsInjected) return null;
  return param;
};

const captureUserFunction = (params, result) => {
  const session = getNamespace('default');
  const stack = session.get('stack');
  const meta = _.last(stack);

  const { path, name, doesReturnPromise } = meta;
  // Record types from this capture
  const types = generateTypesObj({ params, result });

  // TODO: Handle higher order functions
  if (_.isFunction(result)) {
    result = result.toString();
  }
  params = params.map(processFunctionLikeParam);
  const newCapture = { params, result, types };

  const addrToCurrentFun = ['recorderState', path, 'exportedFunctions', name];
  const addrToDoesReturnPromise = [...addrToCurrentFun, 'meta', 'doesReturnPromise'];
  const captures = _.get(RecorderManager, [...addrToCurrentFun, 'captures'], []);
  const captureIndex = captures.length;
  const addrToCaptureIndex = [...addrToCurrentFun, 'captures', captureIndex];

  // Record if the function returned a promise
  RecorderManager.record(addrToDoesReturnPromise, doesReturnPromise, false);

  const basePath = ['recorderState', path, 'exportedFunctions', name];
  if (checkAndSetHash(RecorderManager, basePath, newCapture)) {
    // Capture already exists
    RecorderManager.record(addrToCaptureIndex, null, null);
    // Copy all dependency injections to parent
    promoteInjections();
    return;
  }

  RecorderManager.recordTrio(addrToCaptureIndex, params, result, types);

  // Record all dependency injections
  const DI_KEY = 'injections'; // TODO: Refactor out
  recordAllToRecorderState(DI_KEY, recordInjectedActivity, captureIndex);

  // Copy all dependency injections to parent
  promoteInjections();
};

module.exports = { captureUserFunction, processFunctionLikeParam };
