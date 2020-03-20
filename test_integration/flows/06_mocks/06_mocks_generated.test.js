const { getTodo } = require('./06_mocks');
const { localMocksTest } = require('./06_mocks');
const getTodo0result = require('./06_mocks/getTodo_0_result.js');
jest.mock('fs', () => {
  // https://github.com/facebook/jest/issues/2567
  /* eslint-disable */

  const fsreadFileSync = require('./06_mocks/fs__readFileSync.js');
  /* eslint-enable */

  return {
    readFileSync: (...params) => {
      const safeParams = params.length === 0 ? [undefined] : params;
      return safeParams.reduce((acc, param) => {
        if (typeof param === 'string') return acc[param];
        return acc[JSON.stringify(param)];
      }, fsreadFileSync);
    }
  };
});
jest.mock('./auxilary1', () => {
  return {
    foo1: (...params) => {
      const safeParams = params.length === 0 ? [undefined] : params;
      return safeParams.reduce(
        (acc, param) => {
          if (typeof param === 'string') return acc[param];
          return acc[JSON.stringify(param)];
        },
        {
          undefined: 1
        }
      );
    },
    foo2: (...params) => {
      const safeParams = params.length === 0 ? [undefined] : params;
      return safeParams.reduce(
        (acc, param) => {
          if (typeof param === 'string') return acc[param];
          return acc[JSON.stringify(param)];
        },
        {
          undefined: 2
        }
      );
    }
  };
});
describe('06_mocks', () => {
  describe('getTodo', () => {
    it('test 0', () => {
      const result = getTodo0result;
      const actual = getTodo();
      expect(actual).toMatchObject(result);
    });
  });

  describe('localMocksTest', () => {
    it('test 0', () => {
      const result = 4;
      const actual = localMocksTest();
      expect(actual).toEqual(result);
    });
  });
});
