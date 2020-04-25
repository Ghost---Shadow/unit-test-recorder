const _ = require('lodash');
// const { checkAndSetHash } = require('./utils/hash-helper');
const { shouldRecordStubParams } = require('../utils/misc');
const { captureMockActivity } = require('./capture');

const mockRecorderWrapper = (meta, oldFp, ...p) => {
  const clonedParams = shouldRecordStubParams() ? _.cloneDeep(p) : [];
  const result = oldFp(...p);
  try {
    if (typeof (result.then) === 'function') {
      result.then((res) => {
        captureMockActivity(meta, clonedParams, res);
      });
    } else {
      captureMockActivity(meta, clonedParams, result);
    }
  } catch (e) {
    console.error(e);
  }
  return result;
};

module.exports = {
  mockRecorderWrapper,
};
