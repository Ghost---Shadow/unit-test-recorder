const _ = require('lodash');

const { DefaultImportStatement } = require('../ImportStatements/ImportStatements');

const JestMockStatement = ({ importPath }) => `jest.mock('${importPath}');`;

const MockImportBlock = ({ meta, exportedFunctions }) => {
  const importPaths = Object.keys(exportedFunctions).reduce((acc, fnName) => {
    const { captures } = exportedFunctions[fnName];
    return acc.concat(captures.reduce((innerAcc, capture) => {
      if (!capture.mocks) return [];
      return innerAcc.concat(Object.keys(capture.mocks));
    }, []));
  }, []);

  const uniqImportPaths = (_.uniq(importPaths)).sort();

  const mockStatements = meta.mocks
    .map(importPath => JestMockStatement({ importPath }));

  const importStatements = uniqImportPaths
    .map(importPath => DefaultImportStatement({ importPath, identifier: _.camelCase(importPath) }));

  const importStatementStr = importStatements.join('\n');
  const mockStatementsStr = mockStatements.join('\n');

  return `${importStatementStr}\n\n${mockStatementsStr}`;
};

module.exports = {
  JestMockStatement,
  MockImportBlock,
};
