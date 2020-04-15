const {
  JestMockImplementationStatement,
} = require('../JestMockImplementationStatement/JestMockImplementationStatement');

const JestMockDeclaration = ({ lIdentifier }) => `${lIdentifier} = jest.fn()`;

// Drop the __proto__ because we dont want to
// deal with immutable stuff
// TODO: Make sure there would be no side effects
// with polymorphism
const dropProtoFromInjections = (injections) => {
  const dropProto = str => str
    .split('.')
    .filter(part => part !== '__proto__')
    .join('.');
  return Object.keys(injections).reduce((acc, key) => {
    const newKey = dropProto(key);
    return {
      ...acc,
      [newKey]: injections[key],
    };
  }, {});
};

const DependencyInjectionStubBlock = (props) => {
  const {
    capture, meta, captureIndex, packagedArguments,
  } = props;
  if (!capture.injections) return '';

  // Drop the __proto__ from keys
  capture.injections = dropProtoFromInjections(capture.injections);

  // Generate mock functions
  const injectedFunctionMocks = [];
  Object.keys(capture.injections)
    .forEach((injPath) => {
      const lIdentifier = injPath;
      const { captures } = capture.injections[injPath];
      injectedFunctionMocks.push(JestMockDeclaration({ lIdentifier }));
      captures.forEach((innerCapture, innerCaptureIndex) => {
        const payload = innerCapture.result;
        const paramType = innerCapture.types.result;
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
        injectedFunctionMocks.push(code);
      });
    });

  return injectedFunctionMocks.join('\n');
};

module.exports = { DependencyInjectionStubBlock, JestMockDeclaration };
