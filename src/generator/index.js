// TODO: Use babel template
const path = require('path');
const prettier = require('prettier');
const _ = require('lodash');
const { captureArrayToLutFun } = require('./lutFunGen');

const wrapSafely = (param) => {
  const result = {
    string: `'${param}'`,
    // Circular jsons should never exist in activity
    object: JSON.stringify(param, null, 2),
  }[typeof (param)];
  return result || param;
};

const generateExpectStatement = (invokeExpression, result) => {
  if (typeof (result) === 'object') {
    return `expect(${invokeExpression}).toMatchObject(result)`;
  }
  if (typeof (result) === 'string') {
    return `expect(${invokeExpression}.toString()).toEqual(result)`;
  }
  return `expect(${invokeExpression}).toEqual(result)`;
};

const inputStatementsGenerator = (paramIds, capture) => {
  if (!capture.injections) {
    return capture.params
      .map((param, index) => `const ${paramIds[index]} = ${wrapSafely(param)}`);
  }
  const injectedFunctionPlaceholders = Object.keys(capture.injections)
    .reduce((acc, injPath) => {
      const newObj = {};
      _.set(newObj, injPath, injPath.toLocaleUpperCase());
      return _.merge(acc, newObj);
    }, {});
  const injectedFunctionMocks = Object.keys(capture.injections)
    .reduce((acc, injPath) => {
      const functionBody = captureArrayToLutFun(capture.injections[injPath]);
      const key = injPath.toLocaleUpperCase();
      return _.merge(acc, {
        [key]: functionBody,
      });
    }, {});
  const inputStatements = capture.params
    .map((param, index) => {
      const paramId = paramIds[index];
      const paramWithMocks = _.merge(param, injectedFunctionPlaceholders[paramId]);
      const parameterized = `const ${paramId} = ${wrapSafely(paramWithMocks)}`;
      return Object.keys(injectedFunctionMocks)
        .reduce((acc, toReplace) => acc.replace(`"${toReplace}"`, injectedFunctionMocks[toReplace]),
          parameterized);
    });
  return inputStatements;
};

const generateTestFromCapture = (functionName, paramIds, capture, testIndex) => {
  const inputStatements = inputStatementsGenerator(paramIds, capture);
  const resultStatement = `const result = ${wrapSafely(capture.result)}`;
  const invokeExpression = `${functionName}(${paramIds.join(',')})`;
  const expectStatement = generateExpectStatement(invokeExpression, capture.result);
  return `
  it('test ${testIndex}',()=>{
    ${inputStatements.join('\n')}
    ${resultStatement}
    ${expectStatement}
  })
  `;
};

const generateTestsFromFunctionActivity = (functionName, functionActivity) => {
  const { meta, captures } = functionActivity;
  const { paramIds } = meta;
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

const generateImportStatementFromActivity = (activity, fileName) => {
  const importedFunctions = Object.keys(activity);
  return importedFunctions.reduce((acc, importedFunction) => {
    const { isDefault, isEcmaDefault } = activity[importedFunction].meta;
    if (isEcmaDefault) return `${acc}\nconst {default:${importedFunction}} = require('./${fileName}')`;
    if (isDefault) return `${acc}\nconst ${importedFunction} = require('./${fileName}')`;
    return `${acc}\nconst {${importedFunction}} = require('./${fileName}')`;
  }, '');
};

const generateTestsFromActivity = (fileName, activity) => {
  const describeBlocks = Object
    .keys(activity)
    .map(functionName => generateTestsFromFunctionActivity(
      functionName,
      activity[functionName],
    ));

  const importStatement = generateImportStatementFromActivity(activity, fileName);

  const result = `
  ${importStatement}
  describe('${fileName}',()=>{
    ${describeBlocks.join('\n')}
  })
  `;
  return prettier.format(result, {
    singleQuote: true,
    parser: 'babel',
  });
};

const filePathToFileName = (filePath) => {
  const basePath = path.basename(filePath);
  return basePath.substring(0, basePath.length - 3);
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
