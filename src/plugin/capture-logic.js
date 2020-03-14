const t = require('@babel/types');
const _ = require('lodash');

// Capture exported function from module exports
function captureEfFromMe(path) {
  const { left } = path.node;
  const isModuleExports = _.get(left, 'object.name') === 'module'
    && _.get(left, 'property.name') === 'exports';
  if (isModuleExports) {
    const right = _.get(path, 'node.right');
    if (!right) return;
    if (t.isIdentifier(right)) {
      // module.exports = foo
      const functionName = right.name;
      if (!functionName) return;
      const old = this.functionsToReplace[functionName];
      this.functionsToReplace[functionName] = _.merge(old, {
        isExported: true,
        isDefault: true,
        isEcmaDefault: false,
      });
    } else {
      // module.exports = { foo, bar }
      path.traverse({
        ObjectProperty(innerPath) {
          const functionName = _.get(innerPath, 'node.value.name');
          if (!functionName) return;
          const old = this.functionsToReplace[functionName];
          this.functionsToReplace[functionName] = _.merge(old, {
            isExported: true,
            isDefault: false,
            isEcmaDefault: false,
          });
        },
      }, this);
    }
  }
}

// Capture exported function from export default
function captureEfFromEd(path) {
  const maybeFunctionName = _.get(path, 'node.declaration.name');
  if (maybeFunctionName) {
    const old = this.functionsToReplace[maybeFunctionName];
    this.functionsToReplace[maybeFunctionName] = _.merge(old, {
      isExported: true,
      isDefault: true,
      isEcmaDefault: true,
    });
  }
}

// Capture exported function from export named declaration
function captureEfFromEn(path) {
  const storeIfValid = (maybeFunctionName) => {
    if (!maybeFunctionName) return;
    const old = this.functionsToReplace[maybeFunctionName];
    this.functionsToReplace[maybeFunctionName] = _.merge(old, {
      isExported: true,
      isDefault: false,
      isEcmaDefault: false,
    });
  };
  const declarations = _.get(path, 'node.declaration.declarations', []);
  declarations.forEach((declaration) => {
    // export foo = 42
    const maybeFunctionName = _.get(declaration, 'id.name');
    storeIfValid(maybeFunctionName);
  });
  const specifiers = _.get(path, 'node.specifiers', []);
  specifiers.forEach((specifier) => {
    // foo = 42
    // export { foo }
    const maybeFunctionName = _.get(specifier, 'local.name');
    storeIfValid(maybeFunctionName);
  });
}

// Capture function from function Declaration
function captureFunFromFd(path) {
  const functionName = _.get(path, 'node.id.name');
  if (functionName) {
    const isAsync = !!_.get(path, 'node.async');
    const params = _.get(path, 'node.params', []);
    const paramIds = params.map(p => p.name);
    const old = this.functionsToReplace[functionName];
    this.functionsToReplace[functionName] = _.merge(old, {
      isFunction: true,
      paramIds,
      path,
      isAsync,
    });
  }
}

// Capture function from arrow function expression
function captureFunFromAf(path) {
  const functionName = _.get(path, 'parent.id.name');
  if (functionName) {
    const isAsync = !!path.node.async;
    const paramIds = path.node.params.map(p => p.name);
    const old = this.functionsToReplace[functionName];
    this.functionsToReplace[functionName] = _.merge(old, {
      isFunction: true, paramIds, path, isAsync,
    });
  }
}

module.exports = {
  captureEfFromMe,
  captureEfFromEd,
  captureEfFromEn,

  captureFunFromFd,
  captureFunFromAf,
};
