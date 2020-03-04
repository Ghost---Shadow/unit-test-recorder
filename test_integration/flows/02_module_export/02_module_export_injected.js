var { recorderWrapper } = require('../../../src/recorder');
const dum = (...p) =>
  recorderWrapper(
    'test_integration/flows/02_module_export/02_module_export.js',
    'dum',
    'a',
    true,
    a => 2 * a,
    ...p
  );

module.exports = dum;
