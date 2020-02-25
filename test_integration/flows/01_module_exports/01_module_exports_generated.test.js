const { foo, bar } = require('./01_module_exports');
describe('01_module_exports', () => {
  describe('foo', () => {
    it('test 0', () => {
      const a = 1;
      const b = 2;
      const result = 3;
      expect(foo(a, b)).toEqual(result);
    });

    it('test 1', () => {
      const a = 2;
      const b = 1;
      const result = 3;
      expect(foo(a, b)).toEqual(result);
    });
  });

  describe('bar', () => {
    it('test 0', () => {
      const a = 2;
      const b = 2;
      const result = 0;
      expect(bar(a, b)).toEqual(result);
    });
  });
});
