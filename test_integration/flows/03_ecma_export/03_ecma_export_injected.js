var { recorderWrapper } = require('../../../src/recorder');
export const ecma1 = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/03_ecma_export/03_ecma_export.js',
      name: 'ecma1',
      paramIds: 'a,b',
      isDefault: false,
      isEcmaDefault: false
    },
    (a, b) => a + b,
    ...p
  );

const ecma2 = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/03_ecma_export/03_ecma_export.js',
      name: 'ecma2',
      paramIds: 'b',
      isDefault: true,
      isEcmaDefault: true
    },
    b => b * 3,
    ...p
  );

export default ecma2;
