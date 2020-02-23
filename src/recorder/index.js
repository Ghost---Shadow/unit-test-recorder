let recorderState = {};

// TODO: Use redux
const RecorderManager = {
  recorderState,
  clear: () => { recorderState = {}; },
  getSerialized: () => JSON.stringify(recorderState, null, 2),
};


const recorderWrapper = (functionName, innerFunction, ...p) => {
  if (recorderState[functionName] === undefined) {
    recorderState[functionName] = [];
  }
  const params = p;
  const result = innerFunction(...p);
  recorderState[functionName].push({
    params,
    result,
  });
  return result;
};

module.exports = {
  recorderWrapper,
  RecorderManager,
};
