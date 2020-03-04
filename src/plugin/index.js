const { default: template } = require('@babel/template');
const t = require('@babel/types');
const _ = require('lodash');

// TODO: Make this configurable
const buildRequire = template(`
  var { recorderWrapper } = require(SOURCE);
`);

const expgen = template.expression('(...p) => recorderWrapper(PATH,FUN_LIT,FUN_PN,IS_DEF,FUN_AST, ...p)');

const getAstWithWrapper = (
  filePath,
  functionName,
  paramIds,
  isDefault,
  functionAst,
) => ({
  ArrowFunctionExpression: expgen({
    PATH: t.stringLiteral(filePath),
    FUN_LIT: t.stringLiteral(functionName),
    FUN_PN: t.stringLiteral(paramIds.join(',')),
    IS_DEF: t.booleanLiteral(isDefault),
    FUN_AST: t.arrowFunctionExpression(functionAst.params, functionAst.body),
  }),
  FunctionDeclaration: t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(functionName),
      expgen({
        PATH: t.stringLiteral(filePath),
        FUN_LIT: t.stringLiteral(functionName),
        FUN_PN: t.stringLiteral(paramIds.join(',')),
        IS_DEF: t.booleanLiteral(isDefault),
        FUN_AST: functionAst.body.type === 'BinaryExpression'
          ? t.arrowFunctionExpression(functionAst.params, functionAst.body)
          : t.functionExpression(
            t.identifier(functionName),
            functionAst.params,
            functionAst.body,
          ),
      }),
    ),
  ]),
}[functionAst.type]);

module.exports = (/* { types: t } */) => ({
  name: 'unit-test-recorder',
  visitor: {
    Program: {
      enter() {
        this.functionsToReplace = {};
      },
      exit(path) {
        const validFunctions = Object.keys(this.functionsToReplace)
          .filter(name => this.functionsToReplace[name].isExported
            && this.functionsToReplace[name].isFunction)
          .map(name => ({
            name,
            paramIds: this.functionsToReplace[name].paramIds,
            path: this.functionsToReplace[name].path,
            isDefault: this.functionsToReplace[name].isDefault,
          }));
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
            funObj.path.node,
          );
          funObj.path.replaceWith(newAst);
        });
      },
    },
    ArrowFunctionExpression(path) {
      const functionName = _.get(path, 'parent.id.name');
      if (functionName) {
        const paramIds = path.node.params.map(p => p.name);
        const old = this.functionsToReplace[functionName];
        this.functionsToReplace[functionName] = _.merge(old, { isFunction: true, paramIds, path });
      }
    },
    FunctionDeclaration(path) {
      const functionName = _.get(path, 'node.id.name');
      if (functionName) {
        const paramIds = path.node.params.map(p => p.name);
        const old = this.functionsToReplace[functionName];
        this.functionsToReplace[functionName] = _.merge(old, { isFunction: true, paramIds, path });
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
            });
          },
        }, this);
        if (t.isIdentifier(path.node.right)) {
          const functionName = path.node.right.name;
          const old = this.functionsToReplace[functionName];
          this.functionsToReplace[functionName] = _.merge(old, {
            isExported: true,
            isDefault: true,
          });
        }
      }
    },
  },
});
