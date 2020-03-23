const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const cp = require('child_process');
const { promisify } = require('util');
const babel = require('@babel/core');
const { default: generate } = require('@babel/generator');
const parser = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');
const prettier = require('prettier');

const myPlugin = require('./plugin');
const { walk } = require('./util/walker');
const { parserPlugins, generatorOptions } = require('./plugin/used-plugins');
const { RecorderManager } = require('./recorder');
const { extractTestsFromState } = require('./generator');
const { getTestFileNameForFile } = require('./util/misc');

const entryPoint = process.argv[2];

if (!entryPoint) {
  console.error('Usage: unit-test-recorder ./<entrypoint>.js');
  process.exit(1);
}

const resolvedEntrypoint = path.isAbsolute(entryPoint)
  ? entryPoint
  : path.resolve(process.cwd(), entryPoint);

const inputDir = './'; // TODO
const outputDir = './'; // TODO
const sourceDir = path.dirname(entryPoint);

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

// TODO: Make async
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
    const formattedCode = prettier.format(code, {
      singleQuote: true,
      parser: 'babel',
    });

    const relativePath = path.relative(inputDir, fileName);
    const outputFilePath = path.join(outputDir, relativePath);

    mkdirp.sync(path.dirname(outputFilePath));
    fs.writeFileSync(outputFilePath, formattedCode);
  } catch (err) {
    console.error('Error for file:', fileName);
    console.error(err);
  }
};

const allFiles = walk(sourceDir);

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
  try {
    console.log('Dumping activity to disk');
    await writeFileAsync('activity.json', RecorderManager.getSerialized());
    const nonCircularState = await readFileAsync('activity.json');
    const newState = JSON.parse(nonCircularState.toString());
    console.log('Generating test cases');
    const testData = extractTestsFromState(newState);
    const writePromises = testData
      .map(async (testObj) => {
        console.log('Writing test for: ', testObj.filePath);
        const testFileName = getTestFileNameForFile(testObj.filePath);
        const testFilePromise = writeFileAsync(testFileName, testObj.fileString);
        const externalDataPromises = testObj.externalData.map((ed) => {
          console.log('Creating dir:', path.dirname(ed.filePath));
          console.log('Dumping: ', ed.filePath);
          mkdirp.sync(path.dirname(ed.filePath)); // TODO: Make async
          return writeFileAsync(ed.filePath, ed.fileString);
        });
        return Promise.all([testFilePromise, ...externalDataPromises]);
      });
    await Promise.all(writePromises);
    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});


// setInterval(() => {
//   // No operation
//   // This is here to keep the process alive
// }, 1000);

console.log(`Starting ${resolvedEntrypoint}`);
// eslint-disable-next-line
require(resolvedEntrypoint);
