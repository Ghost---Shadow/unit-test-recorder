const fileSystem = require('fs');
const {
  foo1, foo2: foo3, foo4, foo5, higherOrder,
} = require('./auxilary1');
require('./auxilary2');

const expContinuationFn = () => JSON.parse(fileSystem.readFileSync('test_integration/flows/06_mocks/response.json', 'utf8').toString());

const getTodo = () => {
  fileSystem.readFileSync('test_integration/flows/06_mocks/response.json', 'utf8').toString();
  const a = expContinuationFn();
  const b = foo4();
  return a.concat(b);
};

const localMocksTest = async () => {
  const result = foo1() + foo1() + await foo3();
  return result;
};

// TODO: Not implemented
const datesTest = () => foo5();

// TODO: Not implemented
const higherOrderTest = () => {
  const gen = higherOrder(1);
  return gen(2);
};

module.exports = {
  getTodo, localMocksTest, datesTest, higherOrderTest, expContinuationFn,
};
