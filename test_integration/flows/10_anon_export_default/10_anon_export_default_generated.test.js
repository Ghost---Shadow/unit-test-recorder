const { default: defaultExport } = require('./10_anon_export_default');

describe('10_anon_export_default', () => {
  describe('defaultExport', () => {
    it('test 0', () => {
      const a = 1;
      const b = 2;
      const result = 3;
      const actual = defaultExport(a, b);
      expect(actual).toEqual(result);
    });
  });
});
