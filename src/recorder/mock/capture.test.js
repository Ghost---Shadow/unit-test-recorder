
jest.mock('cls-hooked');
// jest.mock('../utils/dynamic-type-inference');
jest.mock('../manager');

const cls = require('cls-hooked');
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
        captureIndex: 0,
      };
      const types = {
        params: ['Number', 'Number'],
        result: 'Number',
      };
      const get = jest.fn().mockReturnValue([meta]);
      cls.getNamespace.mockImplementation(() => ({ get }));
      captureMockActivity(mockMeta, params, result);
      const addr = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'captures', 0, 'mocks', 'fs', 'readFileSync', 'captures', 0];
      expect(RecorderManager.recordTrio.mock.calls).toEqual([
        [addr, params, result, types],
      ]);
    });
  });
});
