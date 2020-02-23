const { create } = require('babel-test');
const path = require('path');
const { toMatchFile } = require('jest-file-snapshot');

const plugin = require('../src/plugin');
const { parserPlugins, generatorOptions } = require('../src/plugin/used-plugins');

expect.extend({ toMatchFile });
const { fixtures } = create({
  plugins: [plugin],
  parserOpts: {
    plugins: parserPlugins,
  },
  generatorOpts: generatorOptions,
});

fixtures('unit-test-recorder', path.join(__dirname, 'fixtures'), {
  beforeEach() {
    // TODO
  },
});
