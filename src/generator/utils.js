const path = require('path');
const _ = require('lodash');

const filePathToFileName = filePath => path.parse(filePath).name;

const getOutputFilePath = (rawFilePath, packagedArguments) => {
  const {
    outputDir: rawOutputDir,
    tsBuildDir: rawTsBuildDir,
  } = packagedArguments;

  // Windows to posix paths
  let filePath = rawFilePath.replace(/\\/g, '/');
  const tsBuildDir = `${rawTsBuildDir || ''}`.replace(/\\/g, '/');

  const fileName = filePathToFileName(filePath);

  // Remove typescript tsBuildDir if present
  filePath = path.relative(tsBuildDir || './', filePath);

  // rawOutputDir === null means use the same directory as inputDir
  if (!rawOutputDir) {
    return {
      outputFilePath: filePath,
      importPath: `./${fileName}`,
      relativePath: './',
    };
  }

  // Windows to posix paths
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
  const {
    path: rawSourceFilePath, name: functionName, relativePath, tsBuildDir,
  } = meta;

  // Remove typescript tsBuildDir if present
  const sourceFilePath = path.relative(tsBuildDir || './', rawSourceFilePath);

  const sourceFileDir = path.posix.dirname(path.posix.join('.', sourceFilePath));
  const outputDir = path.posix.normalize(path.posix.join(sourceFileDir, relativePath));
  const fileName = filePathToFileName(sourceFilePath);
  const cameledFnName = _.camelCase(functionName);
  const extension = tsBuildDir ? 'ts' : 'js';
  const externalName = `${cameledFnName}_${captureIndex}_${identifierName}.mock`;
  const filePath = `${path.posix.join(outputDir, fileName, externalName)}.${extension}`;
  const importPath = `./${path.posix.join(fileName, externalName)}`;
  const identifier = `${cameledFnName}${captureIndex}${identifierName}`;
  return { identifier, filePath, importPath };
};

module.exports = {
  filePathToFileName,
  wrapSafely,
  shouldMoveToExternal,
  generateNameForExternal,
  getOutputFilePath,
};
