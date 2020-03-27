const path = require('path');
const { argv } = require('yargs')
  .usage('Usage: $0 [entrypoint.js] [options]')
  .command('entrypoint', 'Entrypoint of your application')
  .demandCommand(1)
  .default('whitelist', './whitelist.json')
  .describe('whitelist', 'Specify the path to whitelist json')
  .alias('w', 'whitelist');
const { instrumentAllFiles } = require('./instrumentation');
const { generateAllTests } = require('./generation');

const entryPoint = argv._[0];

// Instrument all files
instrumentAllFiles(entryPoint);

// Generate the test cases
process.on('SIGINT', async () => {
  await generateAllTests();
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
