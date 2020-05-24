const { recordFileMeta } = require('../../../src/recorder');
const { mockRecorderWrapper } = require('../../../src/recorder');
const { recorderWrapper } = require('../../../src/recorder');
const fileSystem = require('fs');
fileSystem.testIntegrationFlows19Demo19DemoJsReadFileSync = (...p) =>
  mockRecorderWrapper(
    {
      path: 'test_integration/flows/19_demo/19_demo.js',
      moduleName: 'fs',
      name: 'readFileSync'
    },
    fileSystem.readFileSync,
    ...p
  );

const getTodos = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/19_demo/19_demo.js',
      name: 'getTodos',
      paramIds: [],
      injectionWhitelist: ['bulkInsert'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    () => {
      const fileName = 'test_integration/flows/19_demo/sample.json';
      const obj = JSON.parse(
        fileSystem
          .testIntegrationFlows19Demo19DemoJsReadFileSync(fileName, 'utf8')
          .toString()
      );
      return obj;
    },
    ...p
  );

const getCompletedTodos = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/19_demo/19_demo.js',
      name: 'getCompletedTodos',
      paramIds: ['todos'],
      injectionWhitelist: ['bulkInsert'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    todos => todos.filter(todo => todo.done),
    ...p
  );

const saveTodos = async (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/19_demo/19_demo.js',
      name: 'saveTodos',
      paramIds: ['dbClient'],
      injectionWhitelist: ['bulkInsert'],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: true,
      isObject: false
    },
    async dbClient => {
      const todos = getTodos();
      const completedTodos = getCompletedTodos(todos);

      const result = await dbClient.testIntegrationFlows19Demo19DemoJsBulkInsert(
        completedTodos
      );

      return result;
    },
    ...p
  );

module.exports = {
  getTodos,
  getCompletedTodos,
  saveTodos
};
recordFileMeta({
  path: 'test_integration/flows/19_demo/19_demo.js',
  mocks: ['fs']
});
