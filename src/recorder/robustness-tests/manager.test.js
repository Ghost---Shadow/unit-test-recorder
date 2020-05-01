jest.mock('../manager');
const cls = require('cls-hooked');
const RecorderManager = require('../manager');

const { mockRecorderWrapper } = require('../mock');
const { recorderWrapper } = require('../user-functions');
const {
  markForConstructorInjection,
  recordInjectedActivity,
  injectFunctionDynamically,
  injectDependencyInjections,
} = require('../injection');
const {
  recordFileMeta,
} = require('../file-meta');

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
        it('should not crash injectDependencyInjections', (done) => {
          const params = [{ a: () => 1 }];
          const session = cls.getNamespace('default');
          session.run(() => {
            session.set('stack', [meta]);
            injectDependencyInjections(params);
            done();
          });
        });
        it('should not crash injectFunctionDynamically', (done) => {
          const session = cls.getNamespace('default');
          session.run(() => {
            session.set('stack', [meta]);
            const maybeFunction = () => {};
            const paramIndex = 0;
            const fppkey = null;
            injectFunctionDynamically(maybeFunction, paramIndex, fppkey);
            done();
          });
        });
        it('should not crash recordInjectedActivity', () => {
          const paramIndex = 0;
          const fppkey = 'a.b.c';
          const params = [{ a: 1 }, 2];
          const result = { b: 1 };
          const captureIndex = 0;
          const data = {
            paramIndex, fppkey, params, result,
          };
          recordInjectedActivity(captureIndex, meta, data);
        });
        it('should not crash markForConstructorInjection', () => {
          markForConstructorInjection(meta);
        });
      });
      describe('file-meta.js', () => {
        it('should not crash recorderWrapper', () => {
          recordFileMeta({
            path: 'dir/file.js',
          });
        });
      });
    });
  });
});
