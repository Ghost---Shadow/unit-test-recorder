const _ = require('lodash');
const { safeStringify } = require('./utils/safe-stringify');

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

// TODO: Use redux
const RecorderManager = {
  recorderState: {},
  clear() {
    this.recorderState = {};
  },
  getSerialized() {
    this.recorderState = removeNullCaptures(this.recorderState);
    return safeStringify(this.recorderState);
  },
};

module.exports = RecorderManager;
