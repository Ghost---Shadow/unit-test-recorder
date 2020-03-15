const getClickCounts = require('./07_large_payload');
const getClickCounts1Result = require('./07_large_payload/getClickCounts_1_result.js');

describe('07_large_payload', () => {
  describe('getClickCounts', () => {
    it('test 0', () => {
      const result = getClickCounts1Result;
      const actual = getClickCounts();
      expect(actual).toMatchObject(result);
    });
  });
});
