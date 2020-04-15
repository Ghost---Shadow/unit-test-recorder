const { fun } = require('./12_unwanted_injections');
const { fun2 } = require('./12_unwanted_injections');
const { fun3 } = require('./12_unwanted_injections');

describe('12_unwanted_injections', () => {
  describe('fun', () => {
    it('should work for case 1', () => {
      let arr = [1, 2];
      let result = [2, 4];

      const actual = fun(arr);
      expect(actual).toEqual(result);
    });
  });

  describe('fun2', () => {
    it('should work for case 1', () => {
      let num = 2;
      let result = '2';

      const actual = fun2(num);
      expect(actual).toEqual(result);
    });
  });

  describe('fun3', () => {
    it('should work for case 1', () => {
      let f = null;
      let result = 2;
      f = (...params) => {
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
            '2': 2
          }
        );
      };
      const actual = fun3(f);
      expect(actual).toEqual(result);
    });
  });
});
