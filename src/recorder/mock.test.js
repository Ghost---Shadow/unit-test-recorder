jest.mock('./injection');
jest.mock('./utils/hash-helper');
jest.mock('./utils/dynamic-type-inference');

const hashHelper = require('./utils/hash-helper');
const dti = require('./utils/dynamic-type-inference');
const { mockRecorderWrapper } = require('./mock');

describe('mock', () => {
  describe('mockRecorderWrapper', () => {
    describe('Robustness tests', () => {
      const fun = (...p) => mockRecorderWrapper(
        {
          path: 'sample/script.js',
          moduleName: 'moduleName',
          name: 'name',
        },
        (a, b) => a + b,
        ...p,
      );
      beforeAll(() => {
        console.error = () => null;
      });
      afterEach(() => {
        hashHelper
          .checkAndSetHash.mockRestore();
        dti
          .generateTypesObj.mockRestore();
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
