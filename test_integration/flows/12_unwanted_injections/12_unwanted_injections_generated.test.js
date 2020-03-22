const { fun } = require('./12_unwanted_injections');
const { fun2 } = require('./12_unwanted_injections');

describe('12_unwanted_injections', () => {
  describe('fun', () => {
    it('test 0', () => {
      const arr = [1, 2];
      const result = [2, 4];
      const actual = fun(arr);
      expect(actual).toMatchObject(result);
    });
  });

  describe('fun2', () => {
    it('test 0', () => {
      const num = 2;
      const result = '2';
      const actual = fun2(num);
      expect(actual.toString()).toEqual(result);
    });
  });
});
