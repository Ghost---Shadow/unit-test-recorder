const { default: template } = require('@babel/template');
const t = require('@babel/types');
const _ = require('lodash');

const buildRequire = template(`
  const { mockRecorderWrapper, recorderWrapper } = require(SOURCE);
`);

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

const mockInjectorGenerator = (moduleName, functionName, fileName) => mockInjector({
  FP_ID: t.identifier(functionName),
  FP_STRING_LITERAL: t.stringLiteral(functionName),
  MODULE_ID: t.identifier(moduleName),
  MODULE_STRING_LITERAL: t.stringLiteral(moduleName),
  FILE_NAME: t.stringLiteral(fileName),
});

const expgen = template.expression('(...p) => recorderWrapper(META, FUN_AST, ...p)');

const metaGenerator = (
  path, name, paramIds, isDefault, isEcmaDefault, isAsync,
) => t.objectExpression([
  t.objectProperty(t.identifier('path'), t.stringLiteral(path)),
  t.objectProperty(t.identifier('name'), t.stringLiteral(name)),
  t.objectProperty(t.identifier('paramIds'), t.stringLiteral(paramIds)),
  t.objectProperty(t.identifier('isDefault'), t.booleanLiteral(isDefault)),
  t.objectProperty(t.identifier('isEcmaDefault'), t.booleanLiteral(isEcmaDefault)),
  t.objectProperty(t.identifier('isAsync'), t.booleanLiteral(isAsync)),
]);

const getAstWithWrapper = (
  filePath,
  functionName,
  paramIds,
  isDefault,
  isEcmaDefault,
  isAsync,
  functionAst,
) => {
  if (functionAst.type === 'ArrowFunctionExpression') {
    return expgen({
      META: metaGenerator(filePath, functionName, paramIds.join(','), isDefault, isEcmaDefault, isAsync),
      FUN_AST: t.arrowFunctionExpression(functionAst.params, functionAst.body, isAsync),
    });
  }
  if (functionAst.type === 'FunctionDeclaration') {
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(functionName),
        expgen({
          META: metaGenerator(filePath, functionName, paramIds.join(','), isDefault, isEcmaDefault, isAsync),
          FUN_AST: t.functionExpression(
            t.identifier(functionName),
            functionAst.params,
            functionAst.body,
            null,
            isAsync,
          ),
        }),
      ),
    ]);
  }
  console.error('Unknown type:', functionName, functionAst.type);
  return functionAst;
};

function mockInjectedFunctions() {
  Object.keys(this.importedModules).forEach((moduleId) => {
    this.calledFunctions[moduleId].forEach((functionId) => {
      if (!this.whiteListedModules[moduleId]) return;
      const { path } = this.importedModules[moduleId];
      const ast = mockInjectorGenerator(moduleId, functionId, this.fileName);
      path.insertAfter(ast);
    });
  });
}

module.exports = (/* { types: t } */) => ({
  name: 'unit-test-recorder',
  visitor: {
    Program: {
      enter() {
        this.importedModules = {};
        this.calledFunctions = {};
        this.functionsToReplace = {};
        // TODO: Make configurable
        this.whiteListedModules = { fs: true, axios: true };
      },
      exit(path) {
        const validFunctions = Object.keys(this.functionsToReplace)
          .filter(name => this.functionsToReplace[name].isExported
            && this.functionsToReplace[name].isFunction)
          .map(name => ({ name, ...this.functionsToReplace[name] }));
        if (validFunctions.length) {
          const recorderImportStatement = buildRequire({
            SOURCE: t.stringLiteral(this.importPath),
          });
          path.unshiftContainer('body', recorderImportStatement);
        }
        validFunctions.forEach((funObj) => {
          const newAst = getAstWithWrapper(
            this.fileName,
            funObj.name,
            funObj.paramIds,
            funObj.isDefault,
            funObj.isEcmaDefault,
            funObj.isAsync,
            funObj.path.node,
          );
          newAst.async = funObj.isAsync;
          funObj.path.replaceWith(newAst);
        });

        mockInjectedFunctions.bind(this)();
      },
    },
    ArrowFunctionExpression(path) {
      const functionName = _.get(path, 'parent.id.name');
      if (functionName) {
        const isAsync = !!path.node.async;
        const paramIds = path.node.params.map(p => p.name);
        const old = this.functionsToReplace[functionName];
        this.functionsToReplace[functionName] = _.merge(old, {
          isFunction: true, paramIds, path, isAsync,
        });
      }
    },
    FunctionDeclaration(path) {
      const functionName = _.get(path, 'node.id.name');
      if (functionName) {
        const isAsync = !!path.node.async;
        const paramIds = path.node.params.map(p => p.name);
        const old = this.functionsToReplace[functionName];
        this.functionsToReplace[functionName] = _.merge(old, {
          isFunction: true, paramIds, path, isAsync,
        });
      }
    },
    ExportNamedDeclaration(path) {
      const declarations = _.get(path, 'node.declaration.declarations', []);
      declarations.forEach((declaration) => {
        const maybeFunctionName = _.get(declaration, 'id.name');
        if (!maybeFunctionName) return;
        const old = this.functionsToReplace[maybeFunctionName];
        this.functionsToReplace[maybeFunctionName] = _.merge(old, {
          isExported: true,
          isDefault: false,
          isEcmaDefault: false,
        });
      });
      const specifiers = _.get(path, 'node.specifiers', []);
      specifiers.forEach((specifier) => {
        const maybeFunctionName = _.get(specifier, 'local.name');
        if (!maybeFunctionName) return;
        const old = this.functionsToReplace[maybeFunctionName];
        this.functionsToReplace[maybeFunctionName] = _.merge(old, {
          isExported: true,
          isDefault: false,
          isEcmaDefault: false,
        });
      });
    },
    ExportDefaultDeclaration(path) {
      const maybeFunctionName = _.get(path, 'node.declaration.name');
      if (maybeFunctionName) {
        const old = this.functionsToReplace[maybeFunctionName];
        this.functionsToReplace[maybeFunctionName] = _.merge(old, {
          isExported: true,
          isDefault: true,
          isEcmaDefault: true,
        });
      }
    },
    AssignmentExpression(path) {
      const { left } = path.node;
      const isModuleExports = _.get(left, 'object.name') === 'module'
        && _.get(left, 'property.name') === 'exports';
      if (isModuleExports) {
        path.traverse({
          ObjectProperty(innerPath) {
            const functionName = innerPath.node.value.name;
            const old = this.functionsToReplace[functionName];
            this.functionsToReplace[functionName] = _.merge(old, {
              isExported: true,
              isDefault: false,
              isEcmaDefault: false,
            });
          },
        }, this);
        if (t.isIdentifier(path.node.right)) {
          const functionName = path.node.right.name;
          const old = this.functionsToReplace[functionName];
          this.functionsToReplace[functionName] = _.merge(old, {
            isExported: true,
            isDefault: true,
            isEcmaDefault: false,
          });
        }
      }
    },
    CallExpression(path) {
      if (_.get(path, 'node.callee.name') === 'require') {
        this.importedModules[path.parent.id.name] = {
          moduleName: path.node.arguments[0].value,
          path: path.parentPath.parentPath,
        };
      }
      if (_.get(path, 'node.callee.object')) {
        const left = _.get(path, 'node.callee.object.name');
        const right = _.get(path, 'node.callee.property.name');

        if (left && right) {
          if (!this.calledFunctions[left]) {
            this.calledFunctions[left] = [];
          }
          this.calledFunctions[left].push(right);
        }
      }
    },
  },
});
