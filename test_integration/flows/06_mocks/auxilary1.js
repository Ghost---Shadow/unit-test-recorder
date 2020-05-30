const fs = require('fs');

const foo1 = () => 1;

const foo2 = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve(2);
  }, 1);
});

const foo4 = () => JSON.parse(fs.readFileSync('test_integration/flows/06_mocks/response.json', 'utf8').toString());

const foo5 = () => new Date('2000-01-31T18:30:00.000Z');

const higherOrder = a => b => a + b;

module.exports = {
  foo1, foo2, foo4, foo5, higherOrder,
};
