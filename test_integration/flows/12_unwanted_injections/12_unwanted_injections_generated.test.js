const { fun } = require('./12_unwanted_injections');
const { fun2 } = require('./12_unwanted_injections');
const { fun3 } = require('./12_unwanted_injections');

describe('12_unwanted_injections', () => {
  describe('fun', () => {
    it('test 0', () => {
      const arr = [1, 2];
      const result = [2, 4];
      const actual = fun(arr);
      expect(actual).toEqual(result);
    });
  });

  describe('fun2', () => {
    it('test 0', () => {
      const num = 2;
      const result = '2';
      const actual = fun2(num);
      expect(actual).toEqual(result);
    });
  });

  describe('fun3', () => {
    it('test 0', () => {
      const f = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce(
          (acc, param) => {
            if (typeof param === 'string') return acc[param];
            const stringifiedParam = JSON.stringify(param);
            if (stringifiedParam && stringifiedParam.length > 100)
              return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam];
          },
          {
            '2': 2
          }
        );
      };

      const result = 2;
      const actual = fun3(f);
      expect(actual).toEqual(result);
    });
  });
});
