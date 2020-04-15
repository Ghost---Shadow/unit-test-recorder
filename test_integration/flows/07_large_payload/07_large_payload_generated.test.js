const { getClickCounts } = require('./07_large_payload');
const { getClickCountsHelper } = require('./07_large_payload');

const getClickCounts0result = require('./07_large_payload/getClickCounts_0_result.mock.js');
const getClickCountsHelper0result = require('./07_large_payload/getClickCountsHelper_0_result.mock.js');
const getClickCountsHelper0requestDataCb0 = require('./07_large_payload/getClickCountsHelper_0_requestDataCb0.mock.js');

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

      requestDataCb = jest.fn();
      requestDataCb.mockReturnValueOnce(getClickCountsHelper0requestDataCb0);
      const actual = getClickCountsHelper(requestDataCb);
      expect(actual).toEqual(result);
    });
  });
});
