const { circularReference } = require('./04_unserializeable');
const { returnAFunction } = require('./04_unserializeable');
const { getElapsedTime } = require('./04_unserializeable');
const { returnsNaN } = require('./04_unserializeable');

describe('04_unserializeable', () => {
  describe('circularReference', () => {
    it('test 0', () => {
      let a = 1;

      let result = {
        a: 1
      };
      const actual = circularReference(a);
      expect(actual).toMatchObject(result);
    });
  });

  describe('returnAFunction', () => {
    it('test 0', () => {
      let a = 1;
      let f2 = null;

      let result = 'b => a + f2(b)';
      const actual = returnAFunction(a, f2);
      expect(actual.toString()).toEqual(result);
    });
  });

  describe('getElapsedTime', () => {
    it('test 0', () => {
      let start = new Date('2018-01-31T18:30:00.000Z');
      let end = new Date('2019-01-31T18:30:00.000Z');

      let result = new Date('2001-01-30T18:30:00.000Z');
      const actual = getElapsedTime(start, end);
      expect(actual).toEqual(result);
    });
  });

  describe('returnsNaN', () => {
    it('test 0', () => {
      let a = 'a';

      let result = Number.NaN;
      const actual = returnsNaN(a);
      expect(actual).toEqual(result);
    });
  });
});
