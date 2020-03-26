const {
  inferTypeOfObject,
  generateTypesObj,
} = require('./dynamic-type-inference');

describe('dynamic-type-inference', () => {
  describe('inferTypeOfObject', () => {
    it('should infer type for date', () => {
      const actual = inferTypeOfObject(new Date());
      expect(actual).toEqual('Date');
    });
  });
  describe('generateTypesObj', () => {
    it('should infer type for date', () => {
      const capture = {
        params: [
          () => {},
          1,
          null,
        ],
        result: { a: 1 },
      };
      const expected = {
        params: ['Function', 'Number', 'Null'],
        result: 'Object',
      };
      const actual = generateTypesObj(capture);
      expect(actual).toEqual(expected);
    });
  });
});
