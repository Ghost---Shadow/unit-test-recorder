const _ = require('lodash');
const stringify = require('json-stringify-safe');

// https://stackoverflow.com/a/30204271/1217998
const safeStringify = obj => stringify(obj, null, 2, () => undefined);

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

module.exports = { safeStringify, removeNullCaptures, removeEmptyFiles };
