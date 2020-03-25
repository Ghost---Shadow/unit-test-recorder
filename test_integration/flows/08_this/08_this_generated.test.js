const { newTarget } = require('./08_this');
const { sample } = require('./08_this');
const { protoOverwrite } = require('./08_this');
const { protoOverwriteHelper } = require('./08_this');

describe('08_this', () => {
  /* This function requires injection of Constructor (WIP)
  describe('newTarget',()=>{
    
  it('test 0', async ()=>{
    const obj = {}
    const result = 42
    const actual = await newTarget(obj);expect(actual).toEqual(result)
  })
  
  })
  */

  describe('sample', () => {
    it('test 0', () => {
      const result = undefined;
      const actual = sample();
      expect(actual).toEqual(result);
    });
  });

  describe('protoOverwrite', () => {
    it('test 0', () => {
      const result = 2;
      const actual = protoOverwrite();
      expect(actual).toEqual(result);
    });
  });

  describe('protoOverwriteHelper', () => {
    it('test 0', () => {
      const foo = {
        bar: 2,
        __proto__: {},
        fun1: (...params) => {
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
              undefined: 2
            }
          );
        },
        fun2: (...params) => {
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
              undefined: 2
            }
          );
        }
      };
      const result = 2;
      const actual = protoOverwriteHelper(foo);
      expect(actual).toEqual(result);
    });
  });
});
