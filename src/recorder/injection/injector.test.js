jest.mock('../manager', () => ({
  record: jest.fn().mockImplementation(() => null), // noop
}));
jest.mock('../utils/misc', () => ({
  shouldRecordStubParams: jest.fn().mockImplementation(() => true),
}));
jest.mock('./di-recorder', () => ({
  recordToCls: jest.fn(),
}));
jest.mock('cls-hooked', () => ({
  getNamespace: () => ({
    get: () => ([{}]),
  }),
}));
const RecorderManager = require('../manager');
const dir = require('./di-recorder');

const {
  injectFunctionDynamically,
} = require('./injector');

describe('injector', () => {
  describe('injectFunctionDynamically', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should do nothing if not a function', () => {
      const maybeFunction = 42;
      const boundRecorder = jest.fn();
      const result = injectFunctionDynamically(maybeFunction, boundRecorder);
      expect(result).toEqual(42);
      expect(dir.recordToCls.mock.calls.length).toEqual(0);
      expect(boundRecorder.mock.calls.length).toEqual(0);
    });
    it('should assign and invoke bound recorder if not present', () => {
      const maybeFunction = (a, b) => a + b;
      const paramIndex = 0;
      const fppkey = 'fppKey';
      const injFn = injectFunctionDynamically(maybeFunction, paramIndex, fppkey);
      injFn(1, 2);
      const data = {
        paramIndex: 0, fppkey: 'fppKey', params: [1, 2], result: 3,
      };
      expect(dir.recordToCls.mock.calls.length).toEqual(1);
      expect(dir.recordToCls.mock.calls[0]).toEqual([data]);
      expect(injFn.utrIsInjected).toBeTruthy();
    });
    it('should assign and invoke bound recorder if not present (async)', async () => {
      const maybeFunction = (a, b) => new Promise((res) => {
        setTimeout(() => res(a + b));
      });
      const paramIndex = 0;
      const fppkey = 'fppKey';
      const injFn = injectFunctionDynamically(maybeFunction, paramIndex, fppkey);
      await injFn(1, 2);
      const data = {
        paramIndex: 0, fppkey: 'fppKey', params: [1, 2], result: 3,
      };
      expect(dir.recordToCls.mock.calls.length).toEqual(1);
      expect(dir.recordToCls.mock.calls[0]).toEqual([data]);
      expect(injFn.utrIsInjected).toBeTruthy();
    });
    it('should ignore function as constructor', () => {
      function maybeFunction(a, b) {
        return a + b;
      }
      const boundRecorder = jest.fn();
      const InjFn = injectFunctionDynamically(maybeFunction, boundRecorder);
      // eslint-disable-next-line no-new
      new InjFn(1, 2);
      expect(dir.recordToCls.mock.calls.length).toEqual(0);
      expect(boundRecorder.mock.calls.length).toEqual(0);
      expect(RecorderManager.record.mock.calls.length).toEqual(1);
    });
    it('should not inject if already injected', () => {
      const maybeFunction = (a, b) => a + b;
      const paramIndex = 0;
      const fppkey = 'fppKey';
      let injFn = maybeFunction;
      injFn = injectFunctionDynamically(injFn, paramIndex, fppkey);
      injFn = injectFunctionDynamically(injFn, paramIndex, fppkey);
      injFn(1, 2);
      const data = {
        paramIndex: 0, fppkey: 'fppKey', params: [1, 2], result: 3,
      };
      expect(dir.recordToCls.mock.calls.length).toEqual(1);
      expect(dir.recordToCls.mock.calls[0]).toEqual([data]);
      expect(injFn.utrIsInjected).toBeTruthy();
    });
  });
});
