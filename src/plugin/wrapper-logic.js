const { default: template } = require('@babel/template');
const t = require('@babel/types');
const { metaGenerator } = require('./meta');

const buildRequire = template(`
  const { IDENTIFIER } = require(SOURCE);
`);

function maybeAddImportStatement(path) {
  if (this.validFunctions.length || this.atLeastOneRecorderWrapperUsed) {
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
  const getExportedName = (localName) => {
    const { exportedAs } = this.functionsToReplace[localName];
    if (exportedAs && exportedAs !== 'default') {
      return exportedAs;
    }
    return localName;
  };

  // The identifier must be export and a function
  return Object.keys(this.functionsToReplace)
    .filter(localName => this.functionsToReplace[localName].isExported
      && this.functionsToReplace[localName].isFunction)
    .map(localName => ({
      // localName,
      name: getExportedName(localName),
      ...this.functionsToReplace[localName],
    }));
}

const expgen = template.expression('(...p) => recorderWrapper(META, FUN_AST, ...p)');

const getAstWithWrapper = (
  filePath,
  funObj,
) => {
  const functionAst = funObj.path.node;
  const { name: functionName, isAsync } = funObj;
  const meta = metaGenerator(filePath, funObj);
  if (functionAst.type === 'ArrowFunctionExpression') {
    return expgen({
      META: meta,
      FUN_AST: t.arrowFunctionExpression(functionAst.params, functionAst.body, isAsync),
    });
  }
  if (functionAst.type === 'FunctionDeclaration') {
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(functionName),
        expgen({
          META: meta,
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
    const newAst = getAstWithWrapper(this.fileName, funObj);
    newAst.async = funObj.isAsync;
    funObj.path.replaceWith(newAst);
  });
}

module.exports = {
  getValidFunctions,
  maybeAddImportStatement,
  injectValidFunctions,
};
