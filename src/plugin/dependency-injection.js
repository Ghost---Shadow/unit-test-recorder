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

module.exports = { unclobberInjections };
