const { recorderWrapper } = require('../../../src/recorder');
export default (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/10_anon_export_default/10_anon_export_default.js',
      name: 'defaultExport',
      paramIds: ['a', 'b'],
      injectionWhitelist: [],
      isDefault: true,
      isEcmaDefault: true,
      isAsync: false,
      isObject: false
    },
    (a, b) => a + b,
    ...p
  );
