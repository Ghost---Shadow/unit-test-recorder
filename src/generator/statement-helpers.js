const _ = require('lodash');
const { captureArrayToLutFun } = require('./lutFunGen');
const {
  wrapSafely,
  shouldMoveToExternal,
  generateNameForExternal,
  packageDataForExternal,
} = require('./utils');

const generateAssignmentOperation = (maybeObject, lIdentifier, meta, captureIndex) => {
  if (!shouldMoveToExternal(maybeObject)) {
    const statement = `const ${lIdentifier} = ${wrapSafely(maybeObject)}`;
    return { statement, externalData: [] };
  }
  const { identifier, filePath, importPath } = generateNameForExternal(
    meta, captureIndex, lIdentifier,
  );
  const fileString = packageDataForExternal(maybeObject);
  const statement = `const ${lIdentifier} = ${identifier};`;
  const externalData = [{
    fileString,
    identifier,
    filePath,
    importPath,
  }];
  return { statement, externalData };
};

const generateRegularInputAssignments = (capture, meta, testIndex) => {
  const { paramIds } = meta;

  const inputStatementData = capture.params
    .map((param, index) => {
      const maybeObject = param;
      const lIdentifier = paramIds[index];
      const captureIndex = testIndex;
      const { statement, externalData } = generateAssignmentOperation(
        maybeObject, lIdentifier, meta, captureIndex,
      );
      return { statement, externalData };
    });
  const inputStatements = inputStatementData.map(isd => isd.statement);
  const inputStatementExternalData = inputStatementData
    .reduce((acc, isd) => acc.concat(isd.externalData), []);
  return { inputStatements, inputStatementExternalData };
};

const generateInputAssignmentsWithInjections = (capture, meta /* testIndex */) => {
  const { paramIds } = meta;
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
  // TODO
  return { inputStatements, inputStatementExternalData: [] };
};

module.exports = {
  generateAssignmentOperation,
  generateRegularInputAssignments,
  generateInputAssignmentsWithInjections,
};
