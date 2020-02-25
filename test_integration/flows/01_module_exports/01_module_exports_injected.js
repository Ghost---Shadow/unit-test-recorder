var { recorderWrapper } = require("../../../src/recorder");const foo = (a, b) => a + b;

function bar(a, b) {
  return a - b;
}

const SOME_CONSTANT = 42;

module.exports = { foo: (...p) => recorderWrapper("foo", foo, "a,b", ...p),

  SOME_CONSTANT, bar: (...p) => recorderWrapper("bar", bar, "a,b", ...p) };