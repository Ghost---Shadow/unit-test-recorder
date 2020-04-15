const foo = require('./15_named_module_exports_default');

describe('15_named_module_exports_default', () => {
  describe('foo', () => {
    it('should work for case 1', () => {
      let a = 1;
      let result = 1;

      const actual = foo(a);
      expect(actual).toEqual(result);
    });
  });
});
