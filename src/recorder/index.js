// TODO: Use redux
const RecorderManager = {
  recorderState: {},
  clear() {
    this.recorderState = {};
  },
  getSerialized() {
    return JSON.stringify(this.recorderState, null, 2);
  },
};

const recorderWrapper = (filePath, functionName, innerFunction, paramIds, isDefault, ...p) => {
  if (RecorderManager.recorderState[filePath] === undefined) {
    RecorderManager.recorderState[filePath] = {};
  }
  if (RecorderManager.recorderState[filePath][functionName] === undefined) {
    RecorderManager.recorderState[filePath][functionName] = {
      isDefault,
      paramIds: paramIds.split(','),
      captures: [],
    };
  }
  const params = p;
  const result = innerFunction(...p);
  RecorderManager.recorderState[filePath][functionName].captures.push({
    params,
    result,
  });
  return result;
};

module.exports = {
  recorderWrapper,
  RecorderManager,
};
