const fileSystem = require('fs');
const { foo1, foo2: foo3 } = require('./auxilary1');

const getTodo = () => JSON.parse(fileSystem.readFileSync('test_integration/flows/06_mocks/response.json', 'utf8').toString());

const localMocksTest = async () => {
  const result = foo1() + foo1() + await foo3();
  return result;
};

module.exports = { getTodo, localMocksTest };
