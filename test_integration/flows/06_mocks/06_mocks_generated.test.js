const { getTodo } = require('./06_mocks');
const { localMocksTest } = require('./06_mocks');

const getTodo0result = require('./06_mocks/getTodo_0_result.mock.js');

jest.mock('./auxilary1');
jest.mock('fs');

describe('06_mocks', () => {
  describe('getTodo', () => {
    it('should work for case 1', () => {
      let result = getTodo0result;

      const actual = getTodo();
      expect(actual).toEqual(result);
    });
  });

  describe('localMocksTest', () => {
    it('should work for case 1', async () => {
      let result = 4;

      const actual = await localMocksTest();
      expect(actual).toEqual(result);
    });
  });
});
