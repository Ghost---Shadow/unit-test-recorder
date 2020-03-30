const { recorderWrapper } = require('../../../src/recorder');
exports.default = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/13_anon_ts_export_default/13_anon_ts_export_default.js',
      name: 'defaultExport',
      paramIds: ['a', 'b'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: true,
      isAsync: false
    },
    (a, b) => a + b,
    ...p
  );
