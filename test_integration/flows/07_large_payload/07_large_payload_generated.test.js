const { getClickCounts } = require('./07_large_payload');
const { getClickCountsHelper } = require('./07_large_payload');
const getClickCounts0result = require('./07_large_payload/getClickCounts_0_result.js');
const getClickCountsHelper0requestDataCb = require('./07_large_payload/getClickCountsHelper_0_requestDataCb.js');
const getClickCountsHelper0result = require('./07_large_payload/getClickCountsHelper_0_result.js');

describe('07_large_payload', () => {
  describe('getClickCounts', () => {
    it('test 0', () => {
      const result = getClickCounts0result;
      const actual = getClickCounts();
      expect(actual).toMatchObject(result);
    });
  });

  describe('getClickCountsHelper', () => {
    it('test 0', () => {
      const requestDataCb = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce((acc, param) => {
          if (typeof param === 'string') return acc[param];
          return acc[JSON.stringify(param)];
        }, getClickCountsHelper0requestDataCb);
      };

      const result = getClickCountsHelper0result;
      const actual = getClickCountsHelper(requestDataCb);
      expect(actual).toMatchObject(result);
    });
  });
});
