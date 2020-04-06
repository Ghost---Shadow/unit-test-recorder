const { injectDependencyInjections } = require('./injection');

describe('recorder.injection', () => {
  describe('injectDependencyInjections', () => {
    it('should not crash if some getter is invalid', () => {
      console.error = () => null;
      /*
      const functionName = obj => obj.someFun() + obj.obj.anotherFun()
      */
      const params = [
        {
          get crasher() { throw new Error('Some error'); },
          someFun: () => 1,
          obj: { anotherFun: () => 2 },
        },
      ];
      const meta = {
        path: 'sample/test.js',
        name: 'functionName',
        paramIds: ['obj'],
        injectionWhitelist: ['someFun', 'anotherFun'],
      };
      injectDependencyInjections(params, meta);
      expect(params[0].sampleTestJsSomeFun()).toEqual(1);
      expect(params[0].obj.sampleTestJsAnotherFun()).toEqual(2);
    });
    it('should discard extras', () => {
      /*
      const functionName = obj => obj.someFun()
      */
      const params = [
        {
          someFun: () => 1,
        },
      ];
      const meta = {
        path: 'sample/test.js',
        name: 'functionName',
        paramIds: ['obj'],
        injectionWhitelist: ['someFun', 'extra'],
      };
      injectDependencyInjections(params, meta);
      expect(params[0].sampleTestJsSomeFun()).toEqual(1);
      expect(Object.keys(params[0]).indexOf('sampleTestJsExtra')).toBe(-1);
    });
    it('should work for non enumerable properties', () => {
      // console.error = () => null;
      /*
      const functionName = obj => obj.someFun()
      */
      const obj = {};
      Object.defineProperty(obj, 'someFun', {
        enumerable: false,
        value: () => 1,
      });
      const params = [obj];
      const meta = {
        path: 'sample/test.js',
        name: 'functionName',
        paramIds: ['obj'],
        injectionWhitelist: ['someFun'],
      };
      injectDependencyInjections(params, meta);
      expect(params[0].sampleTestJsSomeFun()).toEqual(1);
    });
  });
});
