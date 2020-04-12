const path = require('path');
const prettier = require('prettier');
const _ = require('lodash');

const filePathToFileName = filePath => path.parse(filePath).name;

const getOutputFilePath = (rawFilePath, rawOutputDir) => {
  // Handle Windows file paths
  const filePath = rawFilePath.replace(/\\/g, '/');
  const fileName = filePathToFileName(filePath);

  // rawOutputDir === null means use the same directory as inputDir
  if (!rawOutputDir) {
    return {
      outputFilePath: filePath,
      importPath: `./${fileName}`,
      relativePath: './',
    };
  }
  const outputDir = rawOutputDir.replace(/\\/g, '/');

  const inputDir = path.posix.dirname(filePath);
  const baseName = path.posix.basename(filePath);

  // https://github.com/nodejs/node/issues/1904#issuecomment-109341435
  const outputFilePath = path.posix.join(outputDir, inputDir, baseName);
  const finalOutputDir = path.posix.dirname(outputFilePath);
  const importPath = path.posix.join(path.posix.normalize(path.posix.relative(finalOutputDir, inputDir)), '/', fileName);
  const relativePath = path.posix.join(path.posix.normalize(path.posix.relative(inputDir, finalOutputDir)), '/');
  const formatedImportPath = importPath.startsWith('.') ? importPath : `./${importPath}`;

  return { outputFilePath, importPath: formatedImportPath, relativePath };
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
const shouldMoveToExternal = (obj, limit) => obj && JSON.stringify(obj).length > limit;

const generateNameForExternal = (meta, captureIndex, identifierName) => {
  const { path: sourceFilePath, name: functionName, relativePath } = meta;
  const sourceFileDir = path.posix.dirname(path.posix.join('.', sourceFilePath));
  const outputDir = path.posix.normalize(path.posix.join(sourceFileDir, relativePath));
  const fileName = filePathToFileName(sourceFilePath);
  const cameledFnName = _.camelCase(functionName);
  const externalName = `${cameledFnName}_${captureIndex}_${identifierName}.mock.js`;
  const filePath = path.posix.join(outputDir, fileName, externalName);
  const importPath = `./${path.posix.join(fileName, externalName)}`;
  const identifier = `${cameledFnName}${captureIndex}${identifierName}`;
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
