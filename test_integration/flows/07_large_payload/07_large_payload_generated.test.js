const { getClickCounts } = require('./07_large_payload');
const { getClickCountsHelper } = require('./07_large_payload');
const getClickCounts0result = require('./07_large_payload/getClickCounts_0_result.js');
const getClickCountsHelper0imgObjs = require('./07_large_payload/getClickCountsHelper_0_imgObjs.js');
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
      const imgObjs = getClickCountsHelper0imgObjs;
      const result = getClickCountsHelper0result;
      const actual = getClickCountsHelper(imgObjs);
      expect(actual).toMatchObject(result);
    });
  });
});
