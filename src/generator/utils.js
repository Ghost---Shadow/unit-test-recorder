const path = require('path');
const prettier = require('prettier');

const filePathToFileName = (filePath) => {
  const basePath = path.basename(filePath);
  return basePath.substring(0, basePath.length - 3);
};

// TODO
const getOutputFilePath = (filePath /* outputDir */) => {
  const relativePath = './';
  const outputFilePath = filePath;
  return { outputFilePath, relativePath };
};

const wrapSafely = (param, paramType = typeof (param)) => {
  paramType = paramType.toLowerCase();
  const result = {
    date: `new Date('${param}')`,
    number: param === null ? 'Number.NaN' : param,
  }[paramType];
  // Circular jsons should never exist in activity
  return result || JSON.stringify(param, null, 2);
};

// If the stringified payload > 500 chars long
// then it should be used as an external file
// TODO: Make configurable from CLI
const shouldMoveToExternal = (obj, limit = 500) => obj && JSON.stringify(obj).length > limit;

const generateNameForExternal = (meta, captureIndex, identifierName) => {
  const { path: sourceFilePath, name: functionName, relativePath } = meta;
  const sourceFileDir = path.dirname(path.join('.', sourceFilePath));
  const outputDir = path.normalize(path.join(sourceFileDir, relativePath));
  const fileName = path.parse(sourceFilePath).name;
  const externalName = `${functionName}_${captureIndex}_${identifierName}.mock.js`;
  const filePath = path.join(outputDir, fileName, externalName);
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

const reduceExternalImports = externalData => externalData.reduce((acc, ed) => {
  const { importPath, identifier } = ed;
  return `${acc}\nconst ${identifier} = require('${importPath}')`;
}, '');

module.exports = {
  filePathToFileName,
  wrapSafely,
  shouldMoveToExternal,
  generateNameForExternal,
  packageDataForExternal,
  reduceExternalImports,
  getOutputFilePath,
};
