const fs = require('fs');
// const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const RecorderManager = require('./manager');
const walker = require('../util/walker');

jest.mock('fs');
// jest.mock('rimraf');
jest.mock('mkdirp');
jest.mock('../util/walker');

console.log = () => null;

describe('RecorderManager', () => {
  describe('getSerializedArray', () => {
    let oldFp;
    beforeAll(() => {
      oldFp = RecorderManager.removeInvalidCaptures;
      RecorderManager.removeInvalidCaptures = () => null; // noop
    });
    afterAll(() => {
      RecorderManager.removeInvalidCaptures = oldFp;
    });
    it('should serialize state into array', () => {
      const data1 = { val: 1 };
      const data2 = { val: 2 };
      RecorderManager.recorderState = {
        'file1.js': data1,
        'file2.js': data2,
      };
      expect(RecorderManager.getSerializedArray()).toMatchInlineSnapshot(`
        Array [
          Object {
            "activityPath": "file1.json",
            "data": "{
          \\"val\\": 1
        }",
          },
          Object {
            "activityPath": "file2.json",
            "data": "{
          \\"val\\": 2
        }",
          },
        ]
      `);
    });
  });
  describe('dumpToDisk', () => {
    let oldFp;
    beforeAll(() => {
      oldFp = RecorderManager.removeInvalidCaptures;
      RecorderManager.removeInvalidCaptures = () => null; // noop
    });
    afterAll(() => {
      RecorderManager.removeInvalidCaptures = oldFp;
    });
    it('should dump state to disk', () => {
      fs.writeFileSync = jest.fn();
      // rimraf.sync = jest.fn();
      mkdirp.sync = jest.fn();
      RecorderManager.recorderState = {
        'dir1/file1.js': 1,
        'dir1/dir2/file2.js': 2,
        'dir2/file3.js': 3,
      };
      RecorderManager.dumpToDisk();
      // expect(rimraf.sync.mock.calls.length).toBe(1);
      expect(mkdirp.sync.mock.calls.length).toBe(3);
      expect(fs.writeFileSync.mock.calls).toEqual([
        ['utr_activity/dir1/file1.json', '1'],
        ['utr_activity/dir1/dir2/file2.json', '2'],
        ['utr_activity/dir2/file3.json', '3']]);
    });
  });
  describe('loadFromDisk', () => {
    let oldFp;
    beforeAll(() => {
      oldFp = RecorderManager.removeInvalidCaptures;
      RecorderManager.removeInvalidCaptures = () => null; // noop
    });
    afterAll(() => {
      RecorderManager.removeInvalidCaptures = oldFp;
    });
    it('should dump state to disk', () => {
      RecorderManager.recorderState = {
        sajdlasjd: 123132, // Pollute it
      };
      fs.existsSync = jest.fn();
      fs.existsSync.mockReturnValueOnce(true);

      fs.readFileSync = jest.fn();
      fs.readFileSync.mockReturnValueOnce('{"val":"1"}');
      fs.readFileSync.mockReturnValueOnce('{"val":"2"}');
      fs.readFileSync.mockReturnValueOnce('{"val":"3"}');

      const filePaths = [
        ['./utr_activity/dir1/file1.json'],
        ['utr_activity/dir1/dir2/file2.json'],
        ['.\\utr_activity\\dir2\\file3.json'],
      ];

      walker.walk = jest.fn();
      walker.walk.mockReturnValueOnce(filePaths.map(fp => fp[0]));

      const expected = {
        'dir1/file1.js': { val: '1' },
        'dir1/dir2/file2.js': { val: '2' },
        'dir2/file3.js': { val: '3' },
      };
      RecorderManager.loadFromDisk();
      expect(fs.readFileSync.mock.calls).toEqual(filePaths);
      expect(RecorderManager.recorderState).toEqual(expected);
    });
    it('should do nothing if directory doesnt exist', () => {
      fs.existsSync = jest.fn();
      fs.existsSync.mockReturnValueOnce(false);
      RecorderManager.loadFromDisk();
      expect(RecorderManager.recorderState).toEqual({});
    });
  });
});
