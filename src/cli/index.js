const cp = require('child_process');
const readline = require('readline');
const path = require('path');
const { argv } = require('yargs')
  .usage('Usage: $0 [entrypoint.js] [options]')
  .command('entrypoint', 'Entrypoint of your application')
  .demandCommand(1)

  .default('whitelist', './whitelist.json')
  .describe('whitelist', 'Specify the path to whitelist json')
  .alias('w', 'whitelist')

  .default('max-tests', '5')
  .describe('max-tests', 'Maximum number of generated tests per function. Type -1 for infinity')
  .alias('t', 'max-tests')

  .default('output-dir', null)
  .describe('output-dir', 'The directory in which the tests would be written to.')
  .alias('o', 'output-dir')

  .default('test-ext', 'test.js')
  .describe('test-ext', 'Extension for test files (spec.js/test.ts)')

  .default('size-limit', 500)
  .describe('size-limit', 'Objects larger than this limit will be moved to a different file')

  .default('except', [])
  .describe('except', 'Dont run on these files (relative path, comma separated, supports RegExp)')

  .default('only', [])
  .describe('only', 'Run only on these files (relative path, comma separated, supports RegExp)')

  .boolean('record-stub-params')
  .describe('record-stub-params', 'Record the arguments passed as parameters to stubs (Debugging only)')

  .boolean(['d']); // Debug

const { instrumentAllFiles } = require('./instrumentation');
const { generateAllTests } = require('./generation');

// Process and package arguments
const entryPoint = argv._[0];
const maxTestsPerFunction = parseInt(argv.maxTests, 10) || -1;
const debug = argv.d;
const {
  outputDir, testExt, sizeLimit, recordStubParams,
} = argv;
const exceptFiles = typeof argv.except === 'string' ? argv.except.split(',') : [];
const onlyFiles = typeof argv.only === 'string' ? argv.only.split(',') : [];
const packagedArguments = {
  entryPoint,
  maxTestsPerFunction,
  debug,
  outputDir,
  testExt,
  sizeLimit,
  exceptFiles,
  onlyFiles,
  recordStubParams,
};

// Set the environment variable flag so that recorder can pick it up
process.env.UTR_RECORD_STUB_PARAMS = !!recordStubParams;

// Instrument all files
instrumentAllFiles(packagedArguments);

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const shutdown = async () => {
  // Dont reset or generate tests if debug mode
  if (debug) { process.exit(0); }
  // Undo all the instrumentation
  try {
    console.log('Using git to reset changes');
    cp.execSync('git reset --hard');
  } catch (e) {
    console.error(e);
  }
  // Generate the test cases
  await generateAllTests(packagedArguments);
};

process.stdin.on('keypress', async (str, key) => {
  const isQuiting = (key.ctrl && key.name === 'c') || key.name === 'q';
  if (isQuiting) {
    await shutdown();
  }
});

process.on('SIGINT', async () => {
  await shutdown();
});

// setInterval(() => {
//   // No operation
//   // This is here to keep the process alive
// }, 1000);

// Start the user's server
const resolvedEntrypoint = path.isAbsolute(entryPoint)
  ? entryPoint
  : path.resolve(process.cwd(), entryPoint);

console.log(`Starting ${resolvedEntrypoint}`);
// eslint-disable-next-line
require(resolvedEntrypoint);
