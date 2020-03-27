// These are not yet implemented
// This test case is here to just make sure
// that these type of code doesnt cause crash

const base = param1 => param2 => param1.someFun() + param2.someOtherFun();

function base2(param1) {
  return function base3(param2) {
    return param1.someFun() + param2.someOtherFun();
  };
}

const obj = {
  fun(param) {
    return param.anotherFun();
  },
  fun2: param => param.anotherFun(),
};

const validFun = param => param.someFun();

const rObj = { foo: f => p => f(p) };
const secondary1 = rObj.foo(p => p.someFun());
// eslint-disable-next-line
const secondary2 = rObj.foo(function f(p){
  return p.someFun();
});

module.exports = {
  base, base2, obj, rObj, secondary1, secondary2, validFun,
};
