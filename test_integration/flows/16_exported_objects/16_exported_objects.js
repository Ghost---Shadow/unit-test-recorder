const obj1 = {
  foo1(a, b) {
    return a + b;
  },
  foo2() { },
  baz: 42,
};

let obj2 = {};
obj2 = {
  bar: (a, b) => a - b,
  deep: { fun: a => a },
  higher: a => b => a * b,
};

const obj3 = { poo: 1 };

const empty = {};

module.exports = {
  obj1, obj2, obj3, empty,
};
