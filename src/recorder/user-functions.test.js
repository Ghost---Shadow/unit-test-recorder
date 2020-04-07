jest.mock('./injection');
jest.mock('./utils/hash-helper');
jest.mock('./utils/dynamic-type-inference');

const injectionObj = require('./injection');
const hashHelper = require('./utils/hash-helper');
const dti = require('./utils/dynamic-type-inference');
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
      afterEach(() => {
        injectionObj
          .injectDependencyInjections.mockRestore();
        hashHelper
          .checkAndSetHash.mockRestore();
        dti
          .generateTypesObj.mockRestore();
      });
      it('should work if injectDependencyInjections fails', () => {
        injectionObj
          .injectDependencyInjections
          .mockImplementation(() => { throw new Error('sample'); });
        expect(fun(1, 2)).toBe(3);
      });
      it('should work if checkAndSetHash fails', () => {
        hashHelper
          .checkAndSetHash
          .mockImplementation(() => { throw new Error('sample'); });
        expect(fun(1, 2)).toBe(3);
      });
      it('should work if generateTypesObj fails', () => {
        dti
          .generateTypesObj
          .mockImplementation(() => { throw new Error('sample'); });
        expect(fun(1, 2)).toBe(3);
      });
    });
  });
});
