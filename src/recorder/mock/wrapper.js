const _ = require('lodash');
// const { checkAndSetHash } = require('./utils/hash-helper');
const { shouldRecordStubParams } = require('../utils/misc');
const { recordToCls } = require('../utils/cls-recordings');

const mockRecorderWrapper = (meta, oldFp, ...p) => {
  const clonedParams = shouldRecordStubParams() ? _.cloneDeep(p) : [];
  const result = oldFp(...p);
  const MOCK_KEY = 'mocks';
  try {
    if (typeof (result.then) === 'function') {
      result.then((res) => {
        const data = { mockMeta: meta, params: clonedParams, result: res };
        recordToCls(MOCK_KEY, data);
      });
    } else {
      const data = { mockMeta: meta, params: clonedParams, result };
      recordToCls(MOCK_KEY, data);
    }
  } catch (e) {
    console.error(e);
  }
  return result;
};

module.exports = {
  mockRecorderWrapper,
};
