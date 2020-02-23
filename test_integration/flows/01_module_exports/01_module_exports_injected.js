var { recorderWrapper } = require("../../../src/recorder/recorder");const foo = (a, b) => a + b;
const bar = (a, b) => a - b;

module.exports = { foo: (...p) => recorderWrapper("foo", foo, ...p), bar: (...p) => recorderWrapper("bar", bar, ...p) };