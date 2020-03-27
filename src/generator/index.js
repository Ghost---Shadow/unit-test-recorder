// TODO: Use babel template
const prettier = require('prettier');
const { filePathToFileName } = require('./utils');
const { generateMocksFromActivity } = require('./mocks');
const {
  generateInputStatements,
  generateImportStatementFromActivity,
  generateExpectStatement,
  generateResultStatement,
} = require('./statement-genenerators');

const generateTestFromCapture = (functionIdentifier, meta, capture, testIndex) => {
  const { doesReturnPromise } = meta;
  const {
    inputStatements,
    injectedFunctionMocks,
    inputStatementExternalData,
  } = generateInputStatements(capture, meta, testIndex);
  const {
    resultStatement,
    resultStatementExternalData,
  } = generateResultStatement(capture, meta, testIndex);
  const expectStatement = generateExpectStatement(
    functionIdentifier, capture, meta,
  );
  const asyncString = doesReturnPromise ? 'async ' : '';
  const testString = `
  it('test ${testIndex}', ${asyncString}()=>{
    ${inputStatements.join('\n')}
    ${injectedFunctionMocks.join('\n')}
    ${resultStatement}
    ${expectStatement}
  })
  `;
  const externalData = inputStatementExternalData.concat(resultStatementExternalData);
  return { testString, externalData };
};

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

const generateTestsFromFunctionActivity = (functionName, functionActivity, maxTestsPerFunction) => {
  const { meta, captures } = functionActivity;
  const slicedCaptures = maxTestsPerFunction === -1
    ? captures : captures.slice(0, maxTestsPerFunction);
  const testData = slicedCaptures
    .map((capture, index) => generateTestFromCapture(
      functionName,
      meta,
      capture,
      index,
    ));
  const tests = testData.map(t => t.testString).join('\n');
  const externalData = testData.reduce((acc, d) => acc.concat(d.externalData), []);
  const { failure, startComments, endComments } = generateComments(meta);
  const describeBlock = `
  ${startComments}
  describe('${functionName}',()=>{
    ${tests}
  })
  ${endComments}
  `;
  return { describeBlock, externalData, failure };
};

const generateTestsFromActivity = (fileName, filePath, activity, maxTestsPerFunction) => {
  const { mocks, exportedFunctions } = activity;
  const describeData = Object
    .keys(exportedFunctions)
    .map((functionName) => {
      const { describeBlock, externalData } = generateTestsFromFunctionActivity(
        functionName,
        exportedFunctions[functionName],
        maxTestsPerFunction,
      );
      return { describeBlock, externalData };
    });

  const describeBlocks = describeData.map(d => d.describeBlock).join('\n');
  const externalData = describeData.reduce((acc, d) => acc.concat(d.externalData), []);

  const { mockStatements, externalMocks } = generateMocksFromActivity(filePath, mocks);
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
  let fileString = '';
  try {
    fileString = prettier.format(result, {
      singleQuote: true,
      parser: 'babel',
    });
  } catch (e) {
    console.error(e);
    fileString = result;
  }

  return { fileString, externalData: allExternalData };
};

// maxTestsPerFunction: -1 == inf
const extractTestsFromState = (state, maxTestsPerFunction = -1) => Object
  .keys(state)
  .map((filePath) => {
    try {
      const fileName = filePathToFileName(filePath);
      console.log('Generating tests for ', fileName);
      const {
        fileString,
        externalData,
      } = generateTestsFromActivity(fileName, filePath, state[filePath], maxTestsPerFunction);
      return { filePath, fileString, externalData };
    } catch (e) {
      console.error('Error tests for ', filePath);
      return { filePath, fileString: `'${e.stack.toString()}'`, externalData: [] };
    }
  });

module.exports = {
  extractTestsFromState,
};
