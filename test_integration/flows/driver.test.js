const { toMatchFile } = require('jest-file-snapshot');
const { RecorderManager } = require('../../src/recorder');

const { foo, bar } = require('./01_module_exports/01_module_exports_instrumented');
const { getFacebookInfo, getSocialInfo } = require('./02_async_functions/02_async_functions_instrumented');
const {
  default: ecma2, ecma1, ecma3, ecma4,
} = require('./03_ecma_export/03_ecma_export_instrumented');
const { circularReference, returnAFunction } = require('./04_unserializeable/04_unserializeable_instrumented');
const getPost = require('./05_dependency_injection/05_dependency_injection_instrumented');
const { getTodo, localMocksTest } = require('./06_mocks/06_mocks_instrumented');
const { getClickCounts } = require('./07_large_payload/07_large_payload_instrumented');
const { newTarget, sample, protoOverwrite } = require('./08_this/08_this_instrumented');
const { exportTest } = require('./09_typescript_exports/09_typescript_exports_instrumented');

expect.extend({ toMatchFile });

const getSnapshotFileName = fileName => `test_integration/flows/${fileName}/${fileName}_activity.json`;

describe('driver', () => {
  describe('01_module_exports', () => {
    it('should record activity', () => {
      RecorderManager.clear();
      foo(1, 2);
      foo('A', 'B');
      foo(2, 1);
      bar(2, 2);
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
      circularReference(1);
      returnAFunction(1, a => a * 2);
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
      await getPost(dbClient, 1, redisCache);
      const outputFileName = getSnapshotFileName('05_dependency_injection');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('06_mocks', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      await getTodo();
      localMocksTest();
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
      exportTest(2);
      const outputFileName = getSnapshotFileName('09_typescript_exports');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
});
