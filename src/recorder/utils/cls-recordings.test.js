const { createNamespace } = require('cls-hooked');
const _ = require('lodash');

jest.mock('../utils/dynamic-type-inference', () => ({
  generateTypesObj: () => ({ params: ['Number', 'Number'], result: 'Number' }),
}));
const {
  recordToCls,
  recordAllToRecorderState,
  promoteInjections,
} = require('./cls-recordings');

const {
  CLS_NAMESPACE,
  KEY_UUID_LUT,
  KEY_UUID,
} = require('../../util/constants');

console.warn = () => null;

describe('di-recorder', () => {
  describe('recordToCls', () => {
    it('should add injections to a flat list', () => {
      const session = createNamespace(CLS_NAMESPACE);
      session.run(() => {
        session.set('stack', [{}]);
        const data1 = {
          paramIndex: 1, fppkey: 2, params: 3, result: 4,
        };
        const data2 = {
          paramIndex: 5, fppkey: 6, params: 7, result: 8,
        };
        const KEY = 'injections';
        recordToCls(KEY, data1);
        recordToCls(KEY, data2);
        const stack = session.get('stack');
        const { injections } = stack[0];
        expect(injections).toEqual([data1, data2]);
      });
    });
    it('should do nothing if not in a session', () => {
      const data1 = {
        paramIndex: 1, fppkey: 2, params: 3, result: 4,
      };

      const KEY = 'injections';
      recordToCls(KEY, data1); // Should not throw exception
    });
  });
  describe('recordAllToRecorderState', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should dump everything from cls to state', () => {
      const session = createNamespace(CLS_NAMESPACE);
      session.run(() => {
        const data1 = {
          paramIndex: 0, fppkey: null, params: [1, 2], result: 3,
        };
        const data2 = {
          paramIndex: 0, fppkey: null, params: [2, 3], result: 5,
        };
        const injections = [data1, data2];
        const meta = {
          path: 'path', name: 'name', captureIndex: 0, paramIds: ['a', 'b'], injections,
        };
        const captureIndex = 0;
        session.set('stack', [meta]);
        const KEY = 'injections';
        const recorderFunction = jest.fn();
        recordAllToRecorderState(KEY, recorderFunction, captureIndex);
        const strippedMeta = _.omit(meta, ['injections', 'mocks']);
        expect(recorderFunction.mock.calls).toEqual([
          [0, strippedMeta, data1],
          [0, strippedMeta, data2],
        ]);
      });
    });
    it('should do nothing if there are no injections', () => {
      const session = createNamespace(CLS_NAMESPACE);
      session.run(() => {
        const meta = {
          path: 'path', name: 'name', captureIndex: 0, paramIds: ['a', 'b'],
        };
        const captureIndex = 0;
        session.set('stack', [meta]);
        const KEY = 'injections';
        const recorderFunction = jest.fn();
        recordAllToRecorderState(KEY, recorderFunction, captureIndex);
        expect(recorderFunction.mock.calls.length).toEqual(0);
      });
    });
  });
  describe('promoteInjections', () => {
    it('should add childs injections to parent', () => {
      const session = createNamespace(CLS_NAMESPACE);
      session.run(() => {
        const data1 = {
          paramIndex: 0, fppkey: null, params: [], result: 1, [KEY_UUID]: '1',
        };
        const data2 = {
          paramIndex: 0, fppkey: null, params: [], result: 2, [KEY_UUID]: '1',
        };
        const data3 = {
          paramIndex: 0, fppkey: null, params: [], result: 3, [KEY_UUID]: '1',
        };
        const data4 = {
          paramIndex: 0, fppkey: null, params: [], result: 4, [KEY_UUID]: '1',
        };
        const parentInjections = [data1, data2];
        const parentMeta = {
          path: 'path',
          name: 'parent',
          captureIndex: 0,
          paramIds: ['a', 'b'],
          injections: parentInjections,
          [KEY_UUID_LUT]: {
            1: 0,
          },
        };
        const childInjections = [data3, data4];
        const childMeta = {
          path: 'path',
          name: 'child',
          captureIndex: 0,
          paramIds: ['a', 'b'],
          injections: childInjections,
        };
        session.set('stack', [parentMeta, childMeta]);
        promoteInjections();
        const stack = session.get('stack');
        const { injections } = stack[0];
        expect(injections).toEqual([...parentInjections, ...childInjections]);
        expect(stack.length).toEqual(1);
      });
    });
    it('should add childs mocks to parent', () => {
      const session = createNamespace(CLS_NAMESPACE);
      session.run(() => {
        const data1 = { params: [], result: 1 };
        const data2 = { params: [], result: 2 };
        const data3 = { params: [], result: 3 };
        const data4 = { params: [], result: 4 };
        const parentMocks = [data1, data2];
        const parentMeta = {
          path: 'path',
          name: 'parent',
          captureIndex: 0,
          mocks: parentMocks,
        };
        const childMocks = [data3, data4];
        const childMeta = {
          path: 'path',
          name: 'child',
          captureIndex: 0,
          mocks: childMocks,
        };
        session.set('stack', [parentMeta, childMeta]);
        promoteInjections();
        const stack = session.get('stack');
        const { mocks } = stack[0];
        expect(mocks).toEqual([...parentMocks, ...childMocks]);
        expect(stack.length).toEqual(1);
      });
    });
    it('should do nothing if no parent', () => {
      const session = createNamespace(CLS_NAMESPACE);
      session.run(() => {
        const data1 = {
          paramIndex: 0, fppkey: null, params: [], result: 1,
        };
        const data2 = {
          paramIndex: 0, fppkey: null, params: [], result: 2,
        };
        const injections = [data1, data2];
        const meta = {
          path: 'path',
          name: 'parent',
          captureIndex: 0,
          paramIds: ['a', 'b'],
          injections,
        };
        session.set('stack', [meta]);
        promoteInjections();
        const stack = session.get('stack');
        expect(stack[0].injections).toEqual(injections);
        expect(stack.length).toEqual(1);
      });
    });
  });
});
