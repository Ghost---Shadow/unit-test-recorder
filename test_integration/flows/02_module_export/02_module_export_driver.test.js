const { toMatchFile } = require('jest-file-snapshot');
const foo = require('./02_module_export_injected');
const { RecorderManager } = require('../../../src/recorder');

expect.extend({ toMatchFile });

const getSnapshotFileName = fileName => `test_integration/flows/${fileName}/${fileName}_activity.json`;

describe('driver', () => {
  describe('01_module_exports', () => {
    it('should record activity', () => {
      RecorderManager.clear();
      foo(1);
      const outputFileName = getSnapshotFileName('02_module_export');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
});
