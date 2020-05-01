const { base } = require('./11_higher_order');
const { rObj } = require('./11_higher_order');
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

  describe('rObj.foo', () => {
    it('should work for case 1', () => {
      let f = 'p => p.someFun()';
      let result = 'p => f(p)';

      const actual = rObj.foo(f);
      expect(actual.toString()).toEqual(result);
    });

    it('should work for case 2', () => {
      let f = 'function f(p) {\n  return p.someFun();\n}';
      let result = 'p => f(p)';

      const actual = rObj.foo(f);
      expect(actual.toString()).toEqual(result);
    });
  });

  describe('validFun', () => {
    it('should work for case 1', () => {
      let param = {};
      let result = 3;

      param.someFun = jest.fn();
      param.someFun.mockReturnValueOnce(3);
      const actual = validFun(param);
      expect(actual).toEqual(result);
    });
  });
});
