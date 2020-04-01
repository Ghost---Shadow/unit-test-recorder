const _ = require('lodash');

const {
  wrapSafely,
  shouldMoveToExternal,
  generateNameForExternal,
  packageDataForExternal,
} = require('./utils');

const KEY_TOO_LARGE = 'KEY_TOO_LARGE';

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

const captureArrayToLutFun = (
  captures, lIdentifier, meta, captureIndex, packagedArguments, keyLimit = 1e+4,
) => {
  const { sizeLimit: limit } = packagedArguments;
  const lut = captures.reduce((acc, capture) => {
    const stringifiedParams = capture.params.map((p) => {
      // TODO: wrapSafely
      if (typeof (p) === 'string') return p;
      return JSON.stringify(p);
    });
    const key = stringifiedParams.length === 0 ? undefined : stringifiedParams;
    const newObj = {};
    _.setWith(newObj, key, capture.result, Object);
    if (key) {
      const altKey = key.map(k => (k.length > keyLimit ? KEY_TOO_LARGE : k));
      _.setWith(newObj, altKey, capture.result, Object);
    }
    return _.merge(acc, newObj);
  }, {});
  const { payload, externalData } = generatePayload(
    lut, lIdentifier, meta, captureIndex, limit, keyLimit,
  );
  const code = `
  (...params) => {
    const safeParams = params.length === 0 ? [undefined] : params
    return safeParams.reduce((acc, param) => {
      if(typeof(param) === 'string') return acc[param]
      const stringifiedParam = JSON.stringify(param)
      if(stringifiedParam && stringifiedParam.length > ${keyLimit}) return acc['${KEY_TOO_LARGE}'];
      return acc[stringifiedParam]
    },${payload})
  }
  `;
  return { code, externalData };
};

module.exports = { captureArrayToLutFun };
