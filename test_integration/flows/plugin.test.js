const fs = require('fs');

const babel = require('@babel/core');
const parser = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');
const { toMatchFile } = require('jest-file-snapshot');
const { default: generate } = require('@babel/generator');
const prettier = require('prettier');

expect.extend({ toMatchFile });

const myPlugin = require('../../src/plugin');
const { parserPlugins, generatorOptions } = require('../../src/plugin/used-plugins');
const { extractTestsFromState } = require('../../src/generator');

const generatedInjectedCode = (inputPath) => {
  const inputCode = fs.readFileSync(inputPath, 'utf8');
  const ast = parser.parse(inputCode, {
    sourceType: 'module',
    plugins: parserPlugins,
  });
  const state = { fileName: inputPath, importPath: '../../../src/recorder' };
  traverse(ast, myPlugin(babel).visitor, null, state);
  const { code } = generate(ast, generatorOptions);
  return prettier.format(code, {
    singleQuote: true,
    parser: 'babel',
  });
};

const getInputAndOutputPathForInjected = (fileName) => {
  const inputPath = `test_integration/flows/${fileName}/${fileName}.js`;
  const outputPath = `test_integration/flows/${fileName}/${fileName}_injected.js`;

  return { inputPath, outputPath };
};

const getInputAndOutputPathForTests = (fileName) => {
  const inputPath = `test_integration/flows/${fileName}/${fileName}_activity.json`;
  const outputPath = `test_integration/flows/${fileName}/${fileName}_generated.test.js`;
  const state = JSON.parse(fs.readFileSync(inputPath).toString());
  return { outputPath, state };
};

describe('plugin.test', () => {
  describe('01_module_exports', () => {
    it('should match injected code snapshot', () => {
      const filename = '01_module_exports';
      const { inputPath, outputPath } = getInputAndOutputPathForInjected(filename);
      expect(generatedInjectedCode(inputPath, filename)).toMatchFile(outputPath);
    });
    it('should match generated test code snapshot', () => {
      const filename = '01_module_exports';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
    });
  });
  describe('02_module_export', () => {
    it('should match injected code snapshot', () => {
      const filename = '02_module_export';
      const { inputPath, outputPath } = getInputAndOutputPathForInjected(filename);
      expect(generatedInjectedCode(inputPath, filename)).toMatchFile(outputPath);
    });
    it('should match generated test code snapshot', () => {
      const filename = '02_module_export';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
    });
  });
  describe('03_ecma_export', () => {
    it('should match injected code snapshot', () => {
      const filename = '03_ecma_export';
      const { inputPath, outputPath } = getInputAndOutputPathForInjected(filename);
      expect(generatedInjectedCode(inputPath, filename)).toMatchFile(outputPath);
    });
    it('should match generated test code snapshot', () => {
      const filename = '03_ecma_export';
      const { outputPath, state } = getInputAndOutputPathForTests(filename);
      const testFiles = extractTestsFromState(state);
      // Only one file per test
      expect(testFiles[0].fileString).toMatchFile(outputPath);
    });
  });
});
