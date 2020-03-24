const { generateHashForParam, doesParamExist } = require('./hash-helper');

describe('hash-helper', () => {
  describe('generateHashForParam', () => {
    it('should generate hash for serializeable params', () => {
      const params = [1, 2, 'a', 'b'];
      expect(generateHashForParam(params)).toMatchInlineSnapshot(
        '"bcenZxMdEYCh1WrmLQe3aA=="',
      );
    });
    it('should generate hash for non-serializeable params', () => {
      const obj = { a: 1 };
      obj.obj = obj;
      const params = [obj];
      expect(generateHashForParam(params)).toMatchInlineSnapshot(
        '"doPDmaA/Mx07jt0IoImW9A=="',
      );
    });
  });
  describe('doesParamExist', () => {
    it('should check if hash exists in table', () => {
      const params = [1, 2, 'a', 'b'];
      const hashTable = { 'bcenZxMdEYCh1WrmLQe3aA==': true };
      expect(doesParamExist(hashTable, params)).toBeTruthy();
    });
  });
});
