const { exportTest } = require('./09_typescript_exports');

describe('09_typescript_exports', () => {
  describe('exportTest', () => {
    it('test 0', () => {
      const a = 2;
      const result = 2;
      const actual = exportTest(a);
      expect(actual).toEqual(result);
    });
  });
});
