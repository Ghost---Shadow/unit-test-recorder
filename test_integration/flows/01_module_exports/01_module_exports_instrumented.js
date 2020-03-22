const { recorderWrapper } = require('../../../src/recorder');
const foo1 = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/01_module_exports/01_module_exports.js',
      name: 'foo',
      paramIds: ['a', 'b'],
      injectionWhitelist: [],
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
      injectionWhitelist: [],
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

const specialParams = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/01_module_exports/01_module_exports.js',
      name: 'specialParams',
      paramIds: ['a', '_obj', 'd'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    (a, { b, c }, d = 1) => a + b + c + d,
    ...p
  );
const specialParams2 = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/01_module_exports/01_module_exports.js',
      name: 'specialParams2',
      paramIds: ['a', '_obj2', 'd'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    function specialParams2(a, { b, c }, d = 1) {
      return a + b + c + d;
    },
    ...p
  );

module.exports = {
  foo: foo1,
  SOME_CONSTANT,
  bar,
  specialParams,
  specialParams2
};
