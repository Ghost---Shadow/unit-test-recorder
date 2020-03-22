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

export const validFun = param => param.someFun();

export { base, base2, obj };
