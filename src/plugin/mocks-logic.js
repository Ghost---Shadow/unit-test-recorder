const t = require('@babel/types');
const { default: template } = require('@babel/template');
const _ = require('lodash');

const { newFunctionNameGenerator } = require('../util/misc');

const mockInjectorObjLike = template(`
MODULE_ID.NEW_FP_ID = (...p) => mockRecorderWrapper({
  path: FILE_NAME,
  moduleName: MODULE_STRING_LITERAL,
  name: FP_STRING_LITERAL,
}, MODULE_ID.FP_ID, ...p);
`);

const mockInjector = template(`
const NEW_FP_ID = (...p) => mockRecorderWrapper({
  path: FILE_NAME,
  moduleName: MODULE_STRING_LITERAL,
  name: FP_STRING_LITERAL,
}, FP_ID, ...p);
`);

const mockInjectorGenerator = (
  moduleId, moduleName, importId, importedAs,
  newFunctionName, fileName, isObjectLike,
) => {
  if (isObjectLike) {
    return mockInjectorObjLike({
      FP_ID: t.identifier(importedAs),
      NEW_FP_ID: t.identifier(newFunctionName),
      FP_STRING_LITERAL: t.stringLiteral(importedAs),
      MODULE_ID: t.identifier(moduleId),
      MODULE_STRING_LITERAL: t.stringLiteral(moduleName),
      FILE_NAME: t.stringLiteral(fileName),
    });
  }
  return mockInjector({
    FP_ID: t.identifier(importedAs),
    NEW_FP_ID: t.identifier(newFunctionName),
    FP_STRING_LITERAL: t.stringLiteral(importId),
    // MODULE_ID: t.identifier(moduleId),
    MODULE_STRING_LITERAL: t.stringLiteral(moduleName),
    FILE_NAME: t.stringLiteral(fileName),
  });
};

const isWhitelisted = (moduleName, whiteListedModules) => {
  if (`${moduleName}`.startsWith('.')) return true;
  if (whiteListedModules[moduleName]) return true;
  return false;
};

function mockInjectedFunctions() {
  Object.keys(this.importedModules).forEach((moduleId) => {
    // Early exit if module is not whitelisted
    const {
      path, moduleName, isObjectLike, importId,
    } = this.importedModules[moduleId];
    if (!isWhitelisted(moduleName, this.whiteListedModules)) return;

    const functionObj = _.get(this.importedModules, [moduleId, 'functions'], {});
    Object.keys(functionObj).forEach((importedAs) => {
      this.atLeastOneMockUsed = true;

      // Add mock injection AST
      const newFunctionName = newFunctionNameGenerator(importedAs, this.fileName);
      const ast = mockInjectorGenerator(
        moduleId, moduleName, importId, importedAs, newFunctionName, this.fileName, isObjectLike,
      );
      path.insertAfter(ast);

      // Replace all the call paths with new function name
      const callPaths = this.importedModules[moduleId].functions[importedAs].map(f => f.callPath);
      callPaths.forEach((callPath) => {
        callPath.node.name = newFunctionName;
      });
    });
  });
}

function capturePathsOfRequiredModules(path) {
  if (_.get(path, 'node.callee.name') === 'require') {
    const idNode = _.get(path, 'parent.id');
    if (t.isIdentifier(idNode)) {
      // e.g.
      // const fileSystem = require('fs')
      // importId = fileSystem
      // moduleName = fs
      // grandParentPath = path of the require statement
      const importId = _.get(path, 'parent.id.name');
      const importedAs = importId;
      const moduleName = _.get(path, 'node.arguments[0].value');
      const grandParentPath = _.get(path, 'parentPath.parentPath');
      if (!(importedAs && moduleName && grandParentPath)) return;
      const old = this.importedModules[importedAs];
      this.importedModules[importedAs] = _.merge(old, {
        moduleName,
        isObjectLike: true,
        importId,
        importedAs,
        path: grandParentPath,
      });
    } else if (t.isObjectPattern(idNode)) {
      // e.g.
      // const { readFileSync, writeFileSync: wfs } = require('fs')
      // importIds = [readFileSync, writeFileSync]
      // importedAs = [readFileSync, wfs]
      // moduleName = fs
      // grandParentPath = path of the require statement
      const objectProperties = _.get(path, 'parent.id.properties', []);
      const moduleName = _.get(path, 'node.arguments[0].value');
      const grandParentPath = _.get(path, 'parentPath.parentPath');
      objectProperties.forEach((opNode) => {
        const importId = _.get(opNode, 'key.name');
        const importedAs = _.get(opNode, 'value.name');
        if (!(importId && moduleName && grandParentPath)) return;
        const old = this.importedModules[importId];
        this.importedModules[importedAs] = _.merge(old, {
          moduleName,
          importId,
          importedAs,
          isObjectLike: false,
          path: grandParentPath,
        });
      });
    }
  }
}

function captureUsageOfImportedFunction(path) {
  const callee = _.get(path, 'node.callee');
  if (t.isMemberExpression(callee)) {
    // e.g.
    // fs.readFileSync
    // importId = fs
    // functionId = readFileSync
    const importId = _.get(path, 'node.callee.object.name');
    const functionId = _.get(path, 'node.callee.property.name');
    if (importId && functionId) {
      const callPath = path.get('callee').get('property');
      const functions = _.get(this.importedModules, [importId, 'functions', functionId], []);
      functions.push({ callPath });
      _.set(this.importedModules, [importId, 'functions', functionId], functions);
    }
  } else if (t.isIdentifier(callee)) {
    // e.g.
    // readFileSync
    // importId = readFileSync
    // functionId = readFileSync
    const importId = _.get(path, 'node.callee.name');
    const functionId = importId;
    if (importId === 'require') return;
    if (importId) {
      const callPath = path.get('callee');
      const functions = _.get(this.importedModules, [importId, 'functions', functionId], []);
      functions.push({ callPath });
      _.set(this.importedModules, [importId, 'functions', functionId], functions);
    }
  }
}

module.exports = {
  mockInjectedFunctions,
  capturePathsOfRequiredModules,
  captureUsageOfImportedFunction,
};
