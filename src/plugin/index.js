const t = require('@babel/types');
const _ = require('lodash');

const {
  mockInjectedFunctions,
  capturePathsOfRequiredModules,
  captureUsageOfImportedFunction,
} = require('./mocks-logic');

const {
  getValidFunctions,
  maybeAddImportStatement,
  injectValidFunctions,
} = require('./wrapper-logic');

module.exports = (/* { types: t } */) => ({
  name: 'unit-test-recorder',
  visitor: {
    Program: {
      enter() {
        // Function bindings for mock-logic
        this.mockInjectedFunctions = mockInjectedFunctions.bind(this);
        this.capturePathsOfRequiredModules = capturePathsOfRequiredModules.bind(this);
        this.captureUsageOfImportedFunction = captureUsageOfImportedFunction.bind(this);

        // Function bindings for wrapper-logic
        this.getValidFunctions = getValidFunctions.bind(this);
        this.maybeAddImportStatement = maybeAddImportStatement.bind(this);
        this.injectValidFunctions = injectValidFunctions.bind(this);

        // States
        this.importedModules = {};
        this.functionsToReplace = {};
        this.validFunctions = [];
        // TODO: Make configurable
        this.whiteListedModules = { fs: true, axios: true };
      },
      exit(path) {
        this.validFunctions = this.getValidFunctions();
        this.maybeAddImportStatement(path);
        this.injectValidFunctions();
        this.mockInjectedFunctions();
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
      this.capturePathsOfRequiredModules(path);
      this.captureUsageOfImportedFunction(path);
    },
  },
});
