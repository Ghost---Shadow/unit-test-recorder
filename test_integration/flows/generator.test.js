const fs = require('fs');

// Suppress console
console.log = () => null;
console.error = () => null;

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
  describe('failure', () => {
    it('should match generated test code snapshot', () => {
      const testFiles = extractTestsFromState('{}');
      // Only one file per test
      expect(testFiles[0]).toMatchInlineSnapshot(`
        Object {
          "externalData": Array [],
          "filePath": "0",
          "fileString": "'TypeError: Cannot convert undefined or null to object
            at Function.keys (<anonymous>)
            at generateTestsFromActivity (/mnt/c/Users/windows/Desktop/unit-test-recorder/src/generator/index.js:78:6)
            at map (/mnt/c/Users/windows/Desktop/unit-test-recorder/src/generator/index.js:128:11)
            at Array.map (<anonymous>)
            at extractTestsFromState (/mnt/c/Users/windows/Desktop/unit-test-recorder/src/generator/index.js:121:4)
            at Object.it (/mnt/c/Users/windows/Desktop/unit-test-recorder/test_integration/flows/generator.test.js:23:25)
            at Object.asyncJestTest (/mnt/c/Users/windows/Desktop/unit-test-recorder/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:102:37)
            at resolve (/mnt/c/Users/windows/Desktop/unit-test-recorder/node_modules/jest-jasmine2/build/queueRunner.js:43:12)
            at new Promise (<anonymous>)
            at mapper (/mnt/c/Users/windows/Desktop/unit-test-recorder/node_modules/jest-jasmine2/build/queueRunner.js:26:19)
            at promise.then (/mnt/c/Users/windows/Desktop/unit-test-recorder/node_modules/jest-jasmine2/build/queueRunner.js:73:41)
            at process._tickCallback (internal/process/next_tick.js:68:7)'",
        }
      `);
    });
  });
  describe('01_module_exports', () => {
    it('should match generated test code snapshot', () => {
      const filename = '01_module_exports';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const maxTestsPerFunction = 2;
      const testFiles = extractTestsFromState(state, maxTestsPerFunction);
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
  describe('11_higher_order', () => {
    it('should match generated test code snapshot', () => {
      const filename = '11_higher_order';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('12_unwanted_injections', () => {
    it('should match generated test code snapshot', () => {
      const filename = '12_unwanted_injections';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('13_anon_ts_export_default', () => {
    it('should match generated test code snapshot', () => {
      const filename = '13_anon_ts_export_default';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('14_anon_module_exports_default', () => {
    it('should match generated test code snapshot', () => {
      const filename = '14_anon_module_exports_default';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('15_named_module_exports_default', () => {
    it('should match generated test code snapshot', () => {
      const filename = '15_named_module_exports_default';
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
