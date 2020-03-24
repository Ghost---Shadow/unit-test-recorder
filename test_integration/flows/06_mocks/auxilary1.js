const fs = require('fs');

const foo1 = () => 1;

const foo2 = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve(2);
  }, 1);
});

const foo4 = () => JSON.parse(fs.readFileSync('test_integration/flows/06_mocks/response.json', 'utf8').toString());

module.exports = { foo1, foo2, foo4 };
