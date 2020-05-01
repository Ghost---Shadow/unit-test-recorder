jest.mock('../manager', () => ({
  recordTrio: jest.fn(),
}));
jest.mock('../utils/dynamic-type-inference', () => ({
  generateTypesObj: () => ({ params: ['Number', 'Number'], result: 'Number' }),
}));
const RecorderManager = require('../manager');
const {
  recordInjectedActivity,
} = require('./di-recorder');

describe('di-recorder', () => {
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
});
