const foo1 = (a, b) => a + b;

function bar(a, b) {
  const c = a - b;
  return c;
}

const SOME_CONSTANT = 42;

module.exports = {
  foo: foo1,
  SOME_CONSTANT,
  bar,
};
