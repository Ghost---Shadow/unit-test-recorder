const _ = require('lodash');
const { newFunctionNameGenerator } = require('../util/misc');

// TODO: Only reachable injections should be unclobbered
function getValidInjections() {
  // const validFunctionLut = this.validFunctions
  //   .reduce((acc, vf) => ({ ...acc, [vf.name]: true }), {});
  const result = Object.keys(this.injectedFunctions).reduce((acc, name) => {
    const parentFunctionNames = Object.keys(this.injectedFunctions[name]);
    const innerObjs = parentFunctionNames.reduce((innerAcc, parentFunctionName) => {
      const { objName } = this.injectedFunctions[name][parentFunctionName];
      const isParentFunctionTopLevel = this.topLevelBindings[parentFunctionName];
      const isParentObjTopLevel = this.topLevelBindings[objName];
      if (!isParentFunctionTopLevel && !isParentObjTopLevel) return innerAcc;
      const { paths } = this.injectedFunctions[name][parentFunctionName];
      return innerAcc.concat([{ paths, name, parentFunctionName }]);
    }, []);
    return acc.concat(innerObjs);
  }, []);
  return result;
}

// Rename all the dependency injected functions
// So that we do not overwrite existing function
// to avoid side effects
function unclobberInjections() {
  this.validDependencyInjections.forEach(({ name, paths }) => {
    const newFunctionName = newFunctionNameGenerator(name, this.fileName);
    // TODO: Make sure newFunctionName is not clobbering
    // another function
    paths.forEach((path) => {
      path.node.name = newFunctionName;
    });
  });
}

// Add these functions to meta so that recorder can pick it up
function addInjectedFunctionsToMeta() {
  const injectionWhitelist = _.uniq(this.validDependencyInjections.map(({ name }) => name));

  // Instrument injected functions
  this.validFunctions = this.validFunctions
    .map(funObj => _.merge(funObj, { injectionWhitelist }));

  // Instrument injected functions in exported objects
  Object.keys(this.capturedObjects).forEach((objName) => {
    const numFuns = this.capturedObjects[objName].funObjs.length;
    for (let i = 0; i < numFuns; i += 1) {
      const old = this.capturedObjects[objName].funObjs[i];
      this.capturedObjects[objName].funObjs[i] = _.merge(old, { injectionWhitelist });
    }
  });
}

module.exports = { unclobberInjections, addInjectedFunctionsToMeta, getValidInjections };
