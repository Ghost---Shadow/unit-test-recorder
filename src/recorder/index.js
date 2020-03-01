let recorderState = {};

// TODO: Use redux
const RecorderManager = {
  recorderState,
  clear: () => { recorderState = {}; },
  getSerialized: () => JSON.stringify(recorderState, null, 2),
};

const recorderWrapper = (filePath, functionName, innerFunction, paramIds, ...p) => {
  if (recorderState[filePath] === undefined) {
    recorderState[filePath] = {};
  }
  if (recorderState[filePath][functionName] === undefined) {
    recorderState[filePath][functionName] = {
      paramIds: paramIds.split(','),
      captures: [],
    };
  }
  const params = p;
  const result = innerFunction(...p);
  recorderState[filePath][functionName].captures.push({
    params,
    result,
  });
  return result;
};

module.exports = {
  recorderWrapper,
  RecorderManager,
};
