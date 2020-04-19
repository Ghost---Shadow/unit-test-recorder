jest.mock('../manager', () => ({
  record: jest.fn().mockImplementation(() => null), // noop
}));
jest.mock('../utils/misc', () => ({
  shouldRecordStubParams: jest.fn().mockImplementation(() => true),
}));
const RecorderManager = require('../manager');
// const misc = require('../utils/misc');

const {
  injectFunctionDynamically,
} = require('./injector');

describe('injector', () => {
  describe('injectFunctionDynamically', () => {
    it('should do nothing if not a function', () => {
      const maybeFunction = 42;
      const meta = {};
      const boundRecorder = jest.fn();
      const result = injectFunctionDynamically(maybeFunction, meta, boundRecorder);
      expect(result).toEqual(42);
      expect(boundRecorder.mock.calls.length).toEqual(0);
    });
    it('should assign and invoke bound recorder if not present', () => {
      const maybeFunction = (a, b) => a + b;
      const meta = {};
      const boundRecorder = jest.fn();
      const injFn = injectFunctionDynamically(maybeFunction, meta, boundRecorder);
      injFn(1, 2);
      expect(boundRecorder.mock.calls[0]).toEqual([[1, 2], 3]);
      expect(injFn.boundRecorder).toBeTruthy();
    });
    it('should assign and invoke bound recorder if not present (async)', async () => {
      const maybeFunction = (a, b) => new Promise((res) => {
        setTimeout(() => res(a + b));
      });
      const meta = {};
      const boundRecorder = jest.fn();
      const injFn = injectFunctionDynamically(maybeFunction, meta, boundRecorder);
      await injFn(1, 2);
      expect(boundRecorder.mock.calls[0]).toEqual([[1, 2], 3]);
      expect(injFn.boundRecorder).toBeTruthy();
    });
    it('should ignore function as constructor', () => {
      function maybeFunction(a, b) {
        return a + b;
      }
      const meta = {};
      const boundRecorder = jest.fn();
      const InjFn = injectFunctionDynamically(maybeFunction, meta, boundRecorder);
      // eslint-disable-next-line no-new
      new InjFn(1, 2);
      expect(boundRecorder.mock.calls.length).toEqual(0);
      expect(RecorderManager.record.mock.calls.length).toEqual(1);
    });
    describe('Broadcast logic', () => {
      it('should broadcast to all bound recorders if present', () => {
        const maybeFunction = (a, b) => a + b;
        const meta = {};
        const boundRecorder1 = jest.fn();
        const injFn1 = injectFunctionDynamically(maybeFunction, meta, boundRecorder1);
        const boundRecorder2 = jest.fn();
        const injFn2 = injectFunctionDynamically(injFn1, meta, boundRecorder2);
        injFn2(1, 2);
        expect(boundRecorder1.mock.calls[0]).toEqual([[1, 2], 3]);
        expect(boundRecorder2.mock.calls[0]).toEqual([[1, 2], 3]);
        expect(injFn1.boundRecorder).toBeTruthy();
        expect(injFn2.boundRecorder).toBeTruthy();
      });
    });
  });
});
