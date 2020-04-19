jest.mock('../injection/di-recorder');
jest.mock('../manager');
jest.mock('../utils/hash-helper');
jest.mock('cls-hooked');

const cls = require('cls-hooked');
const RecorderManager = require('../manager');
const hh = require('../utils/hash-helper');
const dir = require('../injection/di-recorder');
const { processFunctionLikeParam, captureUserFunction } = require('./capture-logic');

describe('user-function-capture', () => {
  describe('processFunctionLikeParam', () => {
    it('should return same for non function like params', () => {
      const param = 2;
      const result = processFunctionLikeParam(param);
      expect(result).toEqual(param);
    });
    it('should return stringified for function like params', () => {
      const param = () => {};
      const result = processFunctionLikeParam(param);
      expect(result).toEqual(param.toString());
    });
    it('should return null for injected functions', () => {
      const param = () => {};
      param.utrIsInjected = true;
      const result = processFunctionLikeParam(param);
      expect(result).toEqual(null);
    });
  });
  describe('captureUserFunction', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should record sync functions', () => {
      const result = 3;
      const params = [1, 2];
      const doesReturnPromise = false;
      const meta = {
        path: 'dir1/file1.js',
        name: 'fun1',
        doesReturnPromise,
      };
      cls.getNamespace.mockImplementation(() => ({
        get: () => meta,
      }));
      captureUserFunction(params, result);
      const addrToDoesReturnPromise = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'meta', 'doesReturnPromise'];
      expect(RecorderManager.record.mock.calls).toEqual([
        [addrToDoesReturnPromise, doesReturnPromise, false],
      ]);
      const addrToCaptureIndex = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'captures', 0];
      const types = {
        params: ['Number', 'Number'],
        result: 'Number',
      };
      expect(RecorderManager.recordTrio.mock.calls).toEqual([
        [addrToCaptureIndex, params, result, types],
      ]);
      expect(dir.recordAllToRecorderState.mock.calls.length).toBe(1);
    });
    it('should record async functions', () => {
      const result = 3;
      const params = [1, 2];
      const doesReturnPromise = true;
      const meta = {
        path: 'dir1/file1.js',
        name: 'fun1',
        doesReturnPromise,
      };
      cls.getNamespace.mockImplementation(() => ({
        get: () => meta,
      }));
      captureUserFunction(params, result);
      const addrToDoesReturnPromise = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'meta', 'doesReturnPromise'];
      expect(RecorderManager.record.mock.calls).toEqual([
        [addrToDoesReturnPromise, doesReturnPromise, false],
      ]);
      const addrToCaptureIndex = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'captures', 0];
      const types = {
        params: ['Number', 'Number'],
        result: 'Number',
      };
      expect(RecorderManager.recordTrio.mock.calls).toEqual([
        [addrToCaptureIndex, params, result, types],
      ]);
      expect(dir.recordAllToRecorderState.mock.calls.length).toBe(1);
    });
    it('should not record if hash matches', () => {
      const result = 3;
      const params = [1, 2];
      const doesReturnPromise = false;
      const meta = {
        path: 'dir1/file1.js',
        name: 'fun1',
        doesReturnPromise,
      };
      cls.getNamespace.mockImplementation(() => ({
        get: () => meta,
      }));
      hh.checkAndSetHash.mockReturnValue(true);
      captureUserFunction(params, result);
      const addrToDoesReturnPromise = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'meta', 'doesReturnPromise'];
      const addrToCaptureIndex = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'captures', 0];
      expect(RecorderManager.record.mock.calls).toEqual([
        [addrToDoesReturnPromise, doesReturnPromise, false],
        [addrToCaptureIndex, null, null],
      ]);
      expect(RecorderManager.recordTrio.mock.calls).toEqual([]);
      expect(dir.recordAllToRecorderState.mock.calls.length).toBe(0);
    });
    it('should not crash for HOF', () => {
      const result = () => {};
      const params = [1, 2];
      const doesReturnPromise = false;
      const meta = {
        path: 'dir1/file1.js',
        name: 'fun1',
        doesReturnPromise,
      };
      cls.getNamespace.mockImplementation(() => ({
        get: () => meta,
      }));
      captureUserFunction(params, result);
      const addrToDoesReturnPromise = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'meta', 'doesReturnPromise'];
      expect(RecorderManager.record.mock.calls).toEqual([
        [addrToDoesReturnPromise, doesReturnPromise, false],
      ]);
      const addrToCaptureIndex = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'captures', 0];
      const types = {
        params: ['Number', 'Number'],
        result: 'Function',
      };
      expect(RecorderManager.recordTrio.mock.calls).toEqual([
        [addrToCaptureIndex, params, result.toString(), types],
      ]);
      expect(dir.recordAllToRecorderState.mock.calls.length).toBe(1);
    });
  });
});
