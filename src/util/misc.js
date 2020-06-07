const _ = require('lodash');

const getTestFileNameForFile = (filePath, packagedArguments) => {
  const { testExt, isTypescript } = packagedArguments;
  const ext = isTypescript ? 'ts' : 'js';
  return filePath.replace(/\.[jt]s/, `.${testExt}.${ext}`);
};

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
