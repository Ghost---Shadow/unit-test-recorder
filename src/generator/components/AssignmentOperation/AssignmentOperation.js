const {
  wrapSafely,
  shouldMoveToExternal,
  generateNameForExternal,
  packageDataForExternal,
} = require('../../utils');

const {
  AggregatorManager,
} = require('../../external-data-aggregator');

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
  const fileString = packageDataForExternal(maybeObject);
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
