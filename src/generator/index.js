// TODO: Use babel template
const prettier = require('prettier');
const { filePathToFileName } = require('./utils');
const { generateMocksFromActivity } = require('./mocks');
const {
  inputStatementsGenerator,
  generateImportStatementFromActivity,
  generateExpectStatement,
  generateResultStatement,
} = require('./statement-genenerators');

const generateTestFromCapture = (functionIdentifier, meta, capture, testIndex) => {
  const { paramIds, doesReturnPromise } = meta;
  const {
    inputStatements,
    inputStatementExternalData,
  } = inputStatementsGenerator(capture, meta, testIndex);
  const {
    resultStatement,
    resultStatementExternalData,
  } = generateResultStatement(capture, meta, testIndex);
  const invokeExpression = `${functionIdentifier}(${paramIds.join(',')})`;
  const expectStatement = generateExpectStatement(
    invokeExpression,
    capture.result,
    doesReturnPromise,
  );
  const asyncString = doesReturnPromise ? 'async ' : '';
  const testString = `
  it('test ${testIndex}', ${asyncString}()=>{
    ${inputStatements.join('\n')}
    ${resultStatement}
    ${expectStatement}
  })
  `;
  const externalData = inputStatementExternalData.concat(resultStatementExternalData);
  return { testString, externalData };
};

const generateTestsFromFunctionActivity = (functionName, functionActivity) => {
  const { meta, captures } = functionActivity;
  const testData = captures
    .map((capture, index) => generateTestFromCapture(
      functionName,
      meta,
      capture,
      index,
    ));
  const tests = testData.map(t => t.testString).join('\n');
  const externalData = testData.reduce((acc, d) => acc.concat(d.externalData), []);
  const describeBlock = `
  describe('${functionName}',()=>{
    ${tests}
  })
  `;
  return { describeBlock, externalData };
};

const generateTestsFromActivity = (fileName, activity) => {
  const { mocks, exportedFunctions } = activity;
  const describeData = Object
    .keys(exportedFunctions)
    .map((functionName) => {
      const { describeBlock, externalData } = generateTestsFromFunctionActivity(
        functionName,
        exportedFunctions[functionName],
      );
      return { describeBlock, externalData };
    });

  const describeBlocks = describeData.map(d => d.describeBlock).join('\n');
  const externalData = describeData.reduce((acc, d) => acc.concat(d.externalData), []);

  const { mockStatements, externalMocks } = generateMocksFromActivity(mocks);
  const allExternalData = externalData.concat(externalMocks);
  const importStatements = generateImportStatementFromActivity(
    exportedFunctions, fileName, allExternalData,
  );

  const result = `
  ${importStatements}
  ${mockStatements}
  describe('${fileName}',()=>{
    ${describeBlocks}
  })
  `;
  const fileString = prettier.format(result, {
    singleQuote: true,
    parser: 'babel',
  });

  return { fileString, externalData: allExternalData };
};

const extractTestsFromState = state => Object
  .keys(state)
  .map((filePath) => {
    const fileName = filePathToFileName(filePath);
    const { fileString, externalData } = generateTestsFromActivity(fileName, state[filePath]);
    return { filePath, fileString, externalData };
  });

module.exports = {
  extractTestsFromState,
};
