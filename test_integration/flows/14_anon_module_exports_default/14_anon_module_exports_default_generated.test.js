const defaultExport = require('./14_anon_module_exports_default');

describe('14_anon_module_exports_default', () => {
  describe('defaultExport', () => {
    it('test 0', () => {
      let a = 1;

      let result = 1;
      const actual = defaultExport(a);
      expect(actual).toEqual(result);
    });
  });
});
