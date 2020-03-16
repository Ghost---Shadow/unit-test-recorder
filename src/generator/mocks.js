const { captureArrayToLutFun } = require('./lutFunGen');

const generateMocksFromActivity = (mocks) => {
  if (!mocks) {
    return {
      mockStatements: '',
      externalMocks: [],
    };
  }
  const externalMocks = [];
  const mockStatements = Object.keys(mocks)
    .map((moduleId) => {
      const mockedFunctions = Object.keys(mocks[moduleId])
        .map((usedFunction) => {
          // TODO: externalData
          const { code } = captureArrayToLutFun(mocks[moduleId][usedFunction]);
          return `${usedFunction}: ${code}`;
        }).join(',\n');
      return `jest.mock('${moduleId}', () => ({
      ${mockedFunctions}
    }));`;
    });
  return { mockStatements, externalMocks };
};

module.exports = {
  generateMocksFromActivity,
};
