var { recorderWrapper } = require("../../../src/recorder");const foo = (a, b) => a + b;

function bar(a, b) {
  return a - b;
}

const SOME_CONSTANT = 42;

module.exports = { foo: (...p) => recorderWrapper("foo", foo, ...p),

  SOME_CONSTANT, bar: (...p) => recorderWrapper("bar", bar, ...p) };