// TODO: Use babel template
const prettier = require('prettier');

const generateTestFromCapture = (functionName, paramIds, capture, testIndex) => {
  const inputStatements = capture.params
    .map((param, index) => `const ${paramIds[index]} = ${param}`);
  const resultStatement = `const result = ${capture.result}`;
  const invokeExpression = `${functionName}(${paramIds.join(',')})`;
  const expectStatement = `expect(${invokeExpression}).toEqual(result)`;
  return `
  it('test ${testIndex}',()=>{
    ${inputStatements.join('\n')}
    ${resultStatement}
    ${expectStatement}
  })
  `;
};

const generateTestsFromFunctionActivity = (functionName, functionActivity) => {
  const { paramIds, captures } = functionActivity;
  const tests = captures
    .map((capture, index) => generateTestFromCapture(
      functionName,
      paramIds,
      capture,
      index,
    ));
  return `
  describe('${functionName}',()=>{
    ${tests.join('\n')}
  })
  `;
};

const generateTestsFromActivity = (fileName, activity) => {
  const describeBlocks = Object
    .keys(activity)
    .map(functionName => generateTestsFromFunctionActivity(
      functionName,
      activity[functionName],
    ));
  const importStatement = Object.keys(activity);
  const result = `
  const {${importStatement.join(',')}} = require('./${fileName}')
  describe('${fileName}',()=>{
    ${describeBlocks.join('\n')}
  })
  `;
  return prettier.format(result, {
    singleQuote: true,
    parser: 'babel',
  });
};

module.exports = {
  generateTestsFromActivity,
};
