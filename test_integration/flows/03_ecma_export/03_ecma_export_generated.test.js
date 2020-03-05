const { ecma1 } = require('./03_ecma_export');
const { default: ecma2 } = require('./03_ecma_export');
describe('03_ecma_export', () => {
  describe('ecma1', () => {
    it('test 0', () => {
      const a = 1;
      const b = 2;
      const result = 3;
      expect(ecma1(a, b)).toEqual(result);
    });
  });

  describe('ecma2', () => {
    it('test 0', () => {
      const b = 1;
      const result = 3;
      expect(ecma2(b)).toEqual(result);
    });
  });
});
