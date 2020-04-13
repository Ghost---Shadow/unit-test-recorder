const { getTodo } = require('./06_mocks');
const { localMocksTest } = require('./06_mocks');

const getTodo0result = require('./06_mocks/getTodo_0_result.mock.js');

describe('06_mocks', () => {
  describe('getTodo', () => {
    it('should work for case 1', () => {
      const result = getTodo0result;

      const actual = getTodo();
      expect(actual).toEqual(result);
    });
  });

  describe('localMocksTest', () => {
    it('should work for case 1', async () => {
      const result = 4;

      const actual = await localMocksTest();
      expect(actual).toEqual(result);
    });
  });
});
