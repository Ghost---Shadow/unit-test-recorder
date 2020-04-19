
jest.mock('cls-hooked');
jest.mock('../injection');
jest.mock('../manager');

const cls = require('cls-hooked');
const inj = require('../injection');
const RecorderManager = require('../manager');

const { pre } = require('./pre');

describe('user-function-pre', () => {
  describe('pre', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should set meta and inject functions', () => {
      const params = [1, 2];
      const meta = {
        path: 'dir1/file1.js',
        name: 'fun1',
      };
      const set = jest.fn();
      cls.getNamespace.mockImplementation(() => ({
        set,
      }));
      pre(meta, params);
      const addrToDoesReturnPromise = ['recorderState', 'dir1/file1.js', 'exportedFunctions', 'fun1', 'meta'];
      expect(RecorderManager.record.mock.calls).toEqual([
        [addrToDoesReturnPromise, meta],
      ]);
      expect(set.mock.calls).toEqual([
        ['meta', meta],
      ]);
      expect(inj.injectDependencyInjections.mock.calls).toEqual([
        [params],
      ]);
    });
  });
});
