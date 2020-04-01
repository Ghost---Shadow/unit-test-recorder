const path = require('path');
const { argv } = require('yargs')
  .usage('Usage: $0 [entrypoint.js] [options]')
  .command('entrypoint', 'Entrypoint of your application')
  .demandCommand(1)

  .default('whitelist', './whitelist.json')
  .describe('whitelist', 'Specify the path to whitelist json')
  .alias('w', 'whitelist')

  .default('max-tests', '-1')
  .describe('max-tests', 'Maximum number of generated tests per function. Type -1 for infinity')
  .alias('t', 'max-tests')

  .default('output-dir', './')
  .describe('output-dir', 'The directory in which the tests would be written to.')
  .alias('o', 'output-dir')

  .boolean(['d']); // Debug

const { instrumentAllFiles } = require('./instrumentation');
const { generateAllTests } = require('./generation');

const entryPoint = argv._[0];
const maxTestsPerFunction = parseInt(argv.maxTests, 10) || -1;
const debug = argv.d;
const { outputDir } = argv;

// Instrument all files
instrumentAllFiles(entryPoint);

// Generate the test cases
process.on('SIGINT', async () => {
  if (debug) { process.exit(0); }
  await generateAllTests(maxTestsPerFunction, outputDir);
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
