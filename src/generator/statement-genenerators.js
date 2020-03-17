const {
  generateAssignmentOperation,
  generateRegularInputAssignments,
  generateInputAssignmentsWithInjections,
} = require('./statement-helpers');

const externalImportReducer = externalData => externalData.reduce((acc, ed) => {
  const { importPath, identifier } = ed;
  return `${acc}\nconst ${identifier} = require('${importPath}')`;
}, '');

const generateImportStatementFromActivity = (activity, fileName, allExternalData) => {
  const importedFunctions = Object.keys(activity);
  const scriptImports = importedFunctions.reduce((acc, importedFunction) => {
    const { isDefault, isEcmaDefault } = activity[importedFunction].meta;
    if (isEcmaDefault) return `${acc}\nconst {default:${importedFunction}} = require('./${fileName}')`;
    if (isDefault) return `${acc}\nconst ${importedFunction} = require('./${fileName}')`;
    return `${acc}\nconst {${importedFunction}} = require('./${fileName}')`;
  }, '');

  // Mocks are imported in a separate place
  const externalsWithoutMocks = allExternalData.filter(ed => !ed.isMock);

  const externalDataImports = externalImportReducer(externalsWithoutMocks);

  return scriptImports + externalDataImports;
};

const inputStatementsGenerator = (capture, meta, testIndex) => {
  if (!capture.injections) {
    return generateRegularInputAssignments(capture, meta, testIndex);
  }
  return generateInputAssignmentsWithInjections(capture, meta, testIndex);
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

const generateResultStatement = (capture, meta, captureIndex) => {
  const maybeObject = capture.result;
  const lIdentifier = 'result';
  const { statement, externalData } = generateAssignmentOperation(
    maybeObject, lIdentifier, meta, captureIndex,
  );
  return { resultStatement: statement, resultStatementExternalData: externalData };
};

module.exports = {
  inputStatementsGenerator,
  generateImportStatementFromActivity,
  generateExpectStatement,
  generateResultStatement,
  externalImportReducer,
};