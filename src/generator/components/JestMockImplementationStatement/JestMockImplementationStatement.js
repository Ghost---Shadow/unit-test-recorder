const _ = require('lodash');

const {
  wrapSafely,
  shouldMoveToExternal,
  generateNameForExternal,
  packageDataForExternal,
} = require('../../utils');

const {
  AggregatorManager,
} = require('../../external-data-aggregator');

const JestMockImplementationStatement = ({
  meta,
  captureIndex,
  innerCaptureIndex,
  lIdentifier,
  payload,
  paramType,
  packagedArguments,
}) => {
  const { path } = meta;

  const inner = rhs => `${lIdentifier}.mockReturnValueOnce(${rhs})`;
  const { sizeLimit } = packagedArguments;

  if (!shouldMoveToExternal(payload, sizeLimit)) {
    const code = inner(wrapSafely(payload, paramType));
    return code;
  }
  const { identifier, filePath, importPath } = generateNameForExternal(
    meta, captureIndex, _.camelCase(`${lIdentifier}${innerCaptureIndex}`),
  );
  const fileString = packageDataForExternal(payload);
  const code = inner(identifier);
  const externalData = [{
    fileString,
    identifier,
    filePath,
    importPath,
  }];
  AggregatorManager.addExternalData(path, externalData);

  return code;
};

module.exports = { JestMockImplementationStatement };
