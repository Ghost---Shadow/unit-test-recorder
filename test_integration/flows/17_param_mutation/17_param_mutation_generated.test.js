const { fun } = require('./17_param_mutation');

describe('17_param_mutation', () => {
  describe('fun', () => {
    it('should work for case 1', () => {
      let a = [1];
      let result = [2];

      const actual = fun(a);
      expect(actual).toEqual(result);
    });
  });
});
