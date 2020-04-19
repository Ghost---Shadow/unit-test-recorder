const _ = require('lodash');
const { getNamespace } = require('cls-hooked');

const { traverseBfs } = require('../utils/object-traverser');
const { newFunctionNameGenerator } = require('../../util/misc');
const { injectFunctionDynamically } = require('./injector');

const injectDependencyInjections = (params) => {
  const session = getNamespace('default');
  const meta = session.get('meta');
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
          const existingProperty = _.get(param, path);
          const lIndex = path.length - 1;
          const newFnName = newFunctionNameGenerator(path[lIndex], fileName);
          const newPath = _.clone(path);
          newPath[lIndex] = newFnName;
          const fppkey = path.join('.');
          const propertyToInject = _.get(param, newPath, existingProperty);
          const injectedProperty = injectFunctionDynamically(
            propertyToInject, paramIndex, fppkey,
          );
          _.set(param, newPath, injectedProperty);
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
