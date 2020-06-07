const { getTestFileNameForFile } = require('./misc');

describe('misc', () => {
  describe('getTestFileNameForFile', () => {
    it('should work for windows files', () => {
      const input = 'C:\\foo\\bar.js';
      const expected = 'C:\\foo\\bar.test.js';
      const testExt = 'test';

      expect(getTestFileNameForFile(input, { testExt })).toEqual(expected);
    });
    it('should work for unix files', () => {
      const input = '/usr/Desktop/foo/bar.js';
      const expected = '/usr/Desktop/foo/bar.spec.js';
      const testExt = 'spec';

      expect(getTestFileNameForFile(input, { testExt })).toEqual(expected);
    });
    it('should work for typescript', () => {
      const input = '/usr/Desktop/foo/bar.ts';
      const expected = '/usr/Desktop/foo/bar.spec.ts';
      const testExt = 'spec';

      expect(getTestFileNameForFile(input, { testExt, isTypescript: true })).toEqual(expected);
    });
  });
});
