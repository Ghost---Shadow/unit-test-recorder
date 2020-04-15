const { default: defaultExport } = require('./13_anon_ts_export_default');

describe('13_anon_ts_export_default', () => {
  describe('defaultExport', () => {
    it('should work for case 1', () => {
      let a = 1;
      let b = 2;
      let result = 3;

      const actual = defaultExport(a, b);
      expect(actual).toEqual(result);
    });
  });
});
