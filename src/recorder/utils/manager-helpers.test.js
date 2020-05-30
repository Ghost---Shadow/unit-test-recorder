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
    it('should work with arrays', () => {
      const obj = [{ a: 1 }];
      obj[1] = obj;
      expect(safeStringify(obj)).toMatchInlineSnapshot(`
        "[
          {
            \\"a\\": 1
          }
        ]"
      `);
    });
    it('should not coerce array like objects', () => {
      const obj = { 0: 1, 1: 2, 2: 3 };
      expect(safeStringify(obj)).toMatchInlineSnapshot(`
        "{
          \\"0\\": 1,
          \\"1\\": 2,
          \\"2\\": 3
        }"
      `);
    });
    it('should coerce undefined to null', () => {
      const obj = undefined;
      expect(safeStringify(obj)).toMatchInlineSnapshot('"null"');
    });
    it('should work with bools', () => {
      const obj = false;
      expect(safeStringify(obj)).toMatchInlineSnapshot('"false"');
    });
    it('should work with numerics', () => {
      const obj = 1;
      expect(safeStringify(obj)).toMatchInlineSnapshot('"1"');
    });
    it('should work with date', () => {
      const obj = new Date('2020-01-31T18:30:00.000Z');
      expect(safeStringify(obj)).toMatchInlineSnapshot(
        '"\\"2020-01-31T18:30:00.000Z\\""',
      );
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
    it('should not drop meta', () => {
      const recorderState = {
        file1: {
          meta: {},
          exportedFunctions: {},
        },
      };
      expect(removeNullCaptures(recorderState)).toEqual(recorderState);
    });
  });
  describe('removeEmptyFiles', () => {
    it('should remove empty files', () => {
      const recorderState = {
        file1: {
          meta: {},
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
          meta: {},
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
          meta: {},
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
            function5: {
              meta: {},
              captures: [{ injections: {} }],
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
    it('should not drop meta', () => {
      const recorderState = {
        file1: {
          meta: {},
          exportedFunctions: {},
        },
      };
      expect(removeInvalidFunctions(recorderState)).toEqual(recorderState);
    });
  });
});
