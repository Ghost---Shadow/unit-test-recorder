const _ = require('lodash');

const { DefaultImportStatement } = require('../ImportStatements/ImportStatements');

const JestMockStatement = ({ importPath }) => `jest.mock('${importPath}');`;

const SpecialImportStatement = ({ importPath, originalImportPath, packagedArguments }) => {
  const identifier = _.camelCase(originalImportPath);
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

const ReassignmentStatement = ({ originalImportPath, packagedArguments }) => {
  const { isTypescript } = packagedArguments;
  if (!isTypescript) return '';

  const identifier = _.camelCase(originalImportPath);
  const newIdentifier = `${identifier}Original`;

  return `const ${identifier} = ${newIdentifier} as any`;
};

const MockImportBlock = ({ meta, packagedArguments }) => {
  const mockStatements = meta.mocks
    .map(importPath => JestMockStatement({ importPath }));

  const importStatements = _.zip(meta.mocks, meta.originalMocks)
    .map(([importPath, originalImportPath]) => SpecialImportStatement({
      importPath,
      originalImportPath,
      packagedArguments,
    }));

  const reassignmentStatements = meta.originalMocks
    .map(originalImportPath => ReassignmentStatement({
      originalImportPath,
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
