const { recorderWrapper } = require('../../../src/recorder');
const obj1 = {
  async foo1(a, b) {
    const res = await a.testIntegrationFlows16ExportedObjects16ExportedObjectsJsSomeFun();
    return res + b;
  },
  foo2() {},
  baz: 42
};
obj1.ORIGINAL_foo2 = obj1.foo2;
obj1.foo2 = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/16_exported_objects/16_exported_objects.js',
      name: 'obj1.foo2',
      paramIds: [],
      injectionWhitelist: ['someFun', 'anotherFun'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: true
    },
    obj1.ORIGINAL_foo2,
    ...p
  );
obj1.ORIGINAL_foo1 = obj1.foo1;
obj1.foo1 = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/16_exported_objects/16_exported_objects.js',
      name: 'obj1.foo1',
      paramIds: ['a', 'b'],
      injectionWhitelist: ['someFun', 'anotherFun'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: true,
      isObject: true
    },
    obj1.ORIGINAL_foo1,
    ...p
  );

let obj2 = {};
obj2 = {
  bar: async (a, b) => a - b,
  deep: {
    fun: async a =>
      a.testIntegrationFlows16ExportedObjects16ExportedObjectsJsAnotherFun()
  },
  higher: a => b => a * b
};
obj2.ORIGINAL_higher = obj2.higher;
obj2.higher = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/16_exported_objects/16_exported_objects.js',
      name: 'obj2.higher',
      paramIds: ['a'],
      injectionWhitelist: ['someFun', 'anotherFun'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: true
    },
    obj2.ORIGINAL_higher,
    ...p
  );
obj2.deep.ORIGINAL_fun = obj2.deep.fun;
obj2.deep.fun = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/16_exported_objects/16_exported_objects.js',
      name: 'obj2.deep.fun',
      paramIds: ['a'],
      injectionWhitelist: ['someFun', 'anotherFun'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: true,
      isObject: true
    },
    obj2.deep.ORIGINAL_fun,
    ...p
  );
obj2.ORIGINAL_bar = obj2.bar;
obj2.bar = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/16_exported_objects/16_exported_objects.js',
      name: 'obj2.bar',
      paramIds: ['a', 'b'],
      injectionWhitelist: ['someFun', 'anotherFun'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: true,
      isObject: true
    },
    obj2.ORIGINAL_bar,
    ...p
  );

const obj3 = { poo: 1 };

const empty = {};

module.exports = {
  obj1,
  obj2,
  obj3,
  empty
};
