const { captureArrayToLutFun } = require('./lutFunGen');
const { externalImportReducer } = require('./statement-genenerators');

const generateMocksFromActivity = (fileName, mocks) => {
  if (!mocks) {
    return {
      mockStatements: '',
      externalMocks: [],
    };
  }
  const externalMocks = [];
  const mockStatements = Object.keys(mocks)
    .map((moduleId) => {
      const externalsForThisModule = [];
      const mockedFunctions = Object.keys(mocks[moduleId])
        .map((usedFunction) => {
          const captures = mocks[moduleId][usedFunction];
          const lIdentifier = usedFunction;
          const testIndex = ''; // There is only one
          const meta = {
            path: fileName,
            name: moduleId,
          };
          const { code, externalData } = captureArrayToLutFun(
            captures, lIdentifier, meta, testIndex,
          );
          // Mark it as mock so that the import generator
          // Doesnt generate it again
          const markedAsMock = externalData.map(ed => ({ ...ed, isMock: true }));
          externalsForThisModule.push(...markedAsMock);
          return `${usedFunction}: ${code}`;
        }).join(',\n');
      externalMocks.push(...externalsForThisModule);
      const importStatements = externalImportReducer(externalsForThisModule);
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
  return { mockStatements, externalMocks };
};

module.exports = {
  generateMocksFromActivity,
};
