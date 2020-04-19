const _ = require('lodash');
const { getNamespace } = require('cls-hooked');

const RecorderManager = require('../manager');
// const { checkAndSetHash } = require('./utils/hash-helper');
const { generateTypesObj } = require('../utils/dynamic-type-inference');

const recordInjectedActivity = (meta, paramIndex, captureIndex, fppkey, params, result) => {
  const {
    path, name, paramIds,
  } = meta;
  // Fully qualified name
  const fqn = fppkey ? `${paramIds[paramIndex]}.${fppkey}` : paramIds[paramIndex];
  const basePath = ['recorderState', path, 'exportedFunctions', name, 'captures', captureIndex, 'injections', fqn];
  const destinationPath = [...basePath, 'captures'];
  try {
    // TODO: Put it back later
    // if (checkAndSetHash(RecorderManager, basePath, params)) {
    //   return;
    // }
    // Record types from this capture
    const old = _.get(RecorderManager, destinationPath, []);
    const innerCaptureIndex = old.length;
    const addr = [...destinationPath, innerCaptureIndex];
    const types = generateTypesObj({ params, result });
    RecorderManager.recordTrio(addr, params, result, types);
  } catch (e) {
    console.error(e);
  }
};

const recordToCls = (paramIndex, fppkey, params, result) => {
  const session = getNamespace('default');
  const injections = session.get('injections') || [];
  injections.push([paramIndex, fppkey, params, result]);
  session.set('injections', injections);
};

const recordAllToRecorderState = (captureIndex) => {
  const session = getNamespace('default');
  const injections = session.get('injections') || [];
  const meta = session.get('meta');

  injections.forEach(([paramIndex, fppkey, params, result]) => {
    recordInjectedActivity(meta, paramIndex, captureIndex, fppkey, params, result);
  });
};

module.exports = {
  recordInjectedActivity,
  recordToCls,
  recordAllToRecorderState,
};
