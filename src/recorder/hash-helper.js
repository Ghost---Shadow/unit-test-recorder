const crypto = require('crypto');
const _ = require('lodash');
const { safeStringify } = require('./utils');

const generateHashForParam = (params) => {
  // TODO: safeStringify converts functions to null
  const str = safeStringify(params);
  const hash = crypto.createHash('md5').update(str).digest('base64');
  return hash;
};

const checkAndSetHash = (RecorderManager, basePath, params) => {
  const hashTablePath = [...basePath, 'hashTable'];

  if (!_.get(RecorderManager, hashTablePath)) {
    _.set(RecorderManager, hashTablePath, {});
  }
  const hash = generateHashForParam(params);
  const pathWithHash = [...hashTablePath, hash];
  if (_.get(RecorderManager, pathWithHash)) {
    return true;
  }
  _.set(RecorderManager, pathWithHash, true);
  return false;
};

module.exports = {
  generateHashForParam,
  checkAndSetHash,
};
