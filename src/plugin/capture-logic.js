const t = require('@babel/types');
const _ = require('lodash');

// e.g.
// foo.bar.baz('something')
// callee = foo.bar.baz (MemberExpression)
// returns = foo
const getRootObject = (callee, depth = 0) => {
  if (!_.isObject(callee)) return null;
  if (callee.object === undefined) {
    return { name: callee.name, depth };
  }
  if (t.isThisExpression(callee.object)) {
    return { name: 'this', depth };
  }

  return getRootObject(callee.object, depth + 1);
};

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

// Capture exported function from exports property
function captureEfFromEp(path) {
  // e.g.
  // exports.foo = foooos
  // objName = exports
  // exportedAs = foo
  // functionName = foooos
  const obj = _.get(path, 'node.left.object');
  const exportedAs = _.get(path, 'node.left.property.name');
  const functionName = _.get(path, 'node.right.name');

  const effectiveFunctionName = functionName || exportedAs;

  const { name: objName, depth } = getRootObject(obj);
  const isExports = objName === 'exports' || (objName === 'module' && depth > 0);

  if (isExports && effectiveFunctionName) {
    const old = this.functionsToReplace[effectiveFunctionName];
    this.functionsToReplace[effectiveFunctionName] = _.merge(old, {
      isExported: true,
      isDefault: false,
      isEcmaDefault: exportedAs === 'default',
    });
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
  // const foo = () => 42
  const functionName = _.get(path, 'parent.id.name');
  // module.exports.foo = () => 42
  const exportedAs = _.get(path, 'parent.left.property.name');

  const effectiveFunctionName = functionName || exportedAs;

  if (effectiveFunctionName) {
    const isAsync = !!path.node.async;
    const paramIds = path.node.params.map(p => p.name);
    const old = this.functionsToReplace[effectiveFunctionName];
    this.functionsToReplace[effectiveFunctionName] = _.merge(old, {
      isFunction: true, paramIds, path, isAsync,
    });
  }
}

// Get the names of all params in scope
const getParamBindingsInScope = path => Object
  .keys(path.scope.bindings)
  .map(fnName => path.scope.bindings[fnName])
  .filter(obj => obj.kind === 'param')
  .map(obj => obj.identifier.name);

// Capture called functions for dependency injections
function captureFunForDi(path) {
  // e.g.
  // foo.bar('param')
  // functionName = bar
  // injectionFunctionPaths = path of bar
  const hasObject = !!_.get(path, 'node.callee.object');
  const hasProperty = !!_.get(path, 'node.callee.property');
  const functionName = _.get(path, 'node.callee.property.name');
  if (hasObject && hasProperty && functionName) {
    // Dont process if call expression is not form a param injection
    const params = getParamBindingsInScope(path).concat('this');
    const { name: rootId } = getRootObject(path.node.callee);
    if (_.findIndex(params, p => p === rootId) === -1) return;

    const functionPath = path.get('callee').get('property');
    const index = _.findIndex(this.injectedFunctions, { name: functionName });
    if (index === -1) {
      this.injectedFunctions.push({
        name: functionName,
        paths: [functionPath],
      });
      return;
    }
    this.injectedFunctions[index].paths.push(functionPath);
  }
}

module.exports = {
  captureEfFromMe,
  captureEfFromEd,
  captureEfFromEn,
  captureEfFromEp,

  captureFunFromFd,
  captureFunFromAf,

  captureFunForDi,
};
