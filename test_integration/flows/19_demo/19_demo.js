const fileSystem = require('fs');

const getTodos = () => {
  const fileName = 'test_integration/flows/19_demo/sample.json';
  const obj = JSON.parse(fileSystem.readFileSync(fileName, 'utf8').toString());
  return obj;
};

const getCompletedTodos = todos => todos.filter(todo => todo.done);

const saveTodos = async (dbClient) => {
  const todos = getTodos();
  const completedTodos = getCompletedTodos(todos);

  const result = await dbClient.bulkInsert(completedTodos);

  return result;
};

module.exports = {
  getTodos,
  getCompletedTodos,
  saveTodos,
};
