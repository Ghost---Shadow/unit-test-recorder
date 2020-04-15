const {
  MockFunctionStubBlock,
} = require('../MockFunctionStubBlock/MockFunctionStubBlock');

const {
  DependencyInjectionStubBlock,
} = require('../DependencyInjectionStubBlock/DependencyInjectionStubBlock');

const FunctionStubBlock = (props) => {
  const mockStubs = MockFunctionStubBlock(props);
  const diStubs = DependencyInjectionStubBlock(props);
  return `${mockStubs}\n${diStubs}`;
};

module.exports = {
  FunctionStubBlock,
};
