const cp = require('child_process');
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

  .boolean(['d']); // Debug

const { instrumentAllFiles } = require('./instrumentation');
const { generateAllTests } = require('./generation');

// Process and package arguments
const entryPoint = argv._[0];
const maxTestsPerFunction = parseInt(argv.maxTests, 10) || -1;
const debug = argv.d;
const { outputDir, testExt, sizeLimit } = argv;
const packagedArguments = {
  entryPoint,
  maxTestsPerFunction,
  debug,
  outputDir,
  testExt,
  sizeLimit,
};

// Instrument all files
instrumentAllFiles(packagedArguments);

process.on('SIGINT', async () => {
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
