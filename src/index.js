#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const babel = require('@babel/core');
const { default: generate } = require('@babel/generator');
const parser = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');

const myPlugin = require('./plugin');
const { walk } = require('./util/walker');
const { parserPlugins, generatorOptions } = require('./plugin/used-plugins');

const inputDir = './';
const outputDir = './';
const sourceDir = inputDir;

const transformFile = (fileName) => {
  try {
    console.log('Transforming:', fileName);
    const inputCode = fs.readFileSync(fileName, 'utf8');
    const ast = parser.parse(inputCode, {
      sourceType: 'module',
      plugins: parserPlugins,
    });

    // Run the plugin
    traverse(ast, myPlugin(babel).visitor);
    const { code } = generate(ast, generatorOptions);

    const relativePath = path.relative(inputDir, fileName);
    const outputFilePath = path.join(outputDir, relativePath);
    mkdirp.sync(path.dirname(outputFilePath));
    fs.writeFileSync(outputFilePath, code);
  } catch (err) {
    console.error('Error for file:', fileName);
    console.error(err);
  }
};

const allFiles = walk(path.join(path.resolve(inputDir), sourceDir));

allFiles.forEach(fileName => transformFile(fileName));

// npm start ../input-directory ../output-directory
