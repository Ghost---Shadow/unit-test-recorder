const getClickCounts = require('./07_large_payload');
const getClickCounts0result = require('./07_large_payload/getClickCounts_0_result.js');

describe('07_large_payload', () => {
  describe('getClickCounts', () => {
    it('test 0', () => {
      const result = getClickCounts0result;
      const actual = getClickCounts();
      expect(actual).toMatchObject(result);
    });
  });
});
