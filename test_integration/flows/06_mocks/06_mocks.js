const fileSystem = require('fs');
const {
  foo1, foo2: foo3, foo4, foo5,
} = require('./auxilary1');

const getTodo = () => {
  fileSystem.readFileSync('test_integration/flows/06_mocks/response.json', 'utf8').toString();
  const a = JSON.parse(fileSystem.readFileSync('test_integration/flows/06_mocks/response.json', 'utf8').toString());
  const b = foo4();
  return { ...a, ...b };
};

const localMocksTest = async () => {
  const result = foo1() + foo1() + await foo3();
  return result;
};

const datesTest = () => foo5();

module.exports = { getTodo, localMocksTest, datesTest };
