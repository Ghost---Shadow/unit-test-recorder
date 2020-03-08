const { toMatchFile } = require('jest-file-snapshot');
const { foo, bar } = require('./01_module_exports/01_module_exports_instrumented');
const dum = require('./02_module_export/02_module_export_instrumented');
const { default: ecma2, ecma1 } = require('./03_ecma_export/03_ecma_export_instrumented');
const { circularReference, returnAFunction } = require('./04_unserializeable/04_unserializeable_instrumented');
const getPost = require('./05_dependency_injection/05_dependency_injection_instrumented');
const { RecorderManager } = require('../../src/recorder');

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
  describe('02_module_export', () => {
    it('should record activity', () => {
      RecorderManager.clear();
      dum(1);
      const outputFileName = getSnapshotFileName('02_module_export');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
  describe('03_ecma_export', () => {
    it('should record activity', () => {
      RecorderManager.clear();
      ecma1(1, 2);
      ecma2(1);
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
  describe.only('05_dependency_injection', () => {
    it('should record activity', async () => {
      RecorderManager.clear();
      const dbClient = {
        query: q => ({
          'SELECT * FROM posts WHERE id=?': { title: 'content' },
          'SELECT region_id FROM regions where post_id=?': 42,
        })[q],
        pool: {
          pooledQuery: () => [{ comment: 'comment 1' }, { comment: 'comment 2' }],
        },
      };
      await getPost(dbClient, 1);
      const outputFileName = getSnapshotFileName('05_dependency_injection');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
});
