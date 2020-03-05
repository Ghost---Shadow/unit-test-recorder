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

const recorderWrapper = (meta, innerFunction, ...p) => {
  const { path, name } = meta;
  if (RecorderManager.recorderState[path] === undefined) {
    RecorderManager.recorderState[path] = {};
  }
  if (RecorderManager.recorderState[path][name] === undefined) {
    RecorderManager.recorderState[path][name] = {
      meta: { ...meta, paramIds: meta.paramIds.split(',') },
      captures: [],
    };
  }
  const params = p;
  const result = innerFunction(...p);
  RecorderManager.recorderState[path][name].captures.push({
    params,
    result,
  });
  return result;
};

module.exports = {
  recorderWrapper,
  RecorderManager,
};
