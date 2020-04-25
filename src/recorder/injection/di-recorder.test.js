const { createNamespace } = require('cls-hooked');

jest.mock('../manager', () => ({
  recordTrio: jest.fn(),
}));
jest.mock('../utils/dynamic-type-inference', () => ({
  generateTypesObj: () => ({ params: ['Number', 'Number'], result: 'Number' }),
}));
const RecorderManager = require('../manager');
const {
  recordToCls,
  recordInjectedActivity,
  recordAllToRecorderState,
  promoteInjections,
} = require('./di-recorder');

describe('di-recorder', () => {
  describe('recordToCls', () => {
    it('should add injections to a flat list', () => {
      const session = createNamespace('default');
      session.run(() => {
        session.set('stack', [{}]);
        recordToCls(1, 2, 3, 4);
        recordToCls(5, 6, 7, 8);
        const stack = session.get('stack');
        const { injections } = stack[0];
        expect(injections).toEqual([
          [1, 2, 3, 4],
          [5, 6, 7, 8],
        ]);
      });
    });
  });
  describe('recordInjectedActivity', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should call recordmanager correctly for objectlikes', () => {
      const meta = {
        path: 'path', name: 'name', paramIds: ['a', 'b'],
      };
      const paramIndex = 0;
      const fppkey = 'foo.bar';
      const params = [1, 2];
      const result = 3;
      const captureIndex = 0;
      recordInjectedActivity(meta, paramIndex, captureIndex, fppkey, params, result);
      const addr = ['recorderState', 'path', 'exportedFunctions', 'name', 'captures', 0, 'injections', 'a.foo.bar', 'captures', 0];
      const types = { params: ['Number', 'Number'], result: 'Number' };
      expect(RecorderManager.recordTrio.mock.calls).toEqual([
        [addr, params, result, types],
      ]);
    });
    it('should call recordmanager correctly for functionlikes', () => {
      const meta = {
        path: 'path', name: 'name', paramIds: ['a', 'b'],
      };
      const paramIndex = 0;
      const fppkey = null;
      const params = [1, 2];
      const result = 3;
      const captureIndex = 0;
      recordInjectedActivity(meta, paramIndex, captureIndex, fppkey, params, result);
      const addr = ['recorderState', 'path', 'exportedFunctions', 'name', 'captures', 0, 'injections', 'a', 'captures', 0];
      const types = { params: ['Number', 'Number'], result: 'Number' };
      expect(RecorderManager.recordTrio.mock.calls).toEqual([
        [addr, params, result, types],
      ]);
    });
  });
  describe('recordAllToRecorderState', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should dump everything from cls to state', () => {
      const session = createNamespace('default');
      session.run(() => {
        const injections = [
          [0, null, [1, 2], 3],
          [0, null, [2, 3], 5],
        ];
        const meta = {
          path: 'path', name: 'name', captureIndex: 0, paramIds: ['a', 'b'], injections,
        };
        const captureIndex = 0;
        session.set('stack', [meta]);
        recordAllToRecorderState(captureIndex);
        const addr = ['recorderState', 'path', 'exportedFunctions', 'name', 'captures', 0, 'injections', 'a', 'captures', 0];
        const types = { params: ['Number', 'Number'], result: 'Number' };
        expect(RecorderManager.recordTrio.mock.calls).toEqual([
          [addr, [1, 2], 3, types],
          [addr, [2, 3], 5, types],
        ]);
      });
    });
  });
  describe('promoteInjections', () => {
    it('should add childs injections to parent', () => {
      const session = createNamespace('default');
      session.run(() => {
        const parentInjections = [
          [0, null, [], 1],
          [0, null, [], 2],
        ];
        const parentMeta = {
          path: 'path',
          name: 'parent',
          captureIndex: 0,
          paramIds: ['a', 'b'],
          injections: parentInjections,
        };
        const childInjections = [
          [0, null, [], 3],
          [0, null, [], 4],
        ];
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
    it('should do nothing if no parent', () => {
      const session = createNamespace('default');
      session.run(() => {
        const injections = [
          [0, null, [], 1],
          [0, null, [], 2],
        ];
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
