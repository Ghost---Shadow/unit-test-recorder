const dum = require('./02_module_export');
describe('02_module_export', () => {
  describe('dum', () => {
    it('test 0', () => {
      const a = 1;
      const result = 2;
      expect(dum(a)).toEqual(result);
    });
  });
});
