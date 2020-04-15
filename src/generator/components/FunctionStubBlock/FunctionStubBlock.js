const {
  MockFunctionStubBlock,
} = require('../MockFunctionStubBlock/MockFunctionStubBlock');

const FunctionStubBlock = (props) => {
  const mockStubs = MockFunctionStubBlock(props);
  return mockStubs;
};

module.exports = {
  FunctionStubBlock,
};
