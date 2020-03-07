const { circularReference } = require('./04_unserializeable');
describe('04_unserializeable', () => {
  describe('circularReference', () => {
    it('test 0', () => {
      const a = 1;
      const result = {
        a: 1
      };
      expect(circularReference(a)).toMatchObject(result);
    });
  });
});
