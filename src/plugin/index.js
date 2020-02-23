const { default: template } = require('@babel/template');
// const generate = require('@babel/generator');
const t = require('@babel/types');
// const _ = require('lodash');

// TODO: Make this configurable
const RECORDER_PATH = '../../../src/recorder/recorder';
const buildRequire = template(`
  var { recorderWrapper } = require(SOURCE);
`);

const recorderImportStatement = buildRequire({
  SOURCE: t.stringLiteral(RECORDER_PATH),
});

module.exports = (/* { types: t } */) => ({
  name: 'unit-test-recorder',
  visitor: {
    Program: {
      enter(path) {
        console.log(path);
      },
      exit(path) {
        path.unshiftContainer('body', recorderImportStatement);
      },
    },
    MemberExpression(path) {
      const isModuleExports = path.node.object.name === 'module'
        && path.node.property.name === 'exports';
      if (isModuleExports) {
        path.parent.right.properties.forEach((property) => {
          if (property.value.name === property.key.name) {
            console.log(property.value.name);
          }
        });
      }
    },
  },
});
