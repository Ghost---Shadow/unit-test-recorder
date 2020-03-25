const _ = require('lodash');
const { captureArrayToLutFun } = require('./lutFunGen');
const {
  wrapSafely,
  shouldMoveToExternal,
  generateNameForExternal,
  packageDataForExternal,
} = require('./utils');

const generateAssignmentOperation = (maybeObject, lIdentifier, meta, captureIndex, paramType) => {
  if (!shouldMoveToExternal(maybeObject)) {
    const statement = `let ${lIdentifier} = ${wrapSafely(maybeObject, paramType)}`;
    return { statement, externalData: [] };
  }
  const { identifier, filePath, importPath } = generateNameForExternal(
    meta, captureIndex, lIdentifier,
  );
  const fileString = packageDataForExternal(maybeObject);
  const statement = `let ${lIdentifier} = ${identifier};`;
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
  const { params, types } = capture;
  const paramTypes = _.get(types, 'params', []);

  const inputStatementData = paramIds
    .map((paramId, index) => {
      const maybeObject = params[index];
      const lIdentifier = paramId;
      const captureIndex = testIndex;
      const paramType = paramTypes[index];
      const { statement, externalData } = generateAssignmentOperation(
        maybeObject, lIdentifier, meta, captureIndex, paramType,
      );
      return { statement, externalData };
    });
  const inputStatements = inputStatementData.map(isd => isd.statement);
  const inputStatementExternalData = inputStatementData
    .reduce((acc, isd) => acc.concat(isd.externalData), []);
  return { inputStatements, inputStatementExternalData };
};

// Drop the __proto__ because we dont wanna
// deal with immutable stuff
// TODO: Make sure there would be no side effects
// with polymorphism
const dropProtoFromInjections = (injections) => {
  const dropProto = str => str
    .split('.')
    .filter(part => part !== '__proto__')
    .join('.');
  return Object.keys(injections).reduce((acc, key) => {
    const newKey = dropProto(key);
    return {
      ...acc,
      [newKey]: injections[key],
    };
  }, {});
};

const generateInputAssignmentsWithInjections = (capture, meta, testIndex) => {
  // Drop the __proto__ from keys
  capture.injections = dropProtoFromInjections(capture.injections);

  const allExternalData = [];

  // Generate mock functions
  const injectedFunctionMocks = Object.keys(capture.injections)
    .map((injPath) => {
      const lIdentifier = injPath;
      const { captures } = capture.injections[injPath];
      const { code, externalData } = captureArrayToLutFun(
        captures, lIdentifier, meta, testIndex,
      );
      allExternalData.push(...externalData);
      return `${lIdentifier} = ${code}`;
    });

  // Generate all the assignment operations
  const {
    inputStatements,
    inputStatementExternalData,
  } = generateRegularInputAssignments(capture, meta, testIndex);
  allExternalData.push(...inputStatementExternalData);

  return {
    inputStatements,
    injectedFunctionMocks,
    inputStatementExternalData: allExternalData,
  };
};

module.exports = {
  generateAssignmentOperation,
  generateRegularInputAssignments,
  generateInputAssignmentsWithInjections,
};
