const { getTestFileNameForFile } = require('./misc');

describe('misc', () => {
  describe('getTestFileNameForFile', () => {
    it('should work for windows files', () => {
      const input = 'C:\\foo\\bar.js';
      const expected = 'C:\\foo\\bar.test.js';
      expect(getTestFileNameForFile(input, 'test.js')).toEqual(expected);
    });
    it('should work for unix files', () => {
      const input = '/usr/Desktop/foo/bar.js';
      const expected = '/usr/Desktop/foo/bar.test.js';
      expect(getTestFileNameForFile(input, 'test.js')).toEqual(expected);
    });
  });
});
