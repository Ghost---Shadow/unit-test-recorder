const { recorderWrapper } = require('../../../src/recorder'); // These are not yet implemented
// This test case is here to just make sure
// that these type of code doesnt cause crash

const base = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/11_higher_order/11_higher_order.js',
      name: 'base',
      paramIds: ['param1'],
      injectionWhitelist: ['someFun'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    param1 => param2 => param1.someFun() + param2.someOtherFun(),
    ...p
  );
const base2 = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/11_higher_order/11_higher_order.js',
      name: 'base2',
      paramIds: ['param1'],
      injectionWhitelist: ['someFun'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    function base2(param1) {
      return function base3(param2) {
        return param1.someFun() + param2.someOtherFun();
      };
    },
    ...p
  );

const validFun = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/11_higher_order/11_higher_order.js',
      name: 'validFun',
      paramIds: ['param'],
      injectionWhitelist: ['someFun'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    param => param.testIntegrationFlows11HigherOrder11HigherOrderJsSomeFun(),
    ...p
  );

const rObj = { foo: f => p => f(p) };
const _foo = rObj.foo;
rObj.foo = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/11_higher_order/11_higher_order.js',
      name: 'rObj.foo',
      paramIds: ['f'],
      injectionWhitelist: ['someFun'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: true
    },
    _foo,
    ...p
  );
const secondary1 = rObj.foo(p => p.someFun());
// eslint-disable-next-line
const secondary2 = rObj.foo(function f(p) {
  return p.someFun();
});

module.exports = {
  base,
  base2,
  rObj,
  secondary1,
  secondary2,
  validFun
};
