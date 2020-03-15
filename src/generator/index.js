// TODO: Use babel template
const prettier = require('prettier');
const { filePathToFileName, wrapSafely } = require('./utils');
const { generateMocksFromActivity } = require('./mocks');
const {
  inputStatementsGenerator,
  generateImportStatementFromActivity,
  generateExpectStatement,
} = require('./statement-genenerators');

const generateTestFromCapture = (functionName, meta, capture, testIndex) => {
  const { paramIds, doesReturnPromise } = meta;
  const inputStatements = inputStatementsGenerator(paramIds, capture);
  const resultStatement = `const result = ${wrapSafely(capture.result)}`;
  const invokeExpression = `${functionName}(${paramIds.join(',')})`;
  const expectStatement = generateExpectStatement(
    invokeExpression,
    capture.result,
    doesReturnPromise,
  );
  const asyncString = doesReturnPromise ? 'async ' : '';
  return `
  it('test ${testIndex}', ${asyncString}()=>{
    ${inputStatements.join('\n')}
    ${resultStatement}
    ${expectStatement}
  })
  `;
};

const generateTestsFromFunctionActivity = (functionName, functionActivity) => {
  const { meta, captures } = functionActivity;
  const tests = captures
    .map((capture, index) => generateTestFromCapture(
      functionName,
      meta,
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
  const { mocks, exportedFunctions } = activity;
  const describeBlocks = Object
    .keys(exportedFunctions)
    .map(functionName => generateTestsFromFunctionActivity(
      functionName,
      exportedFunctions[functionName],
    ));

  const importStatements = generateImportStatementFromActivity(exportedFunctions, fileName);
  const mockStatements = generateMocksFromActivity(mocks);

  const result = `
  ${importStatements}
  ${mockStatements}
  describe('${fileName}',()=>{
    ${describeBlocks.join('\n')}
  })
  `;
  return prettier.format(result, {
    singleQuote: true,
    parser: 'babel',
  });
};

const extractTestsFromState = state => Object
  .keys(state)
  .map(filePath => ({
    filePath,
    fileString: generateTestsFromActivity(filePathToFileName(filePath), state[filePath]),
  }));

module.exports = {
  extractTestsFromState,
};
