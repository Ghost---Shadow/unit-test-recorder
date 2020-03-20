const { recorderWrapper } = require('../../../src/recorder');
const foo = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/01_module_exports/01_module_exports.js',
      name: 'foo',
      paramIds: ['a', 'b'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    (a, b) => a + b,
    ...p
  );
const bar = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/01_module_exports/01_module_exports.js',
      name: 'bar',
      paramIds: ['a', 'b'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    function bar(a, b) {
      const c = a - b;
      return c;
    },
    ...p
  );

const SOME_CONSTANT = 42;

module.exports = {
  foo,
  SOME_CONSTANT,
  bar
};
