const _ = require('lodash');
// const stringify = require('json-stringify-safe');
const { traverse } = require('./object-traverser');
const { inferTypeOfObject } = require('../utils/dynamic-type-inference');

// https://stackoverflow.com/a/30204271/1217998
// const safeStringify = obj => stringify(obj, null, 2, () => undefined);

const safeStringify = (obj) => {
  const type = inferTypeOfObject(obj);
  const base = { Array: [], Object: {} }[type];
  const decycledObj = base || obj;

  if (base) {
    const iterator = traverse(obj, false, {});
    for (
      let path = iterator.next().value;
      path !== undefined;
      path = iterator.next().value
    ) {
      const prop = _.get(obj, path);
      const noProto = path.filter(p => p !== '__proto__');
      _.set(decycledObj, noProto, prop);
    }
  }

  try {
    return JSON.stringify(decycledObj, null, 2);
  } catch (e) {
    // In case it is somehow still cyclic
    console.error(e);
    return JSON.stringify(base);
  }
};

const removeNullCaptures = (recorderState) => {
  // RecorderManager.recorderState[path].exportedFunctions[name].captures[captureIndex]
  const processCaptures = captures => captures.filter(capture => capture !== null);
  const processFunctions = expFun => ({ ...expFun, captures: processCaptures(_.get(expFun, 'captures', [])) });
  const processFile = fileObj => ({
    ...fileObj,
    exportedFunctions: Object.keys(_.get(fileObj, 'exportedFunctions', {})).reduce((acc, functionName) => ({
      ...acc,
      [functionName]: processFunctions(_.get(fileObj, ['exportedFunctions', functionName], {})),
    }), {}),
  });
  return Object.keys(recorderState).reduce((acc, path) => ({
    ...acc,
    [path]: processFile(recorderState[path]),
  }), {});
};

const removeEmptyFiles = (recorderState) => {
  const getTotalCapturesOfFunction = funObj => _.get(funObj, 'captures.length', 0);
  const getTotalCapturesofFile = fileObj => Object
    .keys(fileObj.exportedFunctions)
    .reduce((acc, funName) => acc + getTotalCapturesOfFunction(fileObj.exportedFunctions[funName]),
      0);
  const fileCountArr = Object.keys(recorderState)
    .map(fileName => ({ fileName, count: getTotalCapturesofFile(recorderState[fileName]) }));
  const filesToOmit = fileCountArr.filter(fc => fc.count === 0).map(fc => fc.fileName);
  return _.omit(recorderState, filesToOmit);
};

const removeInvalidFunctions = (recorderState) => {
  // RecorderManager.recorderState[path].exportedFunctions[name].captures[captureIndex]
  const isFunctionValid = funObj => funObj.meta && funObj.captures && funObj.captures.length;
  const expFunReducer = exportedFunctions => Object.keys(exportedFunctions)
    .reduce((acc, functionName) => {
      const funObj = exportedFunctions[functionName];
      if (isFunctionValid(funObj)) {
        return { ...acc, [functionName]: funObj };
      }
      return acc;
    }, {});
  const processFile = fileObj => ({
    ...fileObj,
    exportedFunctions: expFunReducer(_.get(fileObj, 'exportedFunctions', {})),
  });
  return Object.keys(recorderState).reduce((acc, path) => ({
    ...acc,
    [path]: processFile(recorderState[path]),
  }), {});
};

module.exports = {
  safeStringify,
  removeNullCaptures,
  removeEmptyFiles,
  removeInvalidFunctions,
};
