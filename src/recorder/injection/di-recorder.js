const _ = require('lodash');
const { getNamespace } = require('cls-hooked');

const RecorderManager = require('../manager');
// const { checkAndSetHash } = require('./utils/hash-helper');
const { generateTypesObj } = require('../utils/dynamic-type-inference');

const recordInjectedActivity = (captureIndex, meta, data) => {
  const {
    paramIndex, fppkey, params, result,
  } = data;
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

const recordToCls = (data) => {
  const session = getNamespace('default');
  const stack = session.get('stack');
  const top = stack.length - 1;
  const injections = stack[top].injections || [];
  injections.push(data);
  stack[top].injections = injections;
  session.set('stack', stack);
};

const recordAllToRecorderState = (captureIndex) => {
  const session = getNamespace('default');
  const stack = session.get('stack');
  const top = _.last(stack);
  const injections = top.injections || [];
  const meta = _.omit(top, 'injections');

  injections.forEach((data) => {
    recordInjectedActivity(captureIndex, meta, data);
  });
};

const promoteInjections = () => {
  // Parent needs all the injections recorded by child
  const session = getNamespace('default');
  const stack = session.get('stack');

  const childIndex = stack.length - 1;
  const parentIndex = stack.length - 2;
  if (parentIndex < 0) return; // No parent
  const childInjections = stack[childIndex].injections || [];
  const parentInjections = stack[parentIndex].injections || [];

  const newInjections = parentInjections.concat(childInjections);
  stack[parentIndex].injections = newInjections;

  // Child is recorded and no longer required
  stack.pop();

  session.set('stack', stack);
};

module.exports = {
  recordInjectedActivity,
  recordToCls,
  recordAllToRecorderState,
  promoteInjections,
};
