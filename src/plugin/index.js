const { default: template } = require('@babel/template');
const t = require('@babel/types');

// TODO: Make this configurable
const RECORDER_PATH = '../../../src/recorder/recorder';
const buildRequire = template(`
  var { recorderWrapper } = require(SOURCE);
`);

const recorderImportStatement = buildRequire({
  SOURCE: t.stringLiteral(RECORDER_PATH),
});

const expgen = template.expression('(...p) => recorderWrapper(FUN_LIT,FUN_ID, ...p)');

const getAstForExport = functionName => t.objectProperty(
  t.identifier(functionName),
  expgen({
    FUN_ID: t.identifier(functionName),
    FUN_LIT: t.stringLiteral(functionName),
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
          if (this.validFunctions[functionName]) {
            p.replaceWith(getAstForExport(functionName));
          }
        });
      },
    },
    ArrowFunctionExpression(path) {
      this.validFunctions[path.parent.id.name] = true;
    },
    FunctionDeclaration(path) {
      this.validFunctions[path.node.id.name] = true;
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
