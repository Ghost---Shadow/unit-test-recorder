const { default: template } = require('@babel/template');
const t = require('@babel/types');

const buildRequire = template(`
  const { IDENTIFIER } = require(SOURCE);
`);

function maybeAddImportStatement(path) {
  if (this.validFunctions.length) {
    const recorderImportStatement = buildRequire({
      SOURCE: t.stringLiteral(this.importPath),
      IDENTIFIER: t.identifier('recorderWrapper'),
    });
    path.unshiftContainer('body', recorderImportStatement);
  }

  if (this.atLeastOneMockUsed) {
    const recorderImportStatement = buildRequire({
      SOURCE: t.stringLiteral(this.importPath),
      IDENTIFIER: t.identifier('mockRecorderWrapper'),
    });
    path.unshiftContainer('body', recorderImportStatement);
  }
}

function getValidFunctions() {
  // The identifier must be export and a function
  return Object.keys(this.functionsToReplace)
    .filter(name => this.functionsToReplace[name].isExported
    && this.functionsToReplace[name].isFunction)
    .map(name => ({ name, ...this.functionsToReplace[name] }));
}

const expgen = template.expression('(...p) => recorderWrapper(META, FUN_AST, ...p)');

const metaGenerator = (
  path, name, paramIds, isDefault, isEcmaDefault, isAsync,
) => t.objectExpression([
  t.objectProperty(t.identifier('path'), t.stringLiteral(path)),
  t.objectProperty(t.identifier('name'), t.stringLiteral(name)),
  t.objectProperty(t.identifier('paramIds'), t.arrayExpression(paramIds.map(pid => t.stringLiteral(pid)))),
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
      META: metaGenerator(filePath, functionName, paramIds, isDefault, isEcmaDefault, isAsync),
      FUN_AST: t.arrowFunctionExpression(functionAst.params, functionAst.body, isAsync),
    });
  }
  if (functionAst.type === 'FunctionDeclaration') {
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(functionName),
        expgen({
          META: metaGenerator(filePath, functionName, paramIds, isDefault, isEcmaDefault, isAsync),
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

function injectValidFunctions() {
  this.validFunctions.forEach((funObj) => {
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
}

module.exports = {
  getValidFunctions,
  maybeAddImportStatement,
  injectValidFunctions,
};
