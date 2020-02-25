const { toMatchFile } = require('jest-file-snapshot');
const { foo, bar } = require('./01_module_exports_injected');
const { RecorderManager } = require('../../../src/recorder');

expect.extend({ toMatchFile });

const getSnapshotFileName = fileName => `test_integration/flows/${fileName}/${fileName}_activity.json`;

describe('driver', () => {
  describe('01_module_exports', () => {
    it('should record activity', () => {
      RecorderManager.clear();
      foo(1, 2);
      foo(2, 1);
      bar(2, 2);
      const outputFileName = getSnapshotFileName('01_module_exports');
      expect(RecorderManager.getSerialized()).toMatchFile(outputFileName);
    });
  });
});
