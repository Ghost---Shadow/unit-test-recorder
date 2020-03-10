const { flatten, unflatten } = require('flat');
const _ = require('lodash');

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

const recordInjectedActivity = (idObj, paramIds, index, fppkey, paramsOfInjected, result) => {
  const { path, name, captureIndex } = idObj;
  const fqn = `${paramIds[index]}.${fppkey}`;
  const destinationPath = ['recorderState', path, name, 'captures', captureIndex, 'injections', fqn];
  if (!_.get(RecorderManager, destinationPath)) {
    _.set(RecorderManager, destinationPath, []);
  }
  RecorderManager.recorderState[path][name]
    .captures[captureIndex].injections[fqn].push({ params: paramsOfInjected, result });
};

const injectDependencyInjections = (params, paramIds, idObj) => {
  params.forEach((param, index) => {
    if (typeof (param) === 'object') {
      const flatObj = flatten(param);
      Object.keys(flatObj).forEach((fppkey) => {
        if (typeof (flatObj[fppkey]) === 'function') {
          const oldFp = flatObj[fppkey];
          flatObj[fppkey] = (...paramsOfInjected) => {
            const result = oldFp(...paramsOfInjected);
            if (typeof (result.then) === 'function') {
              // It might be a promise
              result.then((res) => {
                recordInjectedActivity(idObj, paramIds, index, fppkey, paramsOfInjected, res);
              });
            } else {
              recordInjectedActivity(idObj, paramIds, index, fppkey, paramsOfInjected, result);
            }
            return result;
          };
        }
      });
      const newParam = unflatten(flatObj);
      params[index] = newParam;
    }
  });
};

const pre = ({ meta, p }) => {
  const { path, name } = meta;
  if (RecorderManager.recorderState[path] === undefined) {
    RecorderManager.recorderState[path] = {};
  }
  const paramIds = meta.paramIds.split(',');
  if (RecorderManager.recorderState[path][name] === undefined) {
    RecorderManager.recorderState[path][name] = {
      meta: { ...meta, paramIds },
      captures: [],
    };
  }
  RecorderManager.recorderState[path][name].captures.push({ });
  const captureIndex = RecorderManager.recorderState[path][name].captures.length - 1;
  injectDependencyInjections(p, paramIds, { path, name, captureIndex });
  const params = p.map(sanitize);
  return {
    path, name, captureIndex, params,
  };
};

const post = ({
  unsanitizedResult, path, name, captureIndex, params, doesReturnPromise,
}) => {
  RecorderManager.recorderState[path][name].meta.doesReturnPromise = doesReturnPromise;

  const result = sanitize(unsanitizedResult);
  const existing = RecorderManager.recorderState[path][name].captures[captureIndex];
  RecorderManager.recorderState[path][name].captures[captureIndex] = _.merge(existing, {
    params,
    result,
  });
};

const recorderWrapper = (meta, innerFunction, ...p) => {
  const {
    path, name, captureIndex, params,
  } = pre({ meta, p });
  const unsanitizedResult = innerFunction(...p);
  if (typeof (unsanitizedResult.then) === 'function') {
    // It might be a promise
    unsanitizedResult.then(res => post({
      unsanitizedResult: res, path, name, captureIndex, params, doesReturnPromise: true,
    }));
  } else {
    post({
      unsanitizedResult, path, name, captureIndex, params, doesReturnPromise: false,
    });
  }
  return unsanitizedResult;
};

module.exports = {
  recorderWrapper,
  RecorderManager,
};
