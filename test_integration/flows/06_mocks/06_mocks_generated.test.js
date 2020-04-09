const { getTodo } = require('./06_mocks');
const { localMocksTest } = require('./06_mocks');
const getTodo0result = require('./06_mocks/getTodo_0_result.mock.js');
jest.mock('fs', () => {
  // https://github.com/facebook/jest/issues/2567
  /* eslint-disable */

  const fsreadFileSync = require('./06_mocks/fs__readFileSync.mock.js');
  /* eslint-enable */

  return {
    readFileSync: (...params) => {
      const safeParams = params.length === 0 ? [undefined] : params;
      return safeParams.reduce((acc, param) => {
        if (typeof param === 'string') return acc[param];
        const stringifiedParam = JSON.stringify(param);
        if (stringifiedParam && stringifiedParam.length > 10000)
          return acc['KEY_TOO_LARGE'];
        return acc[stringifiedParam];
      }, fsreadFileSync);
    }
  };
});
jest.mock('./auxilary1', () => {
  // https://github.com/facebook/jest/issues/2567
  /* eslint-disable */

  const auxilary1foo4 = require('./06_mocks/auxilary1__foo4.mock.js');
  /* eslint-enable */

  return {
    foo4: (...params) => {
      const safeParams = params.length === 0 ? [undefined] : params;
      return safeParams.reduce((acc, param) => {
        if (typeof param === 'string') return acc[param];
        const stringifiedParam = JSON.stringify(param);
        if (stringifiedParam && stringifiedParam.length > 10000)
          return acc['KEY_TOO_LARGE'];
        return acc[stringifiedParam];
      }, auxilary1foo4);
    },
    foo1: (...params) => {
      const safeParams = params.length === 0 ? [undefined] : params;
      return safeParams.reduce(
        (acc, param) => {
          if (typeof param === 'string') return acc[param];
          const stringifiedParam = JSON.stringify(param);
          if (stringifiedParam && stringifiedParam.length > 10000)
            return acc['KEY_TOO_LARGE'];
          return acc[stringifiedParam];
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
          const stringifiedParam = JSON.stringify(param);
          if (stringifiedParam && stringifiedParam.length > 10000)
            return acc['KEY_TOO_LARGE'];
          return acc[stringifiedParam];
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
      let result = getTodo0result;
      const actual = getTodo();
      expect(actual).toEqual(result);
    });
  });

  describe('localMocksTest', () => {
    it('test 0', async () => {
      let result = 4;
      const actual = await localMocksTest();
      expect(actual).toEqual(result);
    });
  });
});
