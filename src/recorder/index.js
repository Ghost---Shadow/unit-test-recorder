let recorderState = {};

// TODO: Use redux
const RecorderManager = {
  recorderState,
  clear: () => { recorderState = {}; },
  getSerialized: () => JSON.stringify(recorderState, null, 2),
};

const recorderWrapper = (functionName, innerFunction, paramIds, ...p) => {
  if (recorderState[functionName] === undefined) {
    recorderState[functionName] = {
      paramIds: paramIds.split(','),
      captures: [],
    };
  }
  const params = p;
  const result = innerFunction(...p);
  recorderState[functionName].captures.push({
    params,
    result,
  });
  return result;
};

module.exports = {
  recorderWrapper,
  RecorderManager,
};
