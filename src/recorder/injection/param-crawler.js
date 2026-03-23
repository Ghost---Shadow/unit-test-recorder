const _ = require('lodash');
const { getNamespace } = require('../../util/cls-provider');

const { traverseBfs } = require('../utils/object-traverser');
const { newFunctionNameGenerator } = require('../../util/misc');
const { injectFunctionDynamically } = require('./injector');

const {
  CLS_NAMESPACE,
} = require('../../util/constants');

// lodash _.set blocks __proto__ paths for security (prototype pollution).
// We need a custom setter that can traverse prototype chains safely.
const safeSet = (obj, path, value) => {
  let current = obj;
  for (let i = 0; i < path.length - 1; i += 1) {
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
};

// lodash _.get also blocks __proto__ paths in newer versions.
const safeGet = (obj, path, defaultValue) => {
  let current = obj;
  for (let i = 0; i < path.length; i += 1) {
    if (current == null) return defaultValue;
    current = current[path[i]];
  }
  return current !== undefined ? current : defaultValue;
};

const injectDependencyInjections = (params) => {
  const session = getNamespace(CLS_NAMESPACE);
  const stack = session.get('stack');
  const meta = _.last(stack);
  const { injectionWhitelist, path: fileName } = meta;
  params.forEach((param, paramIndex) => {
    try {
      // If param is an object/array with functions
      if (_.isObject(param) && !_.isFunction(param)) {
        const iterator = traverseBfs(param, injectionWhitelist);
        for (
          let path = iterator.next().value;
          path !== undefined;
          path = iterator.next().value
        ) {
          const existingProperty = safeGet(param, path);
          const lIndex = path.length - 1;
          const newFnName = newFunctionNameGenerator(path[lIndex], fileName);
          const newPath = _.clone(path);
          newPath[lIndex] = newFnName;
          const fppkey = path.join('.');
          const propertyToInject = safeGet(param, newPath, existingProperty);
          const injectedProperty = injectFunctionDynamically(
            propertyToInject, paramIndex, fppkey,
          );
          safeSet(param, newPath, injectedProperty);
        }
      } else {
        params[paramIndex] = injectFunctionDynamically(
          params[paramIndex], paramIndex, null,
        );
      }
    } catch (e) {
      // Ignore this param
      console.error(e);
    }
  });
};

module.exports = {
  injectDependencyInjections,
};
