const { recordFileMeta } = require('../../../src/recorder');
const { recorderWrapper } = require('../../../src/recorder');
export const ecma1 = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/03_ecma_export/03_ecma_export.js',
      name: 'ecma1',
      paramIds: ['a', 'b'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    (a, b) => a + b,
    ...p
  );

const ecma2 = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/03_ecma_export/03_ecma_export.js',
      name: 'ecma2',
      paramIds: ['b'],
      injectionWhitelist: [],
      isDefault: true,
      isEcmaDefault: true,
      isAsync: false,
      isObject: false
    },
    b => b * 3,
    ...p
  );

const ecma33 = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/03_ecma_export/03_ecma_export.js',
      name: 'ecma3',
      paramIds: ['a'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    a => a / 2,
    ...p
  );
const ecma4 = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/03_ecma_export/03_ecma_export.js',
      name: 'ecma4',
      paramIds: ['a'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    a => a / 4,
    ...p
  );

export { ecma33 as ecma3, ecma4 };

export default ecma2;
recordFileMeta({
  path: 'test_integration/flows/03_ecma_export/03_ecma_export.js',
  mocks: []
});
