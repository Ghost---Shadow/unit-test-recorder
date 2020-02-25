const { default: template } = require('@babel/template');
const t = require('@babel/types');

// TODO: Make this configurable
const RECORDER_PATH = '../../../src/recorder';
const buildRequire = template(`
  var { recorderWrapper } = require(SOURCE);
`);

const recorderImportStatement = buildRequire({
  SOURCE: t.stringLiteral(RECORDER_PATH),
});

const expgen = template.expression('(...p) => recorderWrapper(FUN_LIT,FUN_ID,FUN_PN, ...p)');

const getAstForExport = (functionName, paramIds) => t.objectProperty(
  t.identifier(functionName),
  expgen({
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
        path.unshiftContainer('body', recorderImportStatement);
        this.pathsToReplace.forEach((p) => {
          const functionName = p.node.key.name;
          const paramIds = this.validFunctions[functionName];
          if (paramIds) {
            p.replaceWith(getAstForExport(functionName, paramIds));
          }
        });
      },
    },
    ArrowFunctionExpression(path) {
      this.validFunctions[path.parent.id.name] = path.node.params.map(p => p.name);
    },
    FunctionDeclaration(path) {
      this.validFunctions[path.node.id.name] = path.node.params.map(p => p.name);
    },
    AssignmentExpression(path) {
      const { left } = path.node;
      const isModuleExports = left.object.name === 'module'
        && left.property.name === 'exports';
      if (isModuleExports) {
        path.traverse({
          ObjectProperty(innerPath) {
            this.pathsToReplace.push(innerPath);
          },
        });
      }
    },
  },
});
