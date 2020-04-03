const {
  safeStringify,
  removeNullCaptures,
  removeEmptyFiles,
  removeInvalidFunctions,
} = require('./manager-helpers');

describe('recorder.utils', () => {
  describe('safeStringify', () => {
    it('should stringify cycles', () => {
      const obj = { a: 1 };
      obj.obj = obj;
      expect(safeStringify(obj)).toMatchInlineSnapshot(`
        "{
          \\"a\\": 1
        }"
      `);
    });
    it('should not drop non cycles', () => {
      const obj1 = { a: 1 };
      const obj = { foo: obj1, bar: obj1 };
      expect(safeStringify(obj)).toMatchInlineSnapshot(`
        "{
          \\"foo\\": {
            \\"a\\": 1
          },
          \\"bar\\": {
            \\"a\\": 1
          }
        }"
      `);
    });
    it('should retain path to functions', () => {
      const obj = { a: { b: { c: () => {} } } };
      expect(safeStringify(obj)).toMatchInlineSnapshot(`
        "{
          \\"a\\": {
            \\"b\\": {}
          }
        }"
      `);
    });
  });
  describe('removeNullCaptures', () => {
    it('should remove null captures', () => {
      const recorderState = {
        file1: {
          exportedFunctions: {
            function1: {
              meta: {},
              captures: [
                { params: [], result: 1 },
                null,
                { params: [], result: 2 },
                null,
              ],
            },
          },
        },
      };
      const expected = {
        file1: {
          exportedFunctions: {
            function1: {
              meta: {},
              captures: [
                { params: [], result: 1 },
                { params: [], result: 2 },
              ],
            },
          },
        },
      };
      expect(removeNullCaptures(recorderState)).toEqual(expected);
    });
  });
  describe('removeEmptyFiles', () => {
    it('should remove empty files', () => {
      const recorderState = {
        file1: {
          exportedFunctions: {
            function1: {
              meta: {},
              captures: [],
            },
            function2: {
              meta: {},
              captures: [{ params: [], result: null }],
            },
          },
        },
        file2: {
          exportedFunctions: {
            function1: {
              meta: {},
              captures: [],
            },
            function2: {
              meta: {},
              captures: [],
            },
          },
        },
      };
      const expected = {
        file1: {
          exportedFunctions: {
            function1: {
              meta: {},
              captures: [],
            },
            function2: {
              meta: {},
              captures: [{ params: [], result: null }],
            },
          },
        },
      };
      expect(removeEmptyFiles(recorderState)).toEqual(expected);
    });
  });
  describe('removeInvalidFunctions', () => {
    it('should remove invalid functions', () => {
      const recorderState = {
        file1: {
          exportedFunctions: {
            function1: {
              captures: [{}],
            },
            function2: {
              meta: {},
              captures: [{ params: [], result: null }],
            },
            function3: {
              meta: {},
            },
            function4: {
              meta: {},
              captures: [],
            },
          },
        },
      };
      const expected = {
        file1: {
          exportedFunctions: {
            function2: {
              meta: {},
              captures: [{ params: [], result: null }],
            },
          },
        },
      };
      expect(removeInvalidFunctions(recorderState)).toEqual(expected);
    });
  });
});
