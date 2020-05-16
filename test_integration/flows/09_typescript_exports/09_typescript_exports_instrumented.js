const { recordFileMeta } = require('../../../src/recorder');
const { recorderWrapper } = require('../../../src/recorder');
Object.defineProperty(exports, '__esModule', { value: true });

const exportTest1 = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/09_typescript_exports/09_typescript_exports.js',
      name: 'exportTest1',
      paramIds: ['a'],
      injectionWhitelist: ['query'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
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
      injectionWhitelist: ['query'],
      isDefault: false,
      isEcmaDefault: true,
      isAsync: false,
      isObject: false
    },
    a => b => [a, b],
    ...p
  );

exports.default = exportTest2;

exports.exportTest3 = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/09_typescript_exports/09_typescript_exports.js',
      name: 'exportTest3',
      paramIds: ['a'],
      injectionWhitelist: ['query'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    a => 2 * a,
    ...p
  );
exports.fetchFromDb = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/09_typescript_exports/09_typescript_exports.js',
      name: 'fetchFromDb',
      paramIds: ['client'],
      injectionWhitelist: ['query'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    client =>
      client.testIntegrationFlows09TypescriptExports09TypescriptExportsJsQuery(),
    ...p
  );
recordFileMeta({
  path: 'test_integration/flows/09_typescript_exports/09_typescript_exports.js',
  mocks: []
});
