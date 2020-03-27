const _ = require('lodash');
const { newFunctionNameGenerator } = require('../util/misc');

// TODO: Only reachable injections should be unclobbered
function getValidInjections() {
  // const validFunctionLut = this.validFunctions
  //   .reduce((acc, vf) => ({ ...acc, [vf.name]: true }), {});
  return this.injectedFunctions
    .filter(({ parentFunctionName }) => parentFunctionName);
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
  const injectionWhitelist = this.validDependencyInjections.map(({ name }) => name);

  this.validFunctions = this.validFunctions
    .map(funObj => _.merge(funObj, { injectionWhitelist }));
}

module.exports = { unclobberInjections, addInjectedFunctionsToMeta, getValidInjections };
