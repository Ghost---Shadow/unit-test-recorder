const { obj1 } = require('./16_exported_objects');
const { obj2 } = require('./16_exported_objects');
const { largeObj } = require('./16_exported_objects');
const largeObjLargeFun0result = require('./16_exported_objects/largeObjLargeFun_0_result.mock.js');

describe('16_exported_objects', () => {
  describe('obj1.foo1', () => {
    it('test 0', async () => {
      let a = {};
      let b = 2;
      a.someFun = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce(
          (acc, param) => {
            if (typeof param === 'string') return acc[param];
            const stringifiedParam = JSON.stringify(param);
            if (stringifiedParam && stringifiedParam.length > 10000)
              return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam];
          },
          {
            undefined: 1
          }
        );
      };

      let result = 3;
      const actual = await obj1.foo1(a, b);
      expect(actual).toEqual(result);
    });
  });

  describe('obj1.foo2', () => {
    it('test 0', () => {
      let result = undefined;
      const actual = obj1.foo2();
      expect(actual).toEqual(result);
    });
  });

  describe('obj2.bar', () => {
    it('test 0', async () => {
      let a = 2;
      let b = 1;

      let result = 1;
      const actual = await obj2.bar(a, b);
      expect(actual).toEqual(result);
    });
  });

  describe('obj2.deep.fun', () => {
    it('test 0', async () => {
      let a = {};
      a.anotherFun = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce(
          (acc, param) => {
            if (typeof param === 'string') return acc[param];
            const stringifiedParam = JSON.stringify(param);
            if (stringifiedParam && stringifiedParam.length > 10000)
              return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam];
          },
          {
            undefined: 1
          }
        );
      };

      let result = 1;
      const actual = await obj2.deep.fun(a);
      expect(actual).toEqual(result);
    });
  });

  describe('obj2.higher', () => {
    it('test 0', () => {
      let a = 1;

      let result = 'b => a * b';
      const actual = obj2.higher(a);
      expect(actual.toString()).toEqual(result);
    });
  });

  describe('largeObj.largeFun', () => {
    it('test 0', () => {
      let result = largeObjLargeFun0result;
      const actual = largeObj.largeFun();
      expect(actual).toEqual(result);
    });
  });
});
