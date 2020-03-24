const { circularReference } = require('./04_unserializeable');
const { returnAFunction } = require('./04_unserializeable');
const { getElapsedTime } = require('./04_unserializeable');

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
      const f2 = null;
      const result = 'b => a + f2(b)';
      const actual = returnAFunction(a, f2);
      expect(actual.toString()).toEqual(result);
    });
  });

  describe('getElapsedTime', () => {
    it('test 0', () => {
      const start = new Date('2018-01-31T18:30:00.000Z');
      const end = new Date('2019-01-31T18:30:00.000Z');
      const result = new Date('2001-01-30T18:30:00.000Z');
      const actual = getElapsedTime(start, end);
      expect(actual).toEqual(result);
    });
  });
});
