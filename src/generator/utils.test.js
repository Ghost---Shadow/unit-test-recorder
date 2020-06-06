const { generateNameForExternal, getOutputFilePath } = require('./utils');

describe('generator_utils', () => {
  describe('generateNameForExternal', () => {
    it('should work for same directory', () => {
      const sourceFilePath = 'test_integration/flows/07_large_payload/07_large_payload.js';
      const functionName = 'getClickCounts';
      const captureIndex = 1;
      const identifierName = 'result';
      const relativePath = './';
      const meta = { path: sourceFilePath, name: functionName, relativePath };
      const actual = generateNameForExternal(meta, captureIndex, identifierName);
      expect(actual).toEqual({
        identifier: 'getClickCounts1result',
        filePath: 'test_integration/flows/07_large_payload/07_large_payload/getClickCounts_1_result.mock.js',
        importPath: './07_large_payload/getClickCounts_1_result.mock.js',
      });
    });
    it('should work for typescript', () => {
      const sourceFilePath = 'dist/test_integration/flows/07_large_payload/07_large_payload.js';
      const functionName = 'getClickCounts';
      const captureIndex = 1;
      const identifierName = 'result';
      const relativePath = './';
      const tsBuildDir = 'dist';
      const meta = {
        path: sourceFilePath, name: functionName, relativePath, tsBuildDir,
      };
      const actual = generateNameForExternal(meta, captureIndex, identifierName);
      expect(actual).toEqual({
        identifier: 'getClickCounts1result',
        filePath: 'test_integration/flows/07_large_payload/07_large_payload/getClickCounts_1_result.mock.ts',
        importPath: './07_large_payload/getClickCounts_1_result.mock.ts',
      });
    });
    it('should work for object exports', () => {
      const sourceFilePath = 'test_integration/flows/16_exported_objects/16_exported_objects.js';
      const functionName = 'obj.subobj.functionName';
      const captureIndex = 1;
      const identifierName = 'result';
      const relativePath = './';
      const meta = { path: sourceFilePath, name: functionName, relativePath };
      const actual = generateNameForExternal(meta, captureIndex, identifierName);
      expect(actual).toEqual({
        identifier: 'objSubobjFunctionName1result',
        filePath: 'test_integration/flows/16_exported_objects/16_exported_objects/objSubobjFunctionName_1_result.mock.js',
        importPath: './16_exported_objects/objSubobjFunctionName_1_result.mock.js',
      });
    });
  });
  describe('getOutputFilePath', () => {
    it('should work when outputDir is null', () => {
      const filePath = 'dir1/dir2/foo.js';
      const outputDir = null;
      const actual = getOutputFilePath(filePath, { outputDir });
      const expected = {
        outputFilePath: 'dir1/dir2/foo.js',
        importPath: './foo',
        relativePath: './',
      };
      expect(actual).toEqual(expected);
    });
    it('should work when outputDir is pwd', () => {
      const filePath = 'dir1/dir2/foo.js';
      const outputDir = './';
      const actual = getOutputFilePath(filePath, { outputDir });
      const expected = {
        outputFilePath: 'dir1/dir2/foo.js',
        importPath: './foo',
        relativePath: './',
      };
      expect(actual).toEqual(expected);
    });
    it('should work when outputdir is different', () => {
      const filePath = './dir1/dir2/foo.js';
      const outputDir = './dir3';
      const actual = getOutputFilePath(filePath, { outputDir });
      const expected = {
        outputFilePath: 'dir3/dir1/dir2/foo.js',
        importPath: '../../../dir1/dir2/foo',
        relativePath: '../../dir3/dir1/dir2/',
      };
      expect(actual).toEqual(expected);
    });
    it('should work on compiled typescript on windows', () => {
      const filePath = 'dist\\dir1\\dir2\\foo.js';
      const outputDir = '.\\dir3';
      const tsBuildDir = '.\\dist';
      const actual = getOutputFilePath(filePath, { outputDir, tsBuildDir });
      const expected = {
        outputFilePath: 'dir3/dir1/dir2/foo.js',
        importPath: '../../../dir1/dir2/foo',
        relativePath: '../../dir3/dir1/dir2/',
      };
      expect(actual).toEqual(expected);
    });
    it('should work on compiled typescript', () => {
      const filePath = './dist/dir1/dir2/foo.js';
      const outputDir = './dir3';
      const tsBuildDir = './dist';
      const actual = getOutputFilePath(filePath, { outputDir, tsBuildDir });
      const expected = {
        outputFilePath: 'dir3/dir1/dir2/foo.js',
        importPath: '../../../dir1/dir2/foo',
        relativePath: '../../dir3/dir1/dir2/',
      };
      expect(actual).toEqual(expected);
    });
  });
});
