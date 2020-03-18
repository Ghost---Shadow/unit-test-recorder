const { recorderWrapper } = require('../../../src/recorder');
const newTarget = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/08_this/08_this.js',
      name: 'newTarget',
      paramIds: 'obj',
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    obj => new obj.InjectedPromise(resolve => resolve(42)),
    ...p
  );

const sample = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/08_this/08_this.js',
      name: 'sample',
      paramIds: '',
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    () => {},
    ...p
  );

module.exports = { newTarget, sample };
