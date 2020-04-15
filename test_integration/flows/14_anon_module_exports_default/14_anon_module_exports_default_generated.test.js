const defaultExport = require('./14_anon_module_exports_default');

describe('14_anon_module_exports_default', () => {
  describe('defaultExport', () => {
    it('should work for case 1', () => {
      let a = 1;
      let result = 1;

      const actual = defaultExport(a);
      expect(actual).toEqual(result);
    });
  });
});
