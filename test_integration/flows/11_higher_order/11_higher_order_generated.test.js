const { base } = require('./11_higher_order');
const { validFun } = require('./11_higher_order');

describe('11_higher_order', () => {
  describe('base', () => {
    it('should work for case 1', () => {
      let param1 = {};
      let result = 'param2 => param1.someFun() + param2.someOtherFun()';

      const actual = base(param1);
      expect(actual.toString()).toEqual(result);
    });
  });

  describe('validFun', () => {
    it('should work for case 1', () => {
      let param = {};
      let result = 5;

      param.someFun = (...params) => {
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
            undefined: 5
          }
        );
      };
      const actual = validFun(param);
      expect(actual).toEqual(result);
    });
  });
});
