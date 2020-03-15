const path = require('path');
const prettier = require('prettier');

const filePathToFileName = (filePath) => {
  const basePath = path.basename(filePath);
  return basePath.substring(0, basePath.length - 3);
};

const wrapSafely = (param) => {
  const result = {
    string: `"${param}"`,
    // Circular jsons should never exist in activity
    object: JSON.stringify(param, null, 2),
  }[typeof (param)];
  return result || param;
};

// If the stringified payload > 500 chars long
// then it should be used as an external file
const shouldMoveToExternal = obj => JSON.stringify(obj).length > 500;

const generateNameForExternal = () => {
  // TODO
  const filePath = 'test_integration/flows/07_large_payload/07_large_payload/getClickCounts_1_result.js';
  const importPath = './07_large_payload/getClickCounts_1_result.js';
  const identifier = 'getClickCounts1Result';
  return { identifier, filePath, importPath };
};

const packageDataForExternal = obj => prettier.format(
  `module.exports = ${wrapSafely(obj)}`,
  {
    singleQuote: true,
    parser: 'babel',
  },
);

module.exports = {
  filePathToFileName,
  wrapSafely,
  shouldMoveToExternal,
  generateNameForExternal,
  packageDataForExternal,
};
