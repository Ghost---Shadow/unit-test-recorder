const _ = require('lodash');

const getTestFileNameForFile = (filePath, testExt) => filePath.replace('.js', `.${testExt}`);

// TODO: Make sure it doesnt clober any existing functions of this object
const newFunctionNameGenerator = (functionName, fileName) => _.camelCase(`${fileName}.${functionName}`);

const isWhitelisted = (moduleName, whiteListedModules) => {
  if (`${moduleName}`.startsWith('.')) return true;
  if (whiteListedModules[moduleName]) return true;
  return false;
};

module.exports = {
  getTestFileNameForFile,
  newFunctionNameGenerator,
  isWhitelisted,
};
