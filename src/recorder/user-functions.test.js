const { getNamespace } = require('cls-hooked');

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
      afterAll(() => {
        injectionObj
          .injectDependencyInjections
          .mockReset();
      });
    });
    describe('Continuation local storage', () => {
      it('should put meta in cls', () => {
        const session = getNamespace('default');
        const meta = {
          path: 'sample/script.js',
          name: 'sampleFunction',
          paramIds: [],
          injectionWhitelist: [],
          isDefault: false,
          isEcmaDefault: false,
          isAsync: false,
          isObject: false,
        };
        const metaWithCaptureIndex = { ...meta, captureIndex: 0 };
        const fun = (...p) => recorderWrapper(
          meta,
          () => session.get('meta'),
          ...p,
        );
        expect(fun()).toEqual(metaWithCaptureIndex);
      });
    });
  });
});
