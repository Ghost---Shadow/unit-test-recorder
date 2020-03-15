const { generateNameForExternal } = require('./utils');

describe('generator_utils', () => {
  describe('generateNameForExternal', () => {
    it('should work for happy path', () => {
      const sourceFilePath = 'test_integration/flows/07_large_payload/07_large_payload.js';
      const functionName = 'getClickCounts';
      const captureIndex = 1;
      const identifierName = 'result';
      const meta = { path: sourceFilePath, name: functionName };
      const actual = generateNameForExternal(meta, captureIndex, identifierName);
      expect(actual).toEqual({
        identifier: 'getClickCounts1result',
        filePath: 'test_integration/flows/07_large_payload/07_large_payload/getClickCounts_1_result.js',
        importPath: './07_large_payload/getClickCounts_1_result.js',
      });
    });
  });
});
