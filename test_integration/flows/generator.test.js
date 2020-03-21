const fs = require('fs');

const { toMatchFile } = require('jest-file-snapshot');

expect.extend({ toMatchFile });

const { extractTestsFromState } = require('../../src/generator');

const getInputAndOutputPathForTests = (fileName) => {
  const inputPath = `test_integration/flows/${fileName}/${fileName}_activity.json`;
  const outputPath = `test_integration/flows/${fileName}/${fileName}_generated.test.js`;
  const state = JSON.parse(fs.readFileSync(inputPath).toString());
  return { outputPath, state };
};

describe('generator.test', () => {
  describe('01_module_exports', () => {
    it('should match generated test code snapshot', () => {
      const filename = '01_module_exports';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('02_async_functions', () => {
    it('should match generated test code snapshot', () => {
      const filename = '02_async_functions';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('03_ecma_export', () => {
    it('should match generated test code snapshot', () => {
      const filename = '03_ecma_export';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('04_unserializeable', () => {
    it('should match generated test code snapshot', () => {
      const filename = '04_unserializeable';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('05_dependency_injection', () => {
    it('should match generated test code snapshot', () => {
      const filename = '05_dependency_injection';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('06_mocks', () => {
    it('should match generated test code snapshot', () => {
      const filename = '06_mocks';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('07_large_payload', () => {
    it('should match generated test code snapshot', () => {
      const filename = '07_large_payload';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('08_this', () => {
    it('should match generated test code snapshot', () => {
      const filename = '08_this';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('09_typescript_exports', () => {
    it('should match generated test code snapshot', () => {
      const filename = '09_typescript_exports';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('10_anon_export_default', () => {
    it('should match generated test code snapshot', () => {
      const filename = '10_anon_export_default';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
});
