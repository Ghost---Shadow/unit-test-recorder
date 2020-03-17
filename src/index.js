#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const cp = require('child_process');
const { promisify } = require('util');
const babel = require('@babel/core');
const { default: generate } = require('@babel/generator');
const parser = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');

const myPlugin = require('./plugin');
const { walk } = require('./util/walker');
const { parserPlugins, generatorOptions } = require('./plugin/used-plugins');
const { RecorderManager } = require('./recorder');
const { extractTestsFromState } = require('./generator');
const { getTestFileNameForFile } = require('./util/misc');

const inputDir = './';
const outputDir = './';
const sourceDir = inputDir;

const writeFileAsync = promisify(fs.writeFile);

const transformFile = (fileName, whiteListedModules) => {
  try {
    console.log('Transforming:', fileName);
    const inputCode = fs.readFileSync(fileName, 'utf8');
    const ast = parser.parse(inputCode, {
      sourceType: 'module',
      plugins: parserPlugins,
    });

    // Run the plugin
    const importPath = path.resolve(path.join(__dirname, './recorder'));
    traverse(ast, myPlugin(babel).visitor, null, { fileName, importPath, whiteListedModules });
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

let whiteListedModules = { fs: true, axios: true };
if (fs.existsSync('whitelist.json')) {
  try {
    whiteListedModules = JSON.parse(fs.readFileSync('whitelist.json').toString());
    console.log('Found whitelist', whiteListedModules);
  } catch (e) {
    console.error('Error loading whitelist. Using default instead', whiteListedModules);
    console.error(e);
  }
} else {
  console.log('Recording mocks for these modules');
  console.log(whiteListedModules);
  console.log('Please create ./whitelist.json if you wish to modify the whitelist');
}

allFiles.forEach(fileName => transformFile(fileName, whiteListedModules));

if (fs.existsSync('activity.json')) {
  console.log('Found existing state');
  RecorderManager.recorderState = JSON.parse(fs.readFileSync('activity.json').toString());
}

console.log('Injection complete. Starting server...');
console.log('Press Ctrl + C to stop recording and dump the tests');

process.on('SIGINT', async () => {
  try {
    console.log('Using git to reset changes');
    cp.execSync('git reset --hard');
  } catch (e) {
    console.error(e);
  }
  console.log('Dumping activity to disk');
  const activityDumpPromise = writeFileAsync('activity.json', RecorderManager.getSerialized());
  const writePromises = extractTestsFromState(RecorderManager.recorderState)
    .map(testObj => writeFileAsync(getTestFileNameForFile(testObj.filePath), testObj.fileString));
  writePromises.push(activityDumpPromise);
  await Promise.all(writePromises);
  process.exit();
});


// setInterval(() => {
//   // No operation
//   // This is here to keep the process alive
// }, 1000);

const entryPoint = process.argv[2];
const resolvedEntrypoint = path.resolve(process.cwd(), entryPoint);
console.log(`Started ${resolvedEntrypoint}`);
// eslint-disable-next-line
require(resolvedEntrypoint);
