const { largeObj } = require('./16_exported_objects');
const { obj1 } = require('./16_exported_objects');
const { obj2 } = require('./16_exported_objects');

const largeObjLargeFun0result = require('./16_exported_objects/largeObjLargeFun_0_result.mock.js');

describe('16_exported_objects', () => {
  describe('largeObj.largeFun', () => {
    it('should work for case 1', () => {
      let result = largeObjLargeFun0result;

      const actual = largeObj.largeFun();
      expect(actual).toEqual(result);
    });
  });

  describe('obj1.foo1', () => {
    it('should work for case 1', async () => {
      let a = {};
      let b = 2;
      let result = 3;

      a.someFun = jest.fn();
      a.someFun.mockReturnValueOnce(1);
      const actual = await obj1.foo1(a, b);
      expect(actual).toEqual(result);
    });
  });

  describe('obj1.foo2', () => {
    it('should work for case 1', () => {
      let result = undefined;

      const actual = obj1.foo2();
      expect(actual).toEqual(result);
    });
  });

  describe('obj2.bar', () => {
    it('should work for case 1', async () => {
      let a = 2;
      let b = 1;
      let result = 1;

      const actual = await obj2.bar(a, b);
      expect(actual).toEqual(result);
    });
  });

  describe('obj2.deep.fun', () => {
    it('should work for case 1', async () => {
      let a = {};
      let result = 1;

      a.anotherFun = jest.fn();
      a.anotherFun.mockReturnValueOnce(1);
      const actual = await obj2.deep.fun(a);
      expect(actual).toEqual(result);
    });
  });

  describe('obj2.higher', () => {
    it('should work for case 1', () => {
      let a = 1;
      let result = 'b => a * b';

      const actual = obj2.higher(a);
      expect(actual.toString()).toEqual(result);
    });
  });
});
