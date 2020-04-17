const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const babel = require('@babel/core');
const { default: generate } = require('@babel/generator');
const parser = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');
const prettier = require('prettier');

const myPlugin = require('../plugin');
const { walk, filterFiles } = require('../util/walker');
const { parserPlugins, generatorOptions } = require('../plugin/used-plugins');
const { RecorderManager } = require('../recorder');

// TODO: Make async
const transformFile = (fileName, whiteListedModules) => {
  const inputDir = './'; // TODO
  const outputDir = './'; // TODO
  try {
    console.log('Transforming:', fileName);
    const inputCode = fs.readFileSync(fileName, 'utf8');
    const ast = parser.parse(inputCode, {
      sourceType: 'module',
      plugins: parserPlugins,
    });

    // Run the plugin
    const importPath = path.resolve(path.join(__dirname, '../recorder'));
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

const instrumentAllFiles = (packagedArguments) => {
  const { entryPoint } = packagedArguments;
  const sourceDir = path.dirname(entryPoint);
  const allFiles = walk(sourceDir);
  const filteredFiles = filterFiles(packagedArguments, allFiles);

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

  filteredFiles.forEach(fileName => transformFile(fileName, whiteListedModules));

  // Load existing state if present
  RecorderManager.loadFromDisk();

  console.log('Injection complete. Starting server...');
  console.log('Press Ctrl + C to stop recording and dump the tests');
};

module.exports = { instrumentAllFiles };
