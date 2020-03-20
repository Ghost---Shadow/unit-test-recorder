const _ = require('lodash');
const { newFunctionNameGenerator } = require('../util/misc');

// Rename all the dependency injected functions
// So that we do not overwrite existing function
// to avoid side effects
function unclobberInjections() {
  this.injectedFunctions.forEach(({ name, paths }) => {
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
  const injectionWhitelist = this.injectedFunctions.map(({ name }) => name);

  this.validFunctions = this.validFunctions
    .map(funObj => _.merge(funObj, { injectionWhitelist }));
}

module.exports = { unclobberInjections, addInjectedFunctionsToMeta };
