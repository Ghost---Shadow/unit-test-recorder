const { circularReference } = require('./04_unserializeable');
const { returnAFunction } = require('./04_unserializeable');
describe('04_unserializeable', () => {
  describe('circularReference', () => {
    it('test 0', () => {
      const a = 1;
      const result = {
        a: 1
      };
      const actual = circularReference(a);
      expect(actual).toMatchObject(result);
    });
  });

  describe('returnAFunction', () => {
    it('test 0', () => {
      const a = 1;
      const f2 = 'a => a * 2';
      const result = 'b => a + f2(b)';
      const actual = returnAFunction(a, f2);
      expect(actual.toString()).toEqual(result);
    });
  });
});
