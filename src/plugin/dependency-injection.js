const _ = require('lodash');
const { newFunctionNameGenerator } = require('../util/misc');

// TODO: Only reachable injections should be unclobbered
function getValidInjections() {
  // const validFunctionLut = this.validFunctions
  //   .reduce((acc, vf) => ({ ...acc, [vf.name]: true }), {});
  const result = Object.keys(this.injectedFunctions).reduce((acc, name) => {
    const parentFunctionNames = Object.keys(this.injectedFunctions[name]);
    const innerObjs = parentFunctionNames.reduce((innerAcc, parentFunctionName) => {
      if (!this.topLevelBindings[parentFunctionName]) return innerAcc;
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

  this.validFunctions = this.validFunctions
    .map(funObj => _.merge(funObj, { injectionWhitelist }));
}

module.exports = { unclobberInjections, addInjectedFunctionsToMeta, getValidInjections };
