const _ = require('lodash');
const { captureArrayToLutFun } = require('./lutFunGen');
const {
  wrapSafely,
  shouldMoveToExternal,
  generateNameForExternal,
  packageDataForExternal,
} = require('./utils');
const { inferTypeOfObject } = require('../recorder/utils/dynamic-type-inference');

const generateAssignmentOperation = (
  maybeObject, lIdentifier, meta, captureIndex, paramType, packagedArguments,
) => {
  const { sizeLimit } = packagedArguments;
  if (!shouldMoveToExternal(maybeObject, sizeLimit)) {
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

const primeObjectForInjections = (maybeObject, paramId, injections) => {
  if (inferTypeOfObject(injections) !== 'Object') return maybeObject;
  const dropProto = injArr => injArr.filter(elem => elem !== '__proto__');
  const allInjections = Object.keys(injections);
  const injArray = allInjections.map(inj => inj.split('.'));
  const injectionsOfCurrentParam = injArray.filter(injArr => injArr[0] === paramId);
  const droppedProto = injectionsOfCurrentParam.map(dropProto);
  const cleanedInjection = droppedProto.map(injArr => injArr.slice(1, injArr.length - 1));
  cleanedInjection.forEach((inj) => {
    _.set(maybeObject, inj, {});
  });
  return maybeObject;
};

const generateRegularInputAssignments = (capture, meta, testIndex, packagedArguments) => {
  const { paramIds } = meta;
  const { params, types } = capture;
  const paramTypes = _.get(types, 'params', []);

  const inputStatementData = paramIds
    .map((paramId, index) => {
      const maybeObject = params[index];
      const lIdentifier = paramId;
      const captureIndex = testIndex;
      const paramType = paramTypes[index];
      const maybePrimedObject = primeObjectForInjections(maybeObject, paramId, capture.injections);
      const { statement, externalData } = generateAssignmentOperation(
        maybePrimedObject, lIdentifier, meta, captureIndex, paramType, packagedArguments,
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

const generateInputAssignmentsWithInjections = (capture, meta, testIndex, packagedArguments) => {
  const functionMockExternalData = [];
  if (!capture.injections) {
    return {
      injectedFunctionMocks: [],
      functionMockExternalData,
    };
  }

  // Drop the __proto__ from keys
  capture.injections = dropProtoFromInjections(capture.injections);

  // Generate mock functions
  const injectedFunctionMocks = Object.keys(capture.injections)
    .map((injPath) => {
      const lIdentifier = injPath;
      const { captures } = capture.injections[injPath];
      const { code, externalData } = captureArrayToLutFun(
        captures, lIdentifier, meta, testIndex, packagedArguments,
      );
      functionMockExternalData.push(...externalData);
      return `${lIdentifier} = ${code}`;
    });

  return {
    injectedFunctionMocks,
    functionMockExternalData,
  };
};

module.exports = {
  generateAssignmentOperation,
  generateRegularInputAssignments,
  generateInputAssignmentsWithInjections,
  primeObjectForInjections,
};
