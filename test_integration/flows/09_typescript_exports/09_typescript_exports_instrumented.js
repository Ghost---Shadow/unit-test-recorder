const { recorderWrapper } = require('../../../src/recorder');
Object.defineProperty(exports, '__esModule', { value: true });

const exportTest1 = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/09_typescript_exports/09_typescript_exports.js',
      name: 'exportTest1',
      paramIds: ['a'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    a => a,
    ...p
  );
exports.exportTest1 = exportTest1;

const exportTest2 = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/09_typescript_exports/09_typescript_exports.js',
      name: 'exportTest2',
      paramIds: ['a'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: true,
      isAsync: false
    },
    a => b => [a, b],
    ...p
  );

exports.default = exportTest2;
