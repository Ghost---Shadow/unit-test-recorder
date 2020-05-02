const _ = require('lodash');
// const { checkAndSetHash } = require('./utils/hash-helper');
const isPromise = require('is-promise');
const { shouldRecordStubParams } = require('../utils/misc');
const { recordToCls } = require('../utils/cls-recordings');
const { KEY_MOCKS } = require('../../util/constants');

const mockRecorderWrapper = (meta, oldFp, ...p) => {
  const clonedParams = shouldRecordStubParams() ? _.cloneDeep(p) : [];
  const result = oldFp(...p);
  try {
    const data = { mockMeta: meta, params: clonedParams };
    if (isPromise(result)) {
      result.then(res => recordToCls(KEY_MOCKS, { ...data, result: res }));
    } else {
      recordToCls(KEY_MOCKS, { ...data, result });
    }
  } catch (e) {
    console.error(e);
  }
  return result;
};

module.exports = {
  mockRecorderWrapper,
};
