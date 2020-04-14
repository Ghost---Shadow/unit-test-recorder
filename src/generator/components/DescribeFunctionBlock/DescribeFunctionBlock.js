const { ItBlock } = require('../ItBlock/ItBlock');

const generateComments = (meta) => {
  const { requiresContructorInjection } = meta;
  if (requiresContructorInjection) {
    return {
      failure: true,
      startComments: '/* This function requires injection of Constructor (WIP)',
      endComments: '*/',
    };
  }
  return { failure: false, startComments: '', endComments: '' };
};

const DescribeFunctionBlock = (props) => {
  const { functionActivity, packagedArguments } = props;
  const { meta, captures } = functionActivity;
  const { maxTestsPerFunction } = packagedArguments;
  const slicedCaptures = maxTestsPerFunction === -1
    ? captures : captures.slice(0, maxTestsPerFunction);
  const itBlocks = slicedCaptures
    .map((capture, index) => ItBlock({
      meta,
      capture,
      captureIndex: index,
      packagedArguments,
    }));
  const { startComments, endComments } = generateComments(meta);
  const functionName = meta.name;
  const describeBlock = `
  ${startComments}
  describe('${functionName}',()=>{
    ${itBlocks.join('\n')}
  })
  ${endComments}
  `;
  return describeBlock;
};

module.exports = { DescribeFunctionBlock };
