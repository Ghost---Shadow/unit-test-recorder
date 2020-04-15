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
  importIdentifier,
  lIdentifier,
  payload,
  paramType,
  packagedArguments,
}) => {
  const { path } = meta;

  const fqn = `${importIdentifier}.${lIdentifier}`;
  const inner = rhs => `${fqn}.mockReturnValueOnce(${rhs})`;
  const { sizeLimit } = packagedArguments;

  if (!shouldMoveToExternal(payload, sizeLimit)) {
    const code = inner(wrapSafely(payload, paramType));
    return code;
  }
  const { identifier, filePath, importPath } = generateNameForExternal(
    meta, captureIndex, _.camelCase(`${fqn}${innerCaptureIndex}`),
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
