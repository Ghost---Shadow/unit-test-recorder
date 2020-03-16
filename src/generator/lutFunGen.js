const _ = require('lodash');

const {
  wrapSafely,
  shouldMoveToExternal,
  generateNameForExternal,
  packageDataForExternal,
} = require('./utils');

const generatePayload = (lut, lIdentifier, meta, captureIndex, limit) => {
  if (!shouldMoveToExternal(lut, limit)) {
    const payload = wrapSafely(lut);
    return { payload, externalData: [] };
  }
  const camelLIdentifier = _.camelCase(lIdentifier);
  const { identifier, filePath, importPath } = generateNameForExternal(
    meta, captureIndex, camelLIdentifier,
  );
  const fileString = packageDataForExternal(lut);
  const payload = identifier;
  const externalData = [{
    fileString,
    identifier,
    filePath,
    importPath,
  }];
  return { payload, externalData };
};

const captureArrayToLutFun = (captures, lIdentifier, meta, captureIndex, limit = 500) => {
  const lut = captures.reduce((acc, capture) => {
    const stringifiedParams = capture.params.map((p) => {
      // TODO: wrapSafely
      if (typeof (p) === 'string') return p;
      return JSON.stringify(p);
    });
    const key = stringifiedParams.length === 0 ? undefined : stringifiedParams;
    const newObj = {};
    _.setWith(newObj, key, capture.result, Object);
    return _.merge(acc, newObj);
  }, {});
  const { payload, externalData } = generatePayload(
    lut, lIdentifier, meta, captureIndex, limit,
  );
  const code = `
  (...params) => {
    const safeParams = params.length === 0 ? [undefined] : params
    return safeParams.reduce((acc, param) => {
      if(typeof(param) === 'string') return acc[param]
      return acc[JSON.stringify(param)]
    },${payload})
  }
  `;
  return { code, externalData };
};

module.exports = { captureArrayToLutFun };
