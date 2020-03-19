const { recorderWrapper } = require('../../../src/recorder');
const newTarget = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/08_this/08_this.js',
      name: 'newTarget',
      paramIds: 'obj',
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    obj => new obj.InjectedPromise(resolve => resolve(42)),
    ...p
  );

const sample = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/08_this/08_this.js',
      name: 'sample',
      paramIds: '',
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    () => {},
    ...p
  );

function Foo() {
  this.bar = 1;
}

Foo.prototype.fun1 = function fun1() {
  this.bar += 1;
  return this.bar;
};

Foo.prototype.fun2 = function fun2() {
  return this.fun1();
};

const protoOverwriteHelper = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/08_this/08_this.js',
      name: 'protoOverwriteHelper',
      paramIds: 'foo',
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    foo => foo.fun2(),
    ...p
  );

const protoOverwrite = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/08_this/08_this.js',
      name: 'protoOverwrite',
      paramIds: '',
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    () => {
      const foo = new Foo();
      return protoOverwriteHelper(foo);
    },
    ...p
  );

module.exports = {
  newTarget,
  sample,
  protoOverwrite,
  protoOverwriteHelper
};
