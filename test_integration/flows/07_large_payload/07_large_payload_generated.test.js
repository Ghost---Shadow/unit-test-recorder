const { getClickCounts } = require('./07_large_payload');
const { getClickCountsHelper } = require('./07_large_payload');

const getClickCounts0result = require('./07_large_payload/getClickCounts_0_result.mock.js');
const getClickCountsHelper0result = require('./07_large_payload/getClickCountsHelper_0_result.mock.js');
const getClickCountsHelper0requestDataCb = require('./07_large_payload/getClickCountsHelper_0_requestDataCb.mock.js');

describe('07_large_payload', () => {
  describe('getClickCounts', () => {
    it('should work for case 1', () => {
      let result = getClickCounts0result;

      const actual = getClickCounts();
      expect(actual).toEqual(result);
    });
  });

  describe('getClickCountsHelper', () => {
    it('should work for case 1', () => {
      let requestDataCb = null;
      let result = getClickCountsHelper0result;
      requestDataCb = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce((acc, param) => {
          if (typeof param === 'string') return acc[param];
          const stringifiedParam = JSON.stringify(param);
          if (stringifiedParam && stringifiedParam.length > 10000)
            return acc['KEY_TOO_LARGE'];
          return acc[stringifiedParam];
        }, getClickCountsHelper0requestDataCb);
      };
      const actual = getClickCountsHelper(requestDataCb);
      expect(actual).toEqual(result);
    });
  });
});
