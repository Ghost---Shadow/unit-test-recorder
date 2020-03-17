const t = require('@babel/types');
const { default: template } = require('@babel/template');
const _ = require('lodash');

const mockInjector = template(`
(() => {
  const FP_ID = MODULE_ID.FP_ID;
MODULE_ID.FP_ID = (...p) => mockRecorderWrapper({
  path: FILE_NAME,
  moduleName: MODULE_STRING_LITERAL,
  name: FP_STRING_LITERAL,
}, FP_ID, ...p);
})()
`);

const mockInjectorGenerator = (moduleId, moduleName, functionName, fileName) => mockInjector({
  FP_ID: t.identifier(functionName),
  FP_STRING_LITERAL: t.stringLiteral(functionName),
  MODULE_ID: t.identifier(moduleId),
  MODULE_STRING_LITERAL: t.stringLiteral(moduleName),
  FILE_NAME: t.stringLiteral(fileName),
});

function mockInjectedFunctions() {
  Object.keys(this.importedModules).forEach((moduleId) => {
    if (!this.importedModules[moduleId].functions) return;
    this.importedModules[moduleId].functions.forEach((functionId) => {
      const { path, moduleName } = this.importedModules[moduleId];
      if (!this.whiteListedModules[moduleName]) return;
      this.atLeastOneMockUsed = true;
      const ast = mockInjectorGenerator(moduleId, moduleName, functionId, this.fileName);
      path.insertAfter(ast);
    });
  });
}

function capturePathsOfRequiredModules(path) {
  // e.g.
  // const fileSystem = require('fs')
  // importId = fileSystem
  // moduleName = fs
  // grandParentPath = path of the require statement
  if (_.get(path, 'node.callee.name') === 'require') {
    const importId = _.get(path, 'parent.id.name');
    const moduleName = _.get(path, 'node.arguments[0].value');
    const grandParentPath = _.get(path, 'parentPath.parentPath');
    if (!(importId && moduleName && grandParentPath)) return;
    const old = this.importedModules[importId];
    this.importedModules[importId] = _.merge(old, {
      moduleName,
      path: grandParentPath,
    });
  }
}

function captureUsageOfImportedFunction(path) {
  // e.g.
  // fs.readFileSync
  // importId = fs
  // functionName = readFileSync
  if (_.get(path, 'node.callee.object')) {
    const importId = _.get(path, 'node.callee.object.name');
    const functionName = _.get(path, 'node.callee.property.name');
    if (importId && functionName) {
      const functions = _.get(this.importedModules, [importId, 'functions'], []);
      functions.push(functionName);
      const old = this.importedModules[importId];
      this.importedModules[importId] = _.merge(old, { functions });
    }
  }
}

module.exports = {
  mockInjectedFunctions,
  capturePathsOfRequiredModules,
  captureUsageOfImportedFunction,
};
