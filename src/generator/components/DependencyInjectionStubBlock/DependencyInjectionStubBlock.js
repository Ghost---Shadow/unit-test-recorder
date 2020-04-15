const { captureArrayToLutFun } = require('../../lutFunGen');
const { AggregatorManager } = require('../../external-data-aggregator');

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

  const { path } = meta;

  // Drop the __proto__ from keys
  capture.injections = dropProtoFromInjections(capture.injections);

  // Generate mock functions
  const injectedFunctionMocks = Object.keys(capture.injections)
    .map((injPath) => {
      const lIdentifier = injPath;
      const { captures } = capture.injections[injPath];
      const { code, externalData } = captureArrayToLutFun(
        captures, lIdentifier, meta, captureIndex, packagedArguments,
      );
      AggregatorManager.addExternalData(path, externalData);
      return `${lIdentifier} = ${code};`;
    });

  return injectedFunctionMocks.join('\n');
};

module.exports = { DependencyInjectionStubBlock };
