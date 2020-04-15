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

const FunctionStubBlock = (props) => {
  const {
    meta,
    captureIndex,
    packagedArguments,
    capture,
  } = props;
  if (!capture.mocks) return '';

  const allStubs = [];

  Object.keys(capture.mocks).forEach((importPath) => {
    const moduleToMock = capture.mocks[importPath];
    const importIdentifier = _.camelCase(importPath);
    Object.keys(moduleToMock).forEach((lIdentifier) => {
      const { captures } = moduleToMock[lIdentifier];
      captures.forEach((innerCapture, innerCaptureIndex) => {
        const payload = innerCapture.result;
        const paramType = innerCapture.types.result;
        const innerProps = {
          meta,
          captureIndex,
          innerCaptureIndex,
          importIdentifier,
          lIdentifier,
          payload,
          paramType,
          packagedArguments,
        };
        const code = JestMockImplementationStatement(innerProps);
        allStubs.push(code);
      });
    });
  });
  return allStubs.join('\n');
};

module.exports = {
  JestMockImplementationStatement,
  FunctionStubBlock,
};
