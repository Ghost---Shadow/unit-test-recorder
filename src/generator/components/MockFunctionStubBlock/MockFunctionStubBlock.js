const _ = require('lodash');

const {
  JestMockImplementationStatement,
} = require('../JestMockImplementationStatement/JestMockImplementationStatement');

const MockFunctionStubBlock = (props) => {
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
    Object.keys(moduleToMock).forEach((fnName) => {
      const { captures } = moduleToMock[fnName];
      captures.forEach((innerCapture, innerCaptureIndex) => {
        const payload = innerCapture.result;
        const paramType = innerCapture.types.result;
        const lIdentifier = `${importIdentifier}.${fnName}`;
        const innerProps = {
          meta,
          captureIndex,
          innerCaptureIndex,
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
  MockFunctionStubBlock,
};
