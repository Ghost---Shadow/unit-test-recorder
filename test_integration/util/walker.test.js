const {
  walk,
} = require('../../src/util/walker');

describe('walker', () => {
  describe('walk', () => {
    it('should return list of all files in directory', () => {
      const allFiles = walk('./test_integration/util/walking_test');
      expect(allFiles).toMatchSnapshot();
    });
  });
});
