const _ = require('lodash');

const RecorderManager = require('./manager');
const { traverse } = require('./object-traverser');
const { newFunctionNameGenerator } = require('../util/misc');
const { checkAndSetHash } = require('./hash-helper');
const { generateTypesObj } = require('./dynamic-type-inference');

const markForConstructorInjection = (meta) => {
  const { path, name } = meta;
  // No tests will be generated for this
  // For now
  RecorderManager.recorderState[path].exportedFunctions[name]
    .meta.requiresContructorInjection = true;
};

const recordInjectedActivity = (meta, paramIds, index, fppkey, params, result) => {
  const { path, name, captureIndex } = meta;
  // Fully qualified name
  const fqn = fppkey ? `${paramIds[index]}.${fppkey}` : paramIds[index];
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

const injectFunctionDynamically = (maybeFunction, paramIds, meta, index, fppkey) => {
  if (_.isFunction(maybeFunction)) {
    const OldFp = maybeFunction;
    // eslint-disable-next-line
    function injectedFunction(...paramsOfInjected) {
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
          recordInjectedActivity(meta, paramIds, index, fppkey, paramsOfInjected, res);
        });
      } else {
        recordInjectedActivity(meta, paramIds, index, fppkey, paramsOfInjected, result);
      }
      return result;
    }
    return injectedFunction;
  }
  return maybeFunction;
};

const isWhitelisted = (injectionWhitelist, path) => injectionWhitelist
  .reduce((acc, fnName) => acc || _.last(path) === fnName, false);

const injectDependencyInjections = (params, paramIds, meta) => {
  const { injectionWhitelist, path: fileName } = meta;
  params.forEach((param, index) => {
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
        const injectedProperty = injectFunctionDynamically(
          existingProperty,
          paramIds,
          meta,
          index,
          fppkey,
        );
        _.set(param, newPath, injectedProperty);
      });
    } else {
      params[index] = injectFunctionDynamically(
        param,
        paramIds,
        meta,
        index,
        null,
      );
    }
  });
};

module.exports = { injectDependencyInjections };
