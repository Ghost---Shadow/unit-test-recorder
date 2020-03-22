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
      isAsync: false
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
      isAsync: false
    },
    function base2(param1) {
      return function base3(param2) {
        return param1.someFun() + param2.someOtherFun();
      };
    },
    ...p
  );

const obj = {
  fun(param) {
    return param.anotherFun();
  },
  fun2: param => param.anotherFun()
};

export const validFun = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/11_higher_order/11_higher_order.js',
      name: 'validFun',
      paramIds: ['param'],
      injectionWhitelist: ['someFun'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    param => param.testIntegrationFlows11HigherOrder11HigherOrderJsSomeFun(),
    ...p
  );

export { base, base2, obj };
