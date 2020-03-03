const { default: template } = require('@babel/template');
const t = require('@babel/types');
const _ = require('lodash');

// TODO: Make this configurable
const buildRequire = template(`
  var { recorderWrapper } = require(SOURCE);
`);

const expgen = template.expression('(...p) => recorderWrapper(PATH,FUN_LIT,FUN_ID,FUN_PN,IS_DEF, ...p)');

const getAstForModuleExportObjProp = (
  filePath,
  functionName,
  paramIds,
  isDefault,
) => t.objectProperty(
  t.identifier(functionName),
  expgen({
    PATH: t.stringLiteral(filePath),
    FUN_ID: t.identifier(functionName),
    FUN_LIT: t.stringLiteral(functionName),
    FUN_PN: t.stringLiteral(paramIds.join(',')),
    IS_DEF: t.booleanLiteral(isDefault),
  }),
);

const getAstForModuleExport = (filePath, functionName, paramIds, isDefault) => expgen({
  PATH: t.stringLiteral(filePath),
  FUN_ID: t.identifier(functionName),
  FUN_LIT: t.stringLiteral(functionName),
  FUN_PN: t.stringLiteral(paramIds.join(',')),
  IS_DEF: t.booleanLiteral(isDefault),
});

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
          if (t.isObjectProperty(p)) {
            const functionName = p.node.key.name;
            const paramIds = this.validFunctions[functionName];
            if (paramIds) {
              p.replaceWith(getAstForModuleExportObjProp(
                this.fileName,
                functionName,
                paramIds,
                false,
              ));
            }
          } else if (t.isIdentifier(p)) {
            const functionName = p.node.name;
            const paramIds = this.validFunctions[functionName];
            if (paramIds) {
              p.replaceWith(getAstForModuleExport(this.fileName, functionName, paramIds, true));
            }
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
        if (t.isIdentifier(path.node.right)) {
          this.pathsToReplace.push(path.get('right'));
        }
      }
    },
  },
});
