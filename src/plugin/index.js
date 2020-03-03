const { default: template } = require('@babel/template');
const t = require('@babel/types');
const _ = require('lodash');

// TODO: Make this configurable
const buildRequire = template(`
  var { recorderWrapper } = require(SOURCE);
`);

const expgen = template.expression('(...p) => recorderWrapper(PATH,FUN_LIT,FUN_ID,FUN_PN, ...p)');

const getAstForExport = (filePath, functionName, paramIds) => t.objectProperty(
  t.identifier(functionName),
  expgen({
    PATH: t.stringLiteral(filePath),
    FUN_ID: t.identifier(functionName),
    FUN_LIT: t.stringLiteral(functionName),
    FUN_PN: t.stringLiteral(paramIds.join(',')),
  }),
);

module.exports = (/* { types: t } */) => ({
  name: 'unit-test-recorder',
  visitor: {
    Program: {
      enter() {
        this.pathsToReplace = [];
        this.validFunctions = {};
      },
      exit(path) {
        if (this.pathsToReplace.length) {
          const recorderImportStatement = buildRequire({
            SOURCE: t.stringLiteral(this.importPath),
          });
          path.unshiftContainer('body', recorderImportStatement);
        }
        this.pathsToReplace.forEach((p) => {
          const functionName = p.node.key.name;
          const paramIds = this.validFunctions[functionName];
          if (paramIds) {
            p.replaceWith(getAstForExport(this.fileName, functionName, paramIds));
          }
        });
      },
    },
    ArrowFunctionExpression(path) {
      if (_.get(path, 'parent.id.name')) {
        this.validFunctions[path.parent.id.name] = path.node.params.map(p => p.name);
      }
    },
    FunctionDeclaration(path) {
      if (_.get(path, 'node.id.name')) {
        this.validFunctions[path.node.id.name] = path.node.params.map(p => p.name);
      }
    },
    AssignmentExpression(path) {
      const { left } = path.node;
      const isModuleExports = _.get(left, 'object.name') === 'module'
        && _.get(left, 'property.name') === 'exports';
      if (isModuleExports) {
        path.traverse({
          ObjectProperty(innerPath) {
            this.pathsToReplace.push(innerPath);
          },
        }, this);
      }
    },
  },
});
