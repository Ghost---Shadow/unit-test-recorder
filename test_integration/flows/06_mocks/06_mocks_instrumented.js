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
const { foo1, foo2: foo3, foo4 } = require('./auxilary1');
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
      isAsync: false
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
      return { ...a, ...b };
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
      isAsync: true
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

module.exports = { getTodo, localMocksTest };
