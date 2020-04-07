const {
  checkIfDirectoryShouldBeIgnored,
  checkIfFileShouldBeIgnored,
  filterFiles,
} = require('./walker');

describe('walker', () => {
  describe('checkIfDirectoryShouldBeIgnored', () => {
    it('should ignore node_modules', () => {
      expect(checkIfDirectoryShouldBeIgnored('node_modules/blah')).toBeTruthy();
    });
  });
  describe('checkIfFileShouldBeIgnored', () => {
    it('should accept js and jsx files', () => {
      expect(checkIfFileShouldBeIgnored('/asdasd/blah.js')).toBeFalsy();
      expect(checkIfFileShouldBeIgnored('/asdasd/blah.jsx')).toBeFalsy();
      expect(checkIfFileShouldBeIgnored('test\\walking_test\\a.js')).toBeFalsy();
      expect(checkIfFileShouldBeIgnored('C:\\Users\\username\\Desktop\\i18ize\\captive-app\\src\\App.js')).toBeFalsy();
    });
    it('should reject spec and test files', () => {
      expect(checkIfFileShouldBeIgnored('a.test.js')).toBeTruthy();
      expect(checkIfFileShouldBeIgnored('b.spec.js')).toBeTruthy();
    });
    it('should reject all other files', () => {
      expect(checkIfFileShouldBeIgnored('not_a_virus.exe')).toBeTruthy();
    });
  });
  describe('filterFiles', () => {
    it('should filter out entrypoint', () => {
      const packagedArguments = {
        entryPoint: 'entrypoint.js',
        exceptFiles: [],
        onlyFiles: [],
      };
      const allFiles = ['entrypoint.js', 'dir1/file1.js', 'dir2/file2.js'];
      const expected = ['dir1/file1.js', 'dir2/file2.js'];
      expect(filterFiles(packagedArguments, allFiles)).toEqual(expected);
    });
    it('should filter out except files', () => {
      const packagedArguments = {
        entryPoint: 'entrypoint.js',
        exceptFiles: ['dir1/file2.js', 'dir2/file2.js'],
        onlyFiles: [],
      };
      const allFiles = ['entrypoint.js', 'dir1/file1.js', 'dir1/file2.js', 'dir2/file2.js'];
      const expected = ['dir1/file1.js'];
      expect(filterFiles(packagedArguments, allFiles)).toEqual(expected);
    });
    it('should filter in only files', () => {
      const packagedArguments = {
        entryPoint: 'entrypoint.js',
        exceptFiles: [],
        onlyFiles: ['dir1/file2.js', 'dir2/file2.js'],
      };
      const allFiles = ['entrypoint.js', 'dir1/file1.js', 'dir1/file2.js', 'dir2/file2.js'];
      const expected = ['dir1/file2.js', 'dir2/file2.js'];
      expect(filterFiles(packagedArguments, allFiles)).toEqual(expected);
    });
    it('should prioritize except over only', () => {
      const packagedArguments = {
        entryPoint: 'entrypoint.js',
        exceptFiles: ['dir2/file2.js'],
        onlyFiles: ['dir1/file2.js', 'dir2/file2.js'],
      };
      const allFiles = ['entrypoint.js', 'dir1/file1.js', 'dir1/file2.js', 'dir2/file2.js'];
      const expected = ['dir1/file2.js'];
      expect(filterFiles(packagedArguments, allFiles)).toEqual(expected);
    });
  });
});
