const t = require('@babel/types');
const _ = require('lodash');

const ANON_DEFAULT_IDENTIFIER = 'defaultExport';

// https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export
// Work in progress

// e.g.
// foo.bar.baz('something')
// callee = foo.bar.baz (MemberExpression)
// returns = foo
const getRootObject = (callee, depth = 0) => {
  // TODO: Find a test case for this
  if (!_.isObject(callee)) return {};
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
    } else if (t.isObjectExpression(right)) {
      // module.exports = { foo, bar }
      path.traverse({
        ObjectProperty(innerPath) {
          const functionName = _.get(innerPath, 'node.value.name');
          const exportedAs = _.get(innerPath, 'node.key.name');
          if (!functionName) return;
          const old = this.functionsToReplace[functionName];
          this.functionsToReplace[functionName] = _.merge(old, {
            exportedAs,
            isExported: true,
            isDefault: false,
            isEcmaDefault: false,
          });
        },
      }, this);
    } else if (t.isArrowFunctionExpression(right)) {
      // module.exports = a => a
      const functionName = ANON_DEFAULT_IDENTIFIER;
      const old = this.functionsToReplace[functionName];
      this.functionsToReplace[functionName] = _.merge(old, {
        isExported: true,
        isDefault: true,
        isEcmaDefault: false,
      });
    }
    // TODO: Function expression
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
    const fixedExportedAs = effectiveFunctionName === 'default' ? ANON_DEFAULT_IDENTIFIER : exportedAs;
    this.functionsToReplace[effectiveFunctionName] = _.merge(old, {
      exportedAs: fixedExportedAs,
      isExported: true,
      isDefault: false,
      isEcmaDefault: exportedAs === 'default',
    });
  }
}

// Capture exported function from export default
function captureEfFromEd(path) {
  const maybeFunctionName = _.get(path, 'node.declaration.name', ANON_DEFAULT_IDENTIFIER);
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
  const storeIfValid = (maybeFunctionName, exportedAs) => {
    if (!maybeFunctionName) return;
    const old = this.functionsToReplace[maybeFunctionName];
    this.functionsToReplace[maybeFunctionName] = _.merge(old, {
      exportedAs,
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
    const exportedAs = _.get(specifier, 'exported.name');
    storeIfValid(maybeFunctionName, exportedAs);
  });
}

const generateSafeParamIds = (path) => {
  const params = _.get(path, 'node.params', []);
  const paramIds = params.map((param) => {
    if (t.isIdentifier(param)) {
      return param.name;
    }
    if (t.isObjectPattern(param)) {
      return path.scope.generateUidIdentifier('obj').name;
    }
    if (t.isAssignmentPattern(param)) {
      return _.get(param, 'left.name', 'unhandled_assignment_pattern_default');
    }
    return _.snakeCase(`unhandled.${param.type}`);
  });
  return paramIds;
};

// Capture function from function Declaration
function captureFunFromFd(path) {
  const functionName = _.get(path, 'node.id.name');
  if (functionName) {
    const isAsync = !!_.get(path, 'node.async');
    const paramIds = generateSafeParamIds(path);
    const old = this.functionsToReplace[functionName];
    this.functionsToReplace[functionName] = _.merge(old, {
      isFunction: true,
      isObject: false,
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
  // module.exports = () => 42
  const effectiveExportedAs = exportedAs === 'exports' ? ANON_DEFAULT_IDENTIFIER : exportedAs;
  // Is anonymous export default
  const isAnonDefault = _.get(path, 'parent.type') === 'ExportDefaultDeclaration' ? ANON_DEFAULT_IDENTIFIER : undefined;

  const effectiveFunctionName = functionName || effectiveExportedAs || isAnonDefault;

  if (effectiveFunctionName) {
    const isAsync = !!path.node.async;
    const paramIds = generateSafeParamIds(path);
    const old = this.functionsToReplace[effectiveFunctionName];
    this.functionsToReplace[effectiveFunctionName] = _.merge(old, {
      isObject: false,
      isFunction: true,
      paramIds,
      path,
      isAsync,
    });
  }
}

// Get the names of all params in scope
const getParamBindingsInScope = path => Object
  .keys(path.scope.bindings)
  .map(fnName => path.scope.bindings[fnName])
  .filter(obj => obj.kind === 'param')
  .map(obj => obj.identifier.name);


// // const fun = p => p => p
// const isHigherOrderFunction = (path) => {
//   const functor = p => p.isArrowFunctionExpression()
//     || p.isFunctionDeclaration()
//     || p.isFunctionExpression();
//   const path1 = path.findParent(functor);
//   if (!path1) return false;
//   const path2 = path1.findParent(functor);
//   if (!path2) return false;
//   return true;
// };

// const fun = p => p
// parentFunctionName = fun
const getParentFunctionName = (path) => {
  const functor = p => p.isArrowFunctionExpression()
    || p.isFunctionDeclaration()
    || p.isFunctionExpression()
    || p.isObjectMethod();
  const parentPath = path.findParent(functor);
  if (!parentPath) return null;
  // Function likes
  const n1 = _.get(parentPath, 'node.id.name');
  // Arrow functions
  const n2 = _.get(parentPath, 'parent.id.name');
  // Object method
  const n3 = _.get(parentPath, 'node.key.name');
  // Object property arrow function
  const n4 = _.get(parentPath, 'parent.key.name');
  // exports.foo = foo
  const n5 = _.get(parentPath, 'parent.left.property.name');

  return n1 || n2 || n3 || n4 || n5 || null;
};

// const obj = {fun: p => p, fun2(p){return p}}
const getOutermostObjectName = (path) => {
  const functor = p => p.isObjectExpression();
  let oePath = path.findParent(functor);
  if (!oePath) return null;
  let lastOePath;
  while (oePath) {
    lastOePath = oePath;
    oePath = oePath.findParent(functor);
  }

  const leftName = _.get(lastOePath, 'parent.left.name');
  const idName = _.get(lastOePath, 'parent.id.name');
  return leftName || idName || null;
};

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
    // Dont process blacklisted functions. e.g. map, reduce, filter
    if (this.injectionBlackList[functionName]) return;

    // Dont process if call expression is not form a param injection
    const params = getParamBindingsInScope(path).concat('this');
    const { name: rootId } = getRootObject(path.node.callee);
    if (_.findIndex(params, p => p === rootId) === -1) return;

    // Dont process anonymous functions
    const parentFunctionName = getParentFunctionName(path);
    if (!parentFunctionName) return;

    // // TODO: WIP: Dont process higher order functions
    // if (isHigherOrderFunction(path)) return;

    // If outermost object is whitelisted then it is also valid
    const outermostObjName = getOutermostObjectName(path);

    const functionPath = path.get('callee').get('property');
    const addr = [functionName, parentFunctionName, 'paths'];
    if (!_.get(this.injectedFunctions, addr)) {
      _.set(this.injectedFunctions, addr, []);
    }
    this.injectedFunctions[functionName][parentFunctionName].paths.push(functionPath);
    this.injectedFunctions[functionName][parentFunctionName].objName = outermostObjName;
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
