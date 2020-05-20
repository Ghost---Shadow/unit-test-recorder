jest.mock('../manager', () => ({
  record: jest.fn().mockImplementation(() => null), // noop
}));
jest.mock('../utils/misc', () => ({
  shouldRecordStubParams: jest.fn().mockImplementation(() => true),
}));
jest.mock('../utils/cls-recordings', () => ({
  recordToCls: jest.fn(),
}));
jest.mock('uuid', () => {
  let counter = 0;
  counter += 1;
  const uuidGen = () => `uuid_${counter}`;
  uuidGen.reset = () => { counter = 0; };
  return { v4: uuidGen };
});
const uuid = require('uuid');
const cls = require('../../util/cls-provider');
const RecorderManager = require('../manager');
const clsr = require('../utils/cls-recordings');

const {
  CLS_NAMESPACE,
  KEY_UUID,
  KEY_INJECTIONS,
  KEY_UUID_LUT,
} = require('../../util/constants');

const {
  injectFunctionDynamically,
} = require('./injector');

describe('injector', () => {
  describe('injectFunctionDynamically', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      uuid.v4.reset();
    });
    it('should do nothing if not a function', () => {
      const session = cls.createNamespace(CLS_NAMESPACE);
      session.run(() => {
        const maybeFunction = 42;
        const boundRecorder = jest.fn();
        const result = injectFunctionDynamically(maybeFunction, boundRecorder);
        expect(result).toEqual(42);
        expect(clsr.recordToCls.mock.calls.length).toEqual(0);
        expect(boundRecorder.mock.calls.length).toEqual(0);
      });
    });
    it('should assign and invoke bound recorder if not present', () => {
      const session = cls.createNamespace(CLS_NAMESPACE);
      session.run(() => {
        session.set('stack', [{}]);
        const maybeFunction = (a, b) => a + b;
        const paramIndex = 0;
        const fppkey = 'fppKey';
        const injFn = injectFunctionDynamically(maybeFunction, paramIndex, fppkey);
        injFn(1, 2);
        const funcUuid = 'uuid_0';
        const data = {
          paramIndex: 0, fppkey: 'fppKey', params: [1, 2], result: 3, [KEY_UUID]: funcUuid,
        };
        expect(clsr.recordToCls.mock.calls.length).toEqual(1);
        expect(clsr.recordToCls.mock.calls[0]).toEqual([KEY_INJECTIONS, data]);
        expect(injFn[KEY_UUID]).toEqual(funcUuid);
        expect(session.get('stack')).toEqual([{ [KEY_UUID_LUT]: { [funcUuid]: paramIndex } }]);
      });
    });
    it('should assign and invoke bound recorder if not present (async)', (done) => {
      const session = cls.createNamespace(CLS_NAMESPACE);
      session.run(async () => {
        session.set('stack', [{}]);
        const maybeFunction = (a, b) => new Promise((res) => {
          setTimeout(() => res(a + b));
        });
        const funcUuid = 'uuid_0';
        const paramIndex = 0;
        const fppkey = 'fppKey';
        const injFn = injectFunctionDynamically(maybeFunction, paramIndex, fppkey);
        await injFn(1, 2);
        const data = {
          paramIndex: 0, fppkey: 'fppKey', params: [1, 2], result: 3, [KEY_UUID]: funcUuid,
        };
        expect(clsr.recordToCls.mock.calls.length).toEqual(1);
        expect(clsr.recordToCls.mock.calls[0]).toEqual([KEY_INJECTIONS, data]);
        expect(injFn[KEY_UUID]).toEqual(funcUuid);
        expect(session.get('stack')).toEqual([{ [KEY_UUID_LUT]: { [funcUuid]: paramIndex } }]);
        done();
      });
    });
    it('should ignore function as constructor', () => {
      const session = cls.createNamespace(CLS_NAMESPACE);
      session.run(() => {
        session.set('stack', [{}]);
        function maybeFunction(a, b) {
          return a + b;
        }
        const boundRecorder = jest.fn();
        const InjFn = injectFunctionDynamically(maybeFunction, boundRecorder);
        // eslint-disable-next-line no-new
        new InjFn(1, 2);
        expect(clsr.recordToCls.mock.calls.length).toEqual(0);
        expect(boundRecorder.mock.calls.length).toEqual(0);
        expect(RecorderManager.record.mock.calls.length).toEqual(1);
      });
    });
    it('should not inject if already injected', () => {
      const session = cls.createNamespace(CLS_NAMESPACE);
      session.run(() => {
        session.set('stack', [{}]);
        const maybeFunction = (a, b) => a + b;
        const paramIndex = 0;
        const fppkey = 'fppKey';
        let injFn = maybeFunction;
        const funcUuid = 'uuid_0';
        injFn = injectFunctionDynamically(injFn, paramIndex, fppkey);
        injFn = injectFunctionDynamically(injFn, paramIndex, fppkey);
        injFn(1, 2);
        const data = {
          paramIndex: 0, fppkey: 'fppKey', params: [1, 2], result: 3, [KEY_UUID]: funcUuid,
        };
        expect(clsr.recordToCls.mock.calls.length).toEqual(1);
        expect(clsr.recordToCls.mock.calls[0]).toEqual([KEY_INJECTIONS, data]);
        expect(injFn[KEY_UUID]).toEqual(funcUuid);
        expect(session.get('stack')).toEqual([{ [KEY_UUID_LUT]: { [funcUuid]: paramIndex } }]);
      });
    });
    it('should update paramIndex on reinjection', () => {
      const session = cls.createNamespace(CLS_NAMESPACE);
      session.run(() => {
        const metaFun1 = { name: 'fun1' };
        const metaFun2 = { name: 'fun2' };
        const funcUuid = 'uuid_0';
        const metaFun1WithUUid = { ...metaFun1, [KEY_UUID_LUT]: { [funcUuid]: 0 } };
        const metaFun2WithUUid = { ...metaFun2, [KEY_UUID_LUT]: { [funcUuid]: 1 } };
        const maybeFunction = (a, b) => a + b;
        const fppkey = 'fppKey';
        let injFn = maybeFunction;

        // Parent function
        const data1 = {
          paramIndex: 0, fppkey: 'fppKey', params: [1, 2], result: 3, [KEY_UUID]: funcUuid,
        };
        session.set('stack', [metaFun1]);
        injFn = injectFunctionDynamically(injFn, data1.paramIndex, fppkey);
        injFn(1, 2);
        expect(session.get('stack')).toEqual([metaFun1WithUUid]);
        expect(clsr.recordToCls.mock.calls[0]).toEqual([KEY_INJECTIONS, data1]);

        // Child function
        const data2 = {
          paramIndex: 1, fppkey: 'fppKey', params: [1, 2], result: 3, [KEY_UUID]: funcUuid,
        };
        session.set('stack', [metaFun1WithUUid, metaFun2]);
        injFn = injectFunctionDynamically(injFn, data2.paramIndex, fppkey);
        injFn(1, 2);
        expect(session.get('stack')).toEqual([metaFun1WithUUid, metaFun2WithUUid]);
        expect(clsr.recordToCls.mock.calls[1]).toEqual([KEY_INJECTIONS, data2]);

        expect(clsr.recordToCls.mock.calls.length).toEqual(2);
        expect(injFn[KEY_UUID]).toEqual(funcUuid);
      });
    });
  });
});
