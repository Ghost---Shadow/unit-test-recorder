const _ = require('lodash');

const { DefaultImportStatement } = require('../ImportStatements/ImportStatements');

const JestMockStatement = ({ importPath }) => `jest.mock('${importPath}');`;

const SpecialImportStatement = ({ importPath, packagedArguments }) => {
  const identifier = _.camelCase(importPath);
  const { isTypescript } = packagedArguments;
  if (!isTypescript) {
    return DefaultImportStatement({ importPath, identifier, packagedArguments });
  }
  const newIdentifier = `${identifier}Original`;
  const importStatement = DefaultImportStatement({
    importPath,
    identifier: newIdentifier,
    packagedArguments,
  });
  return importStatement;
};

const ReassignmentStatement = ({ importPath, packagedArguments }) => {
  const { isTypescript } = packagedArguments;
  if (!isTypescript) return '';

  const identifier = _.camelCase(importPath);
  const newIdentifier = `${identifier}Original`;

  return `const ${identifier} = ${newIdentifier} as any`;
};

const MockImportBlock = ({ meta, packagedArguments }) => {
  const mockStatements = meta.mocks
    .map(importPath => JestMockStatement({ importPath }));

  const importStatements = meta.mocks
    .map(importPath => SpecialImportStatement({
      importPath,
      packagedArguments,
    }));

  const reassignmentStatements = meta.mocks
    .map(importPath => ReassignmentStatement({
      importPath,
      packagedArguments,
    }));

  const importStatementStr = importStatements.join('\n');
  const reassignmentStatementStr = reassignmentStatements.join('\n');
  const mockStatementsStr = mockStatements.join('\n');

  return `${importStatementStr}\n\n${reassignmentStatementStr}\n\n${mockStatementsStr}`;
};

module.exports = {
  JestMockStatement,
  MockImportBlock,
};
