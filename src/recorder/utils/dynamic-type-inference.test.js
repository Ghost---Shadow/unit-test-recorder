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
    it('should read past Symbol.toStringTag', () => {
      // https://stackoverflow.com/a/59666904/1217998
      const obj = {
        get [Symbol.toStringTag]() {
          return 'Person';
        },
      };
      const actual = inferTypeOfObject(obj);
      expect(actual).toEqual('Object');
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
