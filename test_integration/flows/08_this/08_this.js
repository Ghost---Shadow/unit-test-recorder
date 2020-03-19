const newTarget = obj => new obj.InjectedPromise(resolve => resolve(42));

const sample = () => { };

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

const protoOverwriteHelper = foo => foo.fun2();

const protoOverwrite = () => {
  const foo = new Foo();
  return protoOverwriteHelper(foo);
};

module.exports = {
  newTarget, sample, protoOverwrite, protoOverwriteHelper,
};
