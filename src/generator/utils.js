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
// TODO: Make configurable from CLI
const shouldMoveToExternal = (obj, limit = 500) => JSON.stringify(obj).length > limit;

const generateNameForExternal = (meta, captureIndex, identifierName) => {
  const { path: sourceFilePath, name: functionName } = meta;
  const sourceFileDir = path.dirname(path.join('.', sourceFilePath));
  const fileName = path.parse(sourceFilePath).name;
  const externalName = `${functionName}_${captureIndex}_${identifierName}.js`;
  const filePath = path.join(sourceFileDir, fileName, externalName);
  const importPath = `./${path.join(fileName, externalName)}`;
  const identifier = `${functionName}${captureIndex}${identifierName}`;
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
