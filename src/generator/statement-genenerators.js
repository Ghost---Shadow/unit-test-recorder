const _ = require('lodash');
const { captureArrayToLutFun } = require('./lutFunGen');
const { wrapSafely } = require('./utils');

const generateImportStatementFromActivity = (activity, fileName) => {
  const importedFunctions = Object.keys(activity);
  return importedFunctions.reduce((acc, importedFunction) => {
    const { isDefault, isEcmaDefault } = activity[importedFunction].meta;
    if (isEcmaDefault) return `${acc}\nconst {default:${importedFunction}} = require('./${fileName}')`;
    if (isDefault) return `${acc}\nconst ${importedFunction} = require('./${fileName}')`;
    return `${acc}\nconst {${importedFunction}} = require('./${fileName}')`;
  }, '');
};

const inputStatementsGenerator = (paramIds, capture) => {
  const inputStatementExternalData = []; // TODO

  if (!capture.injections) {
    const inputStatements = capture.params
      .map((param, index) => `const ${paramIds[index]} = ${wrapSafely(param)}`);
    return { inputStatements, inputStatementExternalData };
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
      // If param is null like then it used to be a function
      const paramWithMocks = !_.isNull(param)
        ? _.merge(param, injectedFunctionPlaceholders[paramId])
        : injectedFunctionPlaceholders[paramId];
      const parameterized = `const ${paramId} = ${wrapSafely(paramWithMocks)}`;
      return Object.keys(injectedFunctionMocks)
        .reduce((acc, toReplace) => acc.replace(`"${toReplace}"`, injectedFunctionMocks[toReplace]),
          parameterized);
    });
  return { inputStatements, inputStatementExternalData };
};

const generateExpectStatement = (invokeExpression, result, doesReturnPromise) => {
  const awaitString = doesReturnPromise ? 'await ' : '';
  const actualStatement = `const actual = ${awaitString}${invokeExpression}`;
  if (typeof (result) === 'object') {
    return `${actualStatement};expect(actual).toMatchObject(result)`;
  }
  if (typeof (result) === 'string') {
    return `${actualStatement};expect(actual.toString()).toEqual(result)`;
  }
  return `${actualStatement};expect(actual).toEqual(result)`;
};

const generateResultStatement = (capture) => {
  const resultStatement = `const result = ${wrapSafely(capture.result)}`;
  const resultStatementExternalData = []; // TODO
  return { resultStatement, resultStatementExternalData };
};

module.exports = {
  inputStatementsGenerator,
  generateImportStatementFromActivity,
  generateExpectStatement,
  generateResultStatement,
};
