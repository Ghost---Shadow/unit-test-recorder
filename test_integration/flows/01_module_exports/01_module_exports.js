const foo1 = (a, b) => a + b;

function bar(a, b) {
  const c = a - b;
  return c;
}

const SOME_CONSTANT = 42;

const specialParams = (a, { b, c }, d = 1) => a + b + c + d;

function specialParams2(a, { b, c }, d = 1) {
  return a + b + c + d;
}

module.exports = {
  foo: foo1,
  SOME_CONSTANT,
  bar,
  specialParams,
  specialParams2,
};
