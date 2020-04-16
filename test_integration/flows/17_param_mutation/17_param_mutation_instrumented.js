const { recorderWrapper } = require('../../../src/recorder');
const fun = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/17_param_mutation/17_param_mutation.js',
      name: 'fun',
      paramIds: ['a'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    a => {
      a[0] += 1;
      return a;
    },
    ...p
  );

module.exports = { fun };
