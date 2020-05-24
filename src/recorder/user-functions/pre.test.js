
jest.mock('../../util/cls-provider');
jest.mock('../injection');
jest.mock('../manager');

const cls = require('../../util/cls-provider');
const inj = require('../injection');
const RecorderManager = require('../manager');

const { pre } = require('./pre');

describe('user-function-pre', () => {
  describe('pre', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should set stack and inject functions', () => {
      const params = [1, 2];
      const meta = {
        path: 'dir1/file1.js',
        name: 'fun1',
      };
      const set = jest.fn();
      const get = jest.fn().mockReturnValue(undefined);
      cls.getNamespace.mockImplementation(() => ({ set, get }));
      pre(meta, params);
      const addrToDoesReturnPromise = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'meta'];
      expect(RecorderManager.record.mock.calls).toEqual([
        [addrToDoesReturnPromise, meta],
      ]);
      expect(set.mock.calls).toEqual([
        ['stack', [meta]],
        ['originalStackRef', []],
      ]);
      expect(inj.injectDependencyInjections.mock.calls).toEqual([
        [params],
      ]);
    });
    it('should stack on meta', () => {
      const params = [1, 2];
      const meta = {
        path: 'dir1/file1.js',
        name: 'fun1',
      };
      const oldMeta = {
        path: 'dir1/file1.js',
        name: 'fun2',
      };
      const set = jest.fn();
      const get = jest.fn().mockReturnValue([oldMeta]);
      cls.getNamespace.mockImplementation(() => ({ set, get }));
      pre(meta, params);
      const addrToDoesReturnPromise = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'meta'];
      expect(RecorderManager.record.mock.calls).toEqual([
        [addrToDoesReturnPromise, meta],
      ]);
      expect(set.mock.calls).toEqual([
        ['stack', [meta]],
        ['originalStackRef', [oldMeta]],
      ]);
      expect(inj.injectDependencyInjections.mock.calls).toEqual([
        [params],
      ]);
    });
  });
});
