const _ = require('lodash');

const RecorderManager = require('./manager');
const { traverse } = require('./utils/object-traverser');
const { newFunctionNameGenerator } = require('../util/misc');
const { checkAndSetHash } = require('./utils/hash-helper');
const { generateTypesObj } = require('./utils/dynamic-type-inference');
const { broadcastFunctions } = require('./utils/broadcast-functions');

const markForConstructorInjection = (meta) => {
  const { path, name } = meta;
  // No tests will be generated for this
  // For now
  RecorderManager.recorderState[path].exportedFunctions[name]
    .meta.requiresContructorInjection = true;
};

const recordInjectedActivity = (meta, paramIndex, fppkey, params, result) => {
  const {
    path, name, captureIndex, paramIds,
  } = meta;
  // Fully qualified name
  const fqn = fppkey ? `${paramIds[paramIndex]}.${fppkey}` : paramIds[paramIndex];
  const basePath = ['recorderState', path, 'exportedFunctions', name, 'captures', captureIndex, 'injections', fqn];
  const destinationPath = [...basePath, 'captures'];
  if (!_.get(RecorderManager, destinationPath)) {
    _.set(RecorderManager, destinationPath, []);
  }
  if (checkAndSetHash(RecorderManager, basePath, params)) {
    return;
  }
  // Record types from this capture
  const types = generateTypesObj({ params, result });
  RecorderManager.recorderState[path].exportedFunctions[name]
    .captures[captureIndex].injections[fqn].captures.push({ params, result, types });
};

const injectFunctionDynamically = (maybeFunction, meta, boundRecorder) => {
  if (_.isFunction(maybeFunction)) {
    const OldFp = maybeFunction;
    // eslint-disable-next-line
    function injectedFunction(...paramsOfInjected) {
      injectedFunction.boundRecorder = boundRecorder;
      // https://stackoverflow.com/a/31060154/1217998
      if (new.target) {
        markForConstructorInjection(meta);
        // https://stackoverflow.com/a/47469377/1217998
        return new OldFp(...paramsOfInjected);
      }
      const result = OldFp.bind(this)(...paramsOfInjected);
      if (result && _.isFunction(result.then)) {
        // It might be a promise
        result.then((res) => {
          injectedFunction.boundRecorder(paramsOfInjected, res);
        });
      } else {
        injectedFunction.boundRecorder(paramsOfInjected, result);
      }
      return result;
    }
    return injectedFunction;
  }
  return maybeFunction;
};

const isWhitelisted = (injectionWhitelist, path) => injectionWhitelist
  .reduce((acc, fnName) => acc || _.last(path) === fnName, false);

const getBoundRecorder = (existingProperty, meta, paramIndex, fppkey) => {
  const newRecorder = recordInjectedActivity.bind(null, meta, paramIndex, fppkey);
  // TODO: Make sure we are not overwriting the user's boundRecorder
  // const oldRecorder = _.get(existingProperty, 'boundRecorder');
  // if (_.isFunction(existingProperty) && oldRecorder) {
  //   return broadcastFunctions(oldRecorder, newRecorder);
  // }
  return newRecorder;
};

const injectDependencyInjections = (params, meta) => {
  const { injectionWhitelist, path: fileName } = meta;
  params.forEach((param, paramIndex) => {
    // If param is an object with functions
    // TODO: Handle array of functions
    if (_.isObject(param) && !_.isArray(param) && !_.isFunction(param)) {
      const paths = traverse(param);
      paths.forEach((path) => {
        if (!isWhitelisted(injectionWhitelist, path)) return;
        const existingProperty = _.get(param, path);
        const lIndex = path.length - 1;
        const newFnName = newFunctionNameGenerator(path[lIndex], fileName);
        const newPath = _.clone(path);
        newPath[lIndex] = newFnName;
        const fppkey = path.join('.');
        const boundRecorder = getBoundRecorder(existingProperty, meta, paramIndex, fppkey);
        const injectedProperty = injectFunctionDynamically(
          existingProperty,
          meta,
          boundRecorder,
        );
        _.set(param, newPath, injectedProperty);
      });
    } else {
      const boundRecorder = getBoundRecorder(params[paramIndex], meta, paramIndex, null);
      params[paramIndex] = injectFunctionDynamically(
        param,
        meta,
        boundRecorder,
      );
    }
  });
};

module.exports = { injectDependencyInjections };
