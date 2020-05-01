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
        const data1 = {
          paramIndex: 1, fppkey: 2, params: 3, result: 4,
        };
        const data2 = {
          paramIndex: 5, fppkey: 6, params: 7, result: 8,
        };
        recordToCls(data1);
        recordToCls(data2);
        const stack = session.get('stack');
        const { injections } = stack[0];
        expect(injections).toEqual([data1, data2]);
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
      const data = {
        paramIndex, fppkey, params, result,
      };
      recordInjectedActivity(captureIndex, meta, data);
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
      const data = {
        paramIndex, fppkey, params, result,
      };
      recordInjectedActivity(captureIndex, meta, data);
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
        recordAllToRecorderState(captureIndex);
        const addr = ['recorderState', 'path', 'exportedFunctions', 'name', 'captures', 0, 'injections', 'a', 'captures', 0];
        const types = { params: ['Number', 'Number'], result: 'Number' };
        expect(RecorderManager.recordTrio.mock.calls).toEqual([
          [addr, [1, 2], 3, types],
          [addr, [2, 3], 5, types],
        ]);
      });
    });
    it('should do nothing if there are no injections', () => {
      const session = createNamespace('default');
      session.run(() => {
        const meta = {
          path: 'path', name: 'name', captureIndex: 0, paramIds: ['a', 'b'],
        };
        const captureIndex = 0;
        session.set('stack', [meta]);
        recordAllToRecorderState(captureIndex);
        expect(RecorderManager.recordTrio.mock.calls.length).toEqual(0);
      });
    });
  });
  describe('promoteInjections', () => {
    it('should add childs injections to parent', () => {
      const session = createNamespace('default');
      session.run(() => {
        const data1 = {
          paramIndex: 0, fppkey: null, params: [], result: 1,
        };
        const data2 = {
          paramIndex: 0, fppkey: null, params: [], result: 2,
        };
        const data3 = {
          paramIndex: 0, fppkey: null, params: [], result: 3,
        };
        const data4 = {
          paramIndex: 0, fppkey: null, params: [], result: 4,
        };
        const parentInjections = [data1, data2];
        const parentMeta = {
          path: 'path',
          name: 'parent',
          captureIndex: 0,
          paramIds: ['a', 'b'],
          injections: parentInjections,
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
    it('should do nothing if no parent', () => {
      const session = createNamespace('default');
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
