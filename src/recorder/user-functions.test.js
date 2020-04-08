jest.mock('./injection');

const injectionObj = require('./injection');
const { recorderWrapper } = require('./user-functions');

describe('user-functions', () => {
  describe('recorderWrapper', () => {
    describe('Robustness tests', () => {
      const fun = (...p) => recorderWrapper(
        {
          path: 'sample/script.js',
          name: 'sampleFunction',
          paramIds: [],
          injectionWhitelist: [],
          isDefault: false,
          isEcmaDefault: false,
          isAsync: false,
          isObject: false,
        },
        (a, b) => a + b,
        ...p,
      );
      beforeAll(() => {
        console.error = () => null;
      });
      it('should work if injectDependencyInjections fails', () => {
        injectionObj
          .injectDependencyInjections
          .mockImplementation(() => { throw new Error('sample'); });
        expect(fun(1, 2)).toBe(3);
      });
    });
  });
});
