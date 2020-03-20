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
const { foo1, foo2: foo3 } = require('./auxilary1');
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
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    () =>
      JSON.parse(
        fileSystem
          .testIntegrationFlows06Mocks06MocksJsReadFileSync(
            'test_integration/flows/06_mocks/response.json',
            'utf8'
          )
          .toString()
      ),
    ...p
  );

const localMocksTest = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      name: 'localMocksTest',
      paramIds: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    () => {
      const result =
        testIntegrationFlows06Mocks06MocksJsFoo1() +
        testIntegrationFlows06Mocks06MocksJsFoo1() +
        testIntegrationFlows06Mocks06MocksJsFoo3();
      return result;
    },
    ...p
  );

module.exports = { getTodo, localMocksTest };
