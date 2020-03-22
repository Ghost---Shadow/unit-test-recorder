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
  const { params } = capture;

  const inputStatementData = paramIds
    .map((paramId, index) => {
      const maybeObject = params[index];
      const lIdentifier = paramId;
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

// TODO: Find a way of doing this without string replacements
const generateInputAssignmentsWithInjections = (capture, meta, testIndex) => {
  const { paramIds } = meta;

  // Drop the __proto__ from keys
  capture.injections = dropProtoFromInjections(capture.injections);

  // Generate placeholders lut
  const injectedFunctionPlaceholders = Object.keys(capture.injections)
    .reduce((acc, injPath) => {
      const newObj = {};
      _.set(newObj, injPath, injPath.toLocaleUpperCase());
      return _.merge(acc, newObj);
    }, {});

  const allExternalData = [];

  // Generate mock functions lut
  const injectedFunctionMocks = Object.keys(capture.injections)
    .reduce((acc, injPath) => {
      const lIdentifier = injPath;
      const captures = capture.injections[injPath];
      const { code, externalData } = captureArrayToLutFun(
        captures, lIdentifier, meta, testIndex,
      );
      allExternalData.push(...externalData);
      const key = injPath.toLocaleUpperCase();
      return _.merge(acc, {
        [key]: code,
      });
    }, {});

  // Add placeholders in correct positions for the replacer to work
  const augmentedParams = capture.params.map((param, index) => {
    if (!_.isObject(param) && !_.isNull(param)) return param;
    const paramId = paramIds[index];
    // If param is null like then it used to be a function
    const paramWithPlaceholder = !_.isNull(param)
      ? _.merge(param, injectedFunctionPlaceholders[paramId])
      : injectedFunctionPlaceholders[paramId];

    return paramWithPlaceholder;
  });

  // Generate all the assignment operations
  const {
    inputStatements,
    inputStatementExternalData,
  } = generateRegularInputAssignments(
    { params: augmentedParams }, meta, testIndex,
  );
  allExternalData.push(...inputStatementExternalData);

  // Replace the placeholders with function strings
  const templatedInputStatements = inputStatements
    .map(parameterized => Object.keys(injectedFunctionMocks)
      .reduce((acc, toReplace) => acc
        .replace(`"${toReplace}"`, injectedFunctionMocks[toReplace]),
      parameterized));

  return {
    inputStatements: templatedInputStatements,
    inputStatementExternalData: allExternalData,
  };
};

module.exports = {
  generateAssignmentOperation,
  generateRegularInputAssignments,
  generateInputAssignmentsWithInjections,
};
