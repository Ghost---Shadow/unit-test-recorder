const { base } = require('./11_higher_order');
const { validFun } = require('./11_higher_order');

describe('11_higher_order', () => {
  describe('base', () => {
    it('test 0', () => {
      const param1 = {};
      const result = 'param2 => param1.someFun() + param2.someOtherFun()';
      const actual = base(param1);
      expect(actual.toString()).toEqual(result);
    });
  });

  describe('validFun', () => {
    it('test 0', () => {
      const param = {
        someFun: (...params) => {
          const safeParams = params.length === 0 ? [undefined] : params;
          return safeParams.reduce(
            (acc, param) => {
              if (typeof param === 'string') return acc[param];
              return acc[JSON.stringify(param)];
            },
            {
              undefined: 5
            }
          );
        }
      };
      const result = 5;
      const actual = validFun(param);
      expect(actual).toEqual(result);
    });
  });
});
