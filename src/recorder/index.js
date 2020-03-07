const safeStringify = (obj) => {
  // https://stackoverflow.com/a/11616993/1217998
  const cache = [];
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Duplicate reference found, discard key
        return undefined;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  }, 2);
};

const sanitize = (obj) => {
  if (typeof (obj) === 'function') return obj.toString();
  return obj;
};

// TODO: Use redux
const RecorderManager = {
  recorderState: {},
  clear() {
    this.recorderState = {};
  },
  getSerialized() {
    return safeStringify(this.recorderState);
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
  const params = p.map(sanitize);
  const result = sanitize(innerFunction(...p));
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
