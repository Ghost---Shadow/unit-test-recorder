const obj1 = {
  async foo1(a, b) {
    const res = await a.someFun();
    return res + b;
  },
  foo2() { },
  baz: 42,
};

let obj2 = {};
obj2 = {
  bar: async (a, b) => a - b,
  deep: { fun: async a => a.anotherFun() },
  higher: a => b => a * b,
};

const largeObj = {
  largeFun: () => [...Array(1000).keys()],
};

const obj3 = { poo: 1 };

const empty = {};

module.exports = {
  obj1, obj2, obj3, empty, largeObj,
};
