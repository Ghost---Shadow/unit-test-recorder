const _ = require('lodash');

const { traverseBfs } = require('../utils/object-traverser');
const { newFunctionNameGenerator } = require('../../util/misc');
const { recordInjectedActivity } = require('./di-recorder');
const { injectFunctionDynamically } = require('./injector');

const getBoundRecorder = (meta, paramIndex, fppkey) => recordInjectedActivity
  .bind(null, meta, paramIndex, fppkey);

const injectDependencyInjections = (params, meta) => {
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
          const boundRecorder = getBoundRecorder(meta, paramIndex, fppkey);
          const propertyToInject = _.get(param, newPath, existingProperty);
          const injectedProperty = injectFunctionDynamically(
            propertyToInject,
            meta,
            boundRecorder,
          );
          _.set(param, newPath, injectedProperty);
        }
      } else {
        const boundRecorder = getBoundRecorder(meta, paramIndex, null);
        params[paramIndex] = injectFunctionDynamically(
          param,
          meta,
          boundRecorder,
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
