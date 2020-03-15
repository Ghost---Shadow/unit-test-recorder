const { captureArrayToLutFun } = require('./lutFunGen');

const generateMocksFromActivity = (mocks) => {
  if (!mocks) {
    return {
      mockStatements: '',
      externalData: [],
    };
  }
  const mockStatements = Object.keys(mocks)
    .map((moduleId) => {
      const mockedFunctions = Object.keys(mocks[moduleId])
        .map(usedFunction => `${usedFunction}: ${captureArrayToLutFun(mocks[moduleId][usedFunction])}`).join(',\n');
      return `jest.mock('${moduleId}', () => ({
      ${mockedFunctions}
    }));`;
    });
  const externalData = []; // TODO
  return { mockStatements, externalData };
};

module.exports = {
  generateMocksFromActivity,
};
