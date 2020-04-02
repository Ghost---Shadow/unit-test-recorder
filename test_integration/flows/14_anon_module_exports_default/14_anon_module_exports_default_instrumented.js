const { recorderWrapper } = require('../../../src/recorder');
module.exports = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/14_anon_module_exports_default/14_anon_module_exports_default.js',
      name: 'defaultExport',
      paramIds: ['a'],
      injectionWhitelist: [],
      isDefault: true,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    a => a,
    ...p
  );
