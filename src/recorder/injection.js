const _ = require('lodash');

const RecorderManager = require('./manager');
const { traverse } = require('./object-traverser');

const markForConstructorInjection = (idObj) => {
  const { path, name } = idObj;
  // No tests will be generated for this
  // For now
  RecorderManager.recorderState[path].exportedFunctions[name]
    .meta.requiresContructorInjection = true;
};

const recordInjectedActivity = (idObj, paramIds, index, fppkey, paramsOfInjected, result) => {
  const { path, name, captureIndex } = idObj;
  // Fully qualified name
  const fqn = fppkey ? `${paramIds[index]}.${fppkey}` : paramIds[index];
  const destinationPath = ['recorderState', path, 'exportedFunctions', name, 'captures', captureIndex, 'injections', fqn];
  if (!_.get(RecorderManager, destinationPath)) {
    _.set(RecorderManager, destinationPath, []);
  }
  RecorderManager.recorderState[path].exportedFunctions[name]
    .captures[captureIndex].injections[fqn].push({ params: paramsOfInjected, result });
};

const injectFunctionDynamically = (maybeFunction, paramIds, idObj, index, fppkey) => {
  if (_.isFunction(maybeFunction)) {
    const OldFp = maybeFunction;
    // eslint-disable-next-line
    function injectedFunction(...paramsOfInjected) {
      // https://stackoverflow.com/a/31060154/1217998
      if (new.target) {
        markForConstructorInjection(idObj);
        // https://stackoverflow.com/a/47469377/1217998
        return new OldFp(...paramsOfInjected);
      }
      // const result = OldFp.bind(this)(...paramsOfInjected);
      const result = OldFp(...paramsOfInjected);
      if (result && _.isFunction(result.then)) {
        // It might be a promise
        result.then((res) => {
          recordInjectedActivity(idObj, paramIds, index, fppkey, paramsOfInjected, res);
        });
      } else {
        recordInjectedActivity(idObj, paramIds, index, fppkey, paramsOfInjected, result);
      }
      return result;
    }
    return injectedFunction;
  }
  return maybeFunction;
};

const injectDependencyInjections = (params, paramIds, idObj) => {
  params.forEach((param, index) => {
    // If param is an object with functions
    // TODO: Handle array of functions
    if (_.isObject(param) && !_.isArray(param) && !_.isFunction(param)) {
      const paths = traverse(param);
      paths.forEach((path) => {
        const existingProperty = _.get(param, path);
        const fppkey = path.join('.');
        const injectedProperty = injectFunctionDynamically(
          existingProperty,
          paramIds,
          idObj,
          index,
          fppkey,
        );
        _.set(param, path, injectedProperty);
      });
    } else {
      params[index] = injectFunctionDynamically(
        param,
        paramIds,
        idObj,
        index,
        null,
      );
    }
  });
};

module.exports = { injectDependencyInjections };
