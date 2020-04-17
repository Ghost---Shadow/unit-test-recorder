const { recordFileMeta } = require('../../../src/recorder');
const { mockRecorderWrapper } = require('../../../src/recorder');
const { recorderWrapper } = require('../../../src/recorder');
const fileSystem = require('fs');
fileSystem.testIntegrationFlows06Mocks06MocksJsReadFileSync = (...p) =>
  mockRecorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      moduleName: 'fs',
      name: 'readFileSync'
    },
    fileSystem.readFileSync,
    ...p
  );
const { foo1, foo2: foo3, foo4, foo5, higherOrder } = require('./auxilary1');
const testIntegrationFlows06Mocks06MocksJsHigherOrder = (...p) =>
  mockRecorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      moduleName: './auxilary1',
      name: 'higherOrder'
    },
    higherOrder,
    ...p
  );
const testIntegrationFlows06Mocks06MocksJsFoo5 = (...p) =>
  mockRecorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      moduleName: './auxilary1',
      name: 'foo5'
    },
    foo5,
    ...p
  );
const testIntegrationFlows06Mocks06MocksJsFoo4 = (...p) =>
  mockRecorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      moduleName: './auxilary1',
      name: 'foo4'
    },
    foo4,
    ...p
  );
const testIntegrationFlows06Mocks06MocksJsFoo3 = (...p) =>
  mockRecorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      moduleName: './auxilary1',
      name: 'foo2'
    },
    foo3,
    ...p
  );
const testIntegrationFlows06Mocks06MocksJsFoo1 = (...p) =>
  mockRecorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      moduleName: './auxilary1',
      name: 'foo1'
    },
    foo1,
    ...p
  );

const getTodo = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      name: 'getTodo',
      paramIds: [],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    () => {
      fileSystem
        .testIntegrationFlows06Mocks06MocksJsReadFileSync(
          'test_integration/flows/06_mocks/response.json',
          'utf8'
        )
        .toString();
      const a = JSON.parse(
        fileSystem
          .testIntegrationFlows06Mocks06MocksJsReadFileSync(
            'test_integration/flows/06_mocks/response.json',
            'utf8'
          )
          .toString()
      );
      const b = testIntegrationFlows06Mocks06MocksJsFoo4();
      return a.concat(b);
    },
    ...p
  );

const localMocksTest = async (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      name: 'localMocksTest',
      paramIds: [],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: true,
      isObject: false
    },
    async () => {
      const result =
        testIntegrationFlows06Mocks06MocksJsFoo1() +
        testIntegrationFlows06Mocks06MocksJsFoo1() +
        (await testIntegrationFlows06Mocks06MocksJsFoo3());
      return result;
    },
    ...p
  );

// TODO: Not implemented
const datesTest = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      name: 'datesTest',
      paramIds: [],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    () => testIntegrationFlows06Mocks06MocksJsFoo5(),
    ...p
  );

// TODO: Not implemented
const higherOrderTest = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      name: 'higherOrderTest',
      paramIds: [],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    () => {
      const gen = testIntegrationFlows06Mocks06MocksJsHigherOrder(1);
      return gen(2);
    },
    ...p
  );

module.exports = {
  getTodo,
  localMocksTest,
  datesTest,
  higherOrderTest
};
recordFileMeta({
  path: 'test_integration/flows/06_mocks/06_mocks.js',
  mocks: ['fs', './auxilary1']
});
