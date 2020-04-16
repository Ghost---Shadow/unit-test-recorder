const { mockRecorderWrapper } = require('../../../src/recorder');
const { recorderWrapper } = require('../../../src/recorder');
const aux = require('./auxilary');
aux.testIntegrationFlows18RecordStubParams18RecordStubParamsJsFun = (...p) =>
  mockRecorderWrapper(
    {
      path:
        'test_integration/flows/18_record_stub_params/18_record_stub_params.js',
      moduleName: './auxilary',
      name: 'fun'
    },
    aux.fun,
    ...p
  );

const fun = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/18_record_stub_params/18_record_stub_params.js',
      name: 'fun',
      paramIds: ['obj'],
      injectionWhitelist: ['fun'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    obj =>
      obj.testIntegrationFlows18RecordStubParams18RecordStubParamsJsFun(1) +
      aux.testIntegrationFlows18RecordStubParams18RecordStubParamsJsFun(2),
    ...p
  );

module.exports = { fun };
