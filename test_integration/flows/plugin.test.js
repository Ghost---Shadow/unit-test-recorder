const fs = require('fs');

const babel = require('@babel/core');
const parser = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');
const { toMatchFile } = require('jest-file-snapshot');
const { default: generate } = require('@babel/generator');

expect.extend({ toMatchFile });

const myPlugin = require('../../src/plugin');
const { parserPlugins, generatorOptions } = require('../../src/plugin/used-plugins');

const generatedInjectedCode = (inputPath) => {
  const inputCode = fs.readFileSync(inputPath, 'utf8');
  const ast = parser.parse(inputCode, {
    sourceType: 'module',
    plugins: parserPlugins,
  });

  traverse(ast, myPlugin(babel).visitor);
  const { code } = generate(ast, generatorOptions);
  return code;
};

const getInputAndOutputPath = (fileName) => {
  const inputPath = `test_integration/flows/${fileName}/${fileName}.js`;
  const outputPath = `test_integration/flows/${fileName}/${fileName}_injected.js`;

  return { inputPath, outputPath };
};

describe('plugin.test', () => {
  describe('01_module_exports', () => {
    it('should match snapshot', () => {
      const filename = '01_module_exports';
      const { inputPath, outputPath } = getInputAndOutputPath(filename);
      expect(generatedInjectedCode(inputPath, filename)).toMatchFile(outputPath);
    });
  });
});
