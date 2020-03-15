const { captureArrayToLutFun } = require('./lutFunGen');

const generateMocksFromActivity = (mocks) => {
  if (!mocks) return '';
  return Object.keys(mocks)
    .map((moduleId) => {
      const mockedFunctions = Object.keys(mocks[moduleId])
        .map(usedFunction => `${usedFunction}: ${captureArrayToLutFun(mocks[moduleId][usedFunction])}`).join(',\n');
      return `jest.mock('${moduleId}', () => ({
      ${mockedFunctions}
    }));`;
    });
};

module.exports = {
  generateMocksFromActivity,
};
