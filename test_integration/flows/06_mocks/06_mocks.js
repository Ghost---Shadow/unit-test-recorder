const fileSystem = require('fs');

const getTodo = () => JSON.parse(fileSystem.readFileSync('test_integration/flows/06_mocks/response.json', 'utf8').toString());

module.exports = getTodo;
