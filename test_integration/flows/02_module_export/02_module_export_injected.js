var { recorderWrapper } = require('../../../src/recorder');
const dum = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/02_module_export/02_module_export.js',
      name: 'dum',
      paramIds: 'a',
      isDefault: true,
      isEcmaDefault: false
    },
    a => 2 * a,
    ...p
  );

module.exports = dum;
