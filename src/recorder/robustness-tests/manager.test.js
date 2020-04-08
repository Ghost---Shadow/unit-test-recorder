jest.mock('../manager');
const RecorderManager = require('../manager');

const { mockRecorderWrapper } = require('../mock');
const { recorderWrapper } = require('../user-functions');
const {
  markForConstructorInjection,
  recordInjectedActivity,
  injectFunctionDynamically,
  injectDependencyInjections,
} = require('../injection');

const errorThrower = () => { throw new Error('sample'); };

describe('Robustness tests', () => {
  beforeAll(() => {
    // Suppress console error
    console.error = () => null;
  });
  describe('manager', () => {
    describe('record', () => {
      beforeAll(() => {
        RecorderManager.record.mockImplementation(errorThrower);
      });
      describe('mock.js', () => {
        it('should not crash mockRecorderWrapper', () => {
          const fun = (...p) => mockRecorderWrapper(
            {
              path: 'sample/script.js',
              moduleName: 'moduleName',
              name: 'name',
            },
            (a, b) => a + b,
            ...p,
          );
          expect(fun(1, 2)).toBe(3);
        });
      });
      describe('user-functions.js', () => {
        it('should not crash recorderWrapper', () => {
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
          expect(fun(1, 2)).toBe(3);
        });
      });
      describe('injection.js', () => {
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
        it('should not crash injectDependencyInjections', () => {
          const params = [{ a: () => 1 }];
          injectDependencyInjections(params, meta);
        });
        it('should not crash injectFunctionDynamically', () => {
          const maybeFunction = () => {};
          const boundRecorder = () => {};
          injectFunctionDynamically(maybeFunction, meta, boundRecorder);
        });
        it('should not crash recordInjectedActivity', () => {
          const paramIndex = 0;
          const fppkey = 'a.b.c';
          const params = [{ a: 1 }, 2];
          const result = { b: 1 };
          recordInjectedActivity(meta, paramIndex, fppkey, params, result);
        });
        it('should not crash markForConstructorInjection', () => {
          markForConstructorInjection(meta);
        });
      });
    });
  });
});
