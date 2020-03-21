const { recorderWrapper } = require('../../../src/recorder');
Object.defineProperty(exports, '__esModule', { value: true });

const exportTest = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/09_typescript_exports/09_typescript_exports.js',
      name: 'exportTest',
      paramIds: ['a'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    a => a,
    ...p
  );
exports.exportTest = exportTest;
