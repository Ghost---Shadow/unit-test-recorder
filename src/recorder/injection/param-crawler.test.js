const { createNamespace } = require('cls-hooked');

jest.mock('../utils/misc', () => ({
  shouldRecordStubParams: jest.fn().mockReturnValue(true),
}));

const { injectDependencyInjections } = require('./param-crawler');

describe('param-crawler', () => {
  describe('injectDependencyInjections', () => {
    describe('function like params', () => {
      beforeEach(() => {
      });
      it('should inject recorder to params', () => {
        const session = createNamespace('default');
        session.run(() => {
          const fn = jest.fn().mockImplementation((a, b) => a + b);
          const paramIndex = 0;
          const fppkey = null;
          const params = [fn];
          const meta = {
            injectionWhitelist: [],
            path: 'file1.js',
            name: 'fun1',
            paramIds: ['a', 'b'],
          };
          session.set('stack', [meta]);
          injectDependencyInjections(params);
          params[paramIndex](1, 2);
          params[paramIndex](1, 2);
          const injections = session.get('injections');
          expect(injections).toEqual([
            [paramIndex, fppkey, [1, 2], 3],
            [paramIndex, fppkey, [1, 2], 3],
          ]);
        });
      });
      it('should handle duplicate injections', () => {
        const session = createNamespace('default');
        session.run(() => {
          const fn = jest.fn().mockImplementation((a, b) => a + b);
          const paramIndex = 0;
          const fppkey = null;
          const params = [fn];
          const meta = {
            injectionWhitelist: [],
            path: 'file1.js',
            name: 'fun1',
            paramIds: ['a', 'b'],
          };
          session.set('stack', [meta]);
          injectDependencyInjections(params);
          injectDependencyInjections(params);
          params[paramIndex](1, 2);
          params[paramIndex](1, 2);
          const injections = session.get('injections');
          expect(injections).toEqual([
            [paramIndex, fppkey, [1, 2], 3],
            [paramIndex, fppkey, [1, 2], 3],
          ]);
        });
      });
    });
    describe('object like params', () => {
      beforeEach(() => {
      });
      it('should inject recorder to params', () => {
        const session = createNamespace('default');
        session.run(() => {
          const fn = jest.fn().mockImplementation((a, b) => a + b);
          const obj = { fn };
          const paramIndex = 0;
          const fppkey = 'fn';
          const params = [obj];
          const meta = {
            injectionWhitelist: ['fn'],
            path: 'file1.js',
            name: 'fun1',
            paramIds: ['a', 'b'],
          };
          session.set('stack', [meta]);
          injectDependencyInjections(params);
          params[paramIndex].file1JsFn(1, 2);
          params[paramIndex].file1JsFn(1, 2);
          const injections = session.get('injections');
          expect(injections).toEqual([
            [paramIndex, fppkey, [1, 2], 3],
            [paramIndex, fppkey, [1, 2], 3],
          ]);
        });
      });
      it('should handle duplicate injections', () => {
        const session = createNamespace('default');
        session.run(() => {
          const fn = jest.fn().mockImplementation((a, b) => a + b);
          const obj = { fn };
          const paramIndex = 0;
          const fppkey = 'fn';
          const params = [obj];
          const meta = {
            injectionWhitelist: ['fn'],
            path: 'file1.js',
            name: 'fun1',
            paramIds: ['a', 'b'],
          };
          session.set('stack', [meta]);
          injectDependencyInjections(params);
          injectDependencyInjections(params);
          params[paramIndex].file1JsFn(1, 2);
          params[paramIndex].file1JsFn(1, 2);
          const injections = session.get('injections');
          expect(injections).toEqual([
            [paramIndex, fppkey, [1, 2], 3],
            [paramIndex, fppkey, [1, 2], 3],
          ]);
        });
      });
    });
  });
});
