const { createNamespace } = require('cls-hooked');

jest.mock('../manager', () => ({
  recordTrio: jest.fn(),
}));
jest.mock('../utils/dynamic-type-inference', () => ({
  generateTypesObj: () => ({ params: ['Number', 'Number'], result: 'Number' }),
}));
const RecorderManager = require('../manager');
const { recordToCls, recordInjectedActivity } = require('./di-recorder');

describe('di-recorder', () => {
  describe('recordToCls', () => {
    it('should add injections to a flat list', () => {
      const session = createNamespace('default');
      session.run(() => {
        recordToCls(1, 2, 3, 4);
        recordToCls(5, 6, 7, 8);
        const injections = session.get('injections');
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
        path: 'path', name: 'name', captureIndex: 0, paramIds: ['a', 'b'],
      };
      const paramIndex = 0;
      const fppkey = 'foo.bar';
      const params = [1, 2];
      const result = 3;
      recordInjectedActivity(meta, paramIndex, fppkey, params, result);
      const addr = ['recorderState', 'path', 'exportedFunctions', 'name', 'captures', 0, 'injections', 'a.foo.bar', 'captures', 0];
      const types = { params: ['Number', 'Number'], result: 'Number' };
      expect(RecorderManager.recordTrio.mock.calls).toEqual([
        [addr, params, result, types],
      ]);
    });
    it('should call recordmanager correctly for functionlikes', () => {
      const meta = {
        path: 'path', name: 'name', captureIndex: 0, paramIds: ['a', 'b'],
      };
      const paramIndex = 0;
      const fppkey = null;
      const params = [1, 2];
      const result = 3;
      recordInjectedActivity(meta, paramIndex, fppkey, params, result);
      const addr = ['recorderState', 'path', 'exportedFunctions', 'name', 'captures', 0, 'injections', 'a', 'captures', 0];
      const types = { params: ['Number', 'Number'], result: 'Number' };
      expect(RecorderManager.recordTrio.mock.calls).toEqual([
        [addr, params, result, types],
      ]);
    });
  });
});
