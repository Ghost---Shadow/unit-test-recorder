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

const defaultPackagedArguments = {
  entryPoint: './index.js',
  maxTestsPerFunction: -1,
  debug: false,
  outputDir: null,
  testExt: 'test.js',
  sizeLimit: 500,
};

describe('generator.test', () => {
  describe('failure', () => {
    it('should match generated test code snapshot', () => {
      const testFiles = extractTestsFromState('{}');
      // Only one file per test
      expect(testFiles[0]).toMatchInlineSnapshot(
        {
          fileString: expect.any(String), // Error message
        },
        `
        Object {
          "externalData": Array [],
          "filePath": "0",
          "fileString": Any<String>,
        }
      `,
      );
    });
  });
  describe('01_module_exports', () => {
    it('should match generated test code snapshot', () => {
      const filename = '01_module_exports';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const maxTestsPerFunction = 2;
      const testFiles = extractTestsFromState(state, {
        ...defaultPackagedArguments,
        maxTestsPerFunction,
      });
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
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
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('16_exported_objects', () => {
    it('should match generated test code snapshot', () => {
      const filename = '16_exported_objects';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('17_param_mutation', () => {
    it('should match generated test code snapshot', () => {
      const filename = '17_param_mutation';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
  describe('18_record_stub_params', () => {
    it('should match generated test code snapshot', () => {
      const filename = '18_record_stub_params';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state, defaultPackagedArguments);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
      testFiles[0].externalData.forEach((ed) => {
        expect(ed.fileString).toMatchFile(ed.filePath);
      });
    });
  });
});
