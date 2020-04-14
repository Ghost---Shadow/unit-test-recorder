const _ = require('lodash');

const { captureArrayToLutFun } = require('../../lutFunGen');
const { DefaultImportStatement } = require('../ImportStatements/ImportStatements');
// const {
//   AggregatorManager,
// } = require('../../external-data-aggregator');

const MockStatements = ({
  fileName, mocks, relativePath, packagedArguments,
}) => {
  if (!mocks) return '';

  const externalMocks = [];
  const mockStatementArr = Object.keys(mocks)
    .map((moduleId) => {
      const externalsForThisModule = [];
      const mockedFunctions = Object.keys(mocks[moduleId])
        .map((usedFunction) => {
          const { captures } = mocks[moduleId][usedFunction];
          const lIdentifier = usedFunction;
          const testIndex = ''; // There is only one
          const meta = {
            path: fileName,
            name: _.camelCase(moduleId), // TODO: Add tests for large payload mocks
            relativePath,
          };
          const { code, externalData } = captureArrayToLutFun(
            captures, lIdentifier, meta, testIndex, packagedArguments,
          );
          // Mark it as mock so that the import generator
          // Doesnt generate it again
          const markedAsMock = externalData.map(ed => ({ ...ed, isMock: true }));
          externalsForThisModule.push(...markedAsMock);
          return `${usedFunction}: ${code}`;
        }).join(',\n');
      externalMocks.push(...externalsForThisModule);
      const importStatements = externalsForThisModule.map(DefaultImportStatement).join('\n');
      const wrappedImportStatements = importStatements.length ? `
      // https://github.com/facebook/jest/issues/2567
      /* eslint-disable */
      ${importStatements}
      /* eslint-enable */
      ` : '';

      const mockStatement = `jest.mock('${moduleId}', () => {
        ${wrappedImportStatements}
        return { ${mockedFunctions}}
      });`;
      return mockStatement;
    });
  return mockStatementArr.join('\n');
};

module.exports = {
  MockStatements,
};
