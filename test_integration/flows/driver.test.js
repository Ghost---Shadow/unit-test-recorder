const { toMatchFile } = require('jest-file-snapshot');
const { RecorderManager } = require('../../src/recorder');

const mei = require('./01_module_exports/01_module_exports_instrumented');
const { getFacebookInfo, getSocialInfo } = require('./02_async_functions/02_async_functions_instrumented');
const {
  default: ecma2, ecma1, ecma3, ecma4,
} = require('./03_ecma_export/03_ecma_export_instrumented');
const unserializeable = require('./04_unserializeable/04_unserializeable_instrumented');
const di = require('./05_dependency_injection/05_dependency_injection_instrumented');
const mocks = require('./06_mocks/06_mocks_instrumented');
const { getClickCounts } = require('./07_large_payload/07_large_payload_instrumented');
const { newTarget, sample, protoOverwrite } = require('./08_this/08_this_instrumented');
const { exportTest1, default: exportTest2, exportTest3 } = require('./09_typescript_exports/09_typescript_exports_instrumented');
const { default: edTest } = require('./10_anon_export_default/10_anon_export_default_instrumented');
const hoi = require('./11_higher_order/11_higher_order_instrumented');
const ui = require('./12_unwanted_injections/12_unwanted_injections_instrumented');
const anonTs = require('./13_anon_ts_export_default/13_anon_ts_export_default_instrumented');
const anonMe = require('./14_anon_module_exports_default/14_anon_module_exports_default_instrumented');
const namedMe = require('./15_named_module_exports_default/15_named_module_exports_default_instrumented');
const exportedObj = require('./16_exported_objects/16_exported_objects_instrumented');

expect.extend({ toMatchFile });

const getSnapshotFileName = fileName => `test_integration/flows/${fileName}/${fileName}_activity.json`;

describe('driver', () => {
  describe('01_module_exports', () => {
    it('should record activity', () => {
      RecorderManager.clear();
      mei.foo(1, 2);
      mei.foo(1, 2);
      mei.foo('A', 'B');
      mei.foo(2, 1);
      mei.bar(2, 2);
      mei.specialParams(1, { b: 1, c: 1 });
      mei.specialParams(1, { b: 1, c: 1 }, 2);
      mei.specialParams2(1, { b: 1, c: 1 });
      const outputFileName = getSnapshotFileName('01_module_exports');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('02_async_functions', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      await getSocialInfo('email');
      await getFacebookInfo('email');
      const outputFileName = getSnapshotFileName('02_async_functions');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('03_ecma_export', () => {
    it('should record activity', () => {
      RecorderManager.clear();
      ecma1(1, 2);
      ecma2(1);
      ecma3(1);
      ecma4(1);
      const outputFileName = getSnapshotFileName('03_ecma_export');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('04_unserializeable', () => {
    it('should record activity', () => {
      RecorderManager.clear();
      unserializeable.circularReference(1);
      unserializeable.returnAFunction(1, a => a * 2);
      unserializeable.getElapsedTime(new Date(2018, 1, 1), new Date(2019, 1, 1));
      unserializeable.returnsNaN('a');
      const outputFileName = getSnapshotFileName('04_unserializeable');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('05_dependency_injection', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      const query = q => new Promise((resolve) => {
        setTimeout(() => resolve({
          'SELECT * FROM posts WHERE id=?': { title: 'content' },
          'SELECT region_id FROM regions where post_id=?': 42,
        }[q]), 1);
      });

      const pooledQuery = () => new Promise((resolve) => {
        setTimeout(() => resolve([{ comment: 'comment 1' }, { comment: 'comment 2' }]));
      });
      const dbClient = {
        commitSync: () => {},
        __proto__: {
          query,
          __proto__: {
            pool: {
              pooledQuery,
            },
          },
        },
      };
      const redisCache = () => new Promise((resolve) => {
        setTimeout(() => resolve(350));
      });
      await di.getPost(dbClient, 1, redisCache);
      const outputFileName = getSnapshotFileName('05_dependency_injection');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('06_mocks', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      await mocks.getTodo();
      await mocks.localMocksTest();
      // mocks.datesTest(); // TODO
      // await mocks.higherOrderTest(); // TODO
      const outputFileName = getSnapshotFileName('06_mocks');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('07_large_payload', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      getClickCounts();
      const outputFileName = getSnapshotFileName('07_large_payload');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('08_this', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      const obj = { InjectedPromise: global.Promise };
      await newTarget(obj);
      sample();
      protoOverwrite();
      const outputFileName = getSnapshotFileName('08_this');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('09_typescript_exports', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      exportTest1(2);
      exportTest2(3);
      exportTest3(4);
      const outputFileName = getSnapshotFileName('09_typescript_exports');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('10_anon_export_default', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      edTest(1, 2);
      const outputFileName = getSnapshotFileName('10_anon_export_default');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('11_higher_order', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      hoi.base({ someFun: () => 1 })({ someOtherFun: () => 2 });
      hoi.validFun({ someFun: () => 5 });
      hoi.secondary1({ someFun: () => 1 });
      hoi.secondary2({ someFun: () => 1 });
      const outputFileName = getSnapshotFileName('11_higher_order');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('12_unwanted_injections', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      ui.fun([1, 2]);
      ui.fun2(2);
      ui.fun3(a => a);
      const outputFileName = getSnapshotFileName('12_unwanted_injections');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('13_anon_ts_export_default', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      anonTs.default(1, 2);
      const outputFileName = getSnapshotFileName('13_anon_ts_export_default');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('14_anon_module_exports_default', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      anonMe(1);
      const outputFileName = getSnapshotFileName('14_anon_module_exports_default');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('15_named_module_exports_default', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      namedMe(1);
      const outputFileName = getSnapshotFileName('15_named_module_exports_default');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('16_exported_objects', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      await exportedObj.obj1.foo1({ someFun: () => Promise.resolve(1) }, 2);
      await exportedObj.obj1.foo2();
      await exportedObj.obj2.bar(2, 1);
      await exportedObj.obj2.deep.fun({ anotherFun: () => 1 });
      await exportedObj.obj2.higher(1)(2);
      const outputFileName = getSnapshotFileName('16_exported_objects');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
});
