const {
  wrapSafely,
  shouldMoveToExternal,
  generateNameForExternal,
} = require('../../utils');

const { PackagedExternalFile } = require('../PackagedExternalFile/PackagedExternalFile');
const { AggregatorManager } = require('../../external-data-aggregator');

const AssignmentOperation = (props) => {
  const {
    meta,
    packagedArguments,
    maybeObject,
    lIdentifier,
    captureIndex,
    paramType,
  } = props;
  const { path } = meta;

  const { sizeLimit } = packagedArguments;
  if (!shouldMoveToExternal(maybeObject, sizeLimit)) {
    const code = `let ${lIdentifier} = ${wrapSafely(maybeObject, paramType)}`;
    return code;
  }
  const { identifier, filePath, importPath } = generateNameForExternal(
    meta, captureIndex, lIdentifier,
  );
  const fileString = PackagedExternalFile({ obj: maybeObject, packagedArguments });
  const code = `let ${lIdentifier} = ${identifier};`;
  const externalData = [{
    fileString,
    identifier,
    filePath,
    importPath,
  }];
  AggregatorManager.addExternalData(path, externalData);

  return code;
};

module.exports = { AssignmentOperation };
