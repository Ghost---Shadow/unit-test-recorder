const _ = require('lodash');

const { DefaultImportStatement } = require('../ImportStatements/ImportStatements');

const JestMockStatement = ({ importPath }) => `jest.mock('${importPath}');`;

const MockImportBlock = ({ meta, packagedArguments }) => {
  const mockStatements = meta.mocks
    .map(importPath => JestMockStatement({ importPath }));

  const importStatements = meta.mocks
    .map(importPath => DefaultImportStatement({
      importPath,
      identifier: _.camelCase(importPath),
      packagedArguments,
    }));

  const importStatementStr = importStatements.join('\n');
  const mockStatementsStr = mockStatements.join('\n');

  return `${importStatementStr}\n\n${mockStatementsStr}`;
};

module.exports = {
  JestMockStatement,
  MockImportBlock,
};
