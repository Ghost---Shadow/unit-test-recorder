const { safeStringify } = require('./utils');

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
  });
});
