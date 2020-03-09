const { ecma1 } = require('./03_ecma_export');
const { default: ecma2 } = require('./03_ecma_export');
const { ecma3 } = require('./03_ecma_export');
const { ecma4 } = require('./03_ecma_export');
describe('03_ecma_export', () => {
  describe('ecma1', () => {
    it('test 0', () => {
      const a = 1;
      const b = 2;
      const result = 3;
      const actual = ecma1(a, b);
      expect(actual).toEqual(result);
    });
  });

  describe('ecma2', () => {
    it('test 0', () => {
      const b = 1;
      const result = 3;
      const actual = ecma2(b);
      expect(actual).toEqual(result);
    });
  });

  describe('ecma3', () => {
    it('test 0', () => {
      const a = 1;
      const result = 0.5;
      const actual = ecma3(a);
      expect(actual).toEqual(result);
    });
  });

  describe('ecma4', () => {
    it('test 0', () => {
      const a = 1;
      const result = 0.25;
      const actual = ecma4(a);
      expect(actual).toEqual(result);
    });
  });
});
