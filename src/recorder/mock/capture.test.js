// jest.mock('../utils/dynamic-type-inference');
jest.mock('../manager');

// const dti = require('../utils/dynamic-type-inference');
const RecorderManager = require('../manager');

const { captureMockActivity } = require('./capture');

describe('mock-capture', () => {
  describe('captureMockActivity', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should set stack and inject functions', () => {
      const params = [1, 2];
      const result = 3;
      const mockMeta = {
        path: 'dir1/file1.js',
        moduleName: 'fs',
        name: 'readFileSync',
      };
      const meta = {
        name: 'fun1',
      };
      const types = {
        params: ['Number', 'Number'],
        result: 'Number',
      };
      const captureIndex = 0;
      const data = { mockMeta, params, result };
      captureMockActivity(captureIndex, meta, data);
      const addr = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'captures', 0, 'mocks', 'fs', 'readFileSync', 'captures', 0];
      expect(RecorderManager.recordTrio.mock.calls).toEqual([
        [addr, params, result, types],
      ]);
    });
  });
});
