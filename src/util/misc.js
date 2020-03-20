const _ = require('lodash');

const getTestFileNameForFile = filePath => filePath.replace('.js', '.test.js');

// TODO: Make sure it doesnt clober any existing functions of this object
const newFunctionNameGenerator = (functionName, fileName) => _.camelCase(`${fileName}.${functionName}`);

module.exports = {
  getTestFileNameForFile,
  newFunctionNameGenerator,
};
