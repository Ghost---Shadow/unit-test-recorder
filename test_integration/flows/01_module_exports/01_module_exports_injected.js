var { recorderWrapper } = require("../../../src/recorder");const foo = (a, b) => a + b;

function bar(a, b) {
  return a - b;
}

const SOME_CONSTANT = 42;

module.exports = { foo: (...p) => recorderWrapper("test_integration/flows/01_module_exports/01_module_exports.js", "foo", foo, "a,b", false, ...p),

  SOME_CONSTANT, bar: (...p) => recorderWrapper("test_integration/flows/01_module_exports/01_module_exports.js", "bar", bar, "a,b", false, ...p) };