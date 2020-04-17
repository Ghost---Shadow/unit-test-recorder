const _ = require('lodash');
const t = require('@babel/types');
const { default: template } = require('@babel/template');
const { isWhitelisted } = require('../util/misc');

const fileMetaTemplate = template(`
recordFileMeta(META);
`);

const fileMetaGenerator = (meta) => {
  const {
    path, mocks,
  } = meta;
  return t.objectExpression([
    t.objectProperty(t.identifier('path'), t.stringLiteral(path)),
    t.objectProperty(t.identifier('mocks'), t.arrayExpression(mocks.map(mock => t.stringLiteral(mock)))),
  ]);
};

const getImportsToMock = (importedModules, whiteListedModules) => _.uniq(
  Object
    .keys(importedModules)
    .map(importedAs => importedModules[importedAs].moduleName)
    .filter(moduleName => isWhitelisted(moduleName, whiteListedModules)),
);

function addRecordFileMeta(path) {
  const mocks = getImportsToMock(this.importedModules, this.whiteListedModules);
  const metaAst = fileMetaGenerator({
    mocks,
    path: this.fileName,
  });
  const ast = fileMetaTemplate({ META: metaAst });

  path.pushContainer('body', ast);
}

module.exports = { addRecordFileMeta };
