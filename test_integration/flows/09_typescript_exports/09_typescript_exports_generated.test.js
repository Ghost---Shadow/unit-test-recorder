const { exportTest1 } = require('./09_typescript_exports');
const { default: exportTest2 } = require('./09_typescript_exports');

describe('09_typescript_exports', () => {
  describe('exportTest1', () => {
    it('test 0', () => {
      const a = 2;
      const result = 2;
      const actual = exportTest1(a);
      expect(actual).toEqual(result);
    });
  });

  describe('exportTest2', () => {
    it('test 0', () => {
      const a = 3;
      const result = 'b => [a, b]';
      const actual = exportTest2(a);
      expect(actual.toString()).toEqual(result);
    });
  });
});
