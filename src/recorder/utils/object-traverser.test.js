const { traverse } = require('./object-traverser');

describe('object-traverser', () => {
  describe('traverse', () => {
    it('should list all paths including prototypes', () => {
      const obj = {
        fun: () => 'baz',
        __proto__: {
          fun: () => 'foo',
          __proto__: {
            fun: () => 'bar',
          },
        },
      };
      const paths = traverse(obj);
      expect(paths).toEqual([
        ['fun'],
        ['__proto__', 'fun'],
        ['__proto__', '__proto__', 'fun']]);
    });
    it('should not crash if getter throws exception', () => {
      console.error = () => null;
      const obj = {
        get foo() {
          throw new Error('sample');
        },
      };
      const paths = traverse(obj);
      expect(paths).toEqual([]);
    });
    it('should not crash if object is cyclic', () => {
      const obj = { a: 1, bar: {} };
      obj.obj = obj;
      obj.bar.obj = obj;
      const paths = traverse(obj);
      expect(paths).toEqual([['a']]);
    });
    it('should not remove if duplicate references', () => {
      const inner = { a: 1 };
      const outer = { foo: inner, bar: inner };
      const paths = traverse(outer);
      expect(paths).toEqual([
        ['foo', 'a'],
        ['bar', 'a'],
      ]);
    });
    it('should handle arrays correctly', () => {
      const arr = [{ a: 1 }, 3, [1, 2, [3, 4]]];
      const paths = traverse(arr);
      expect(paths).toEqual([
        [0, 'a'],
        [1],
        [2, 0],
        [2, 1],
        [2, 2, 0],
        [2, 2, 1],
      ]);
    });
    it('should retain paths to empty objects and arrays', () => {
      const obj = {
        a: {},
        b: [],
        c: [[]],
        d: { e: {} },
      };
      const paths = traverse(obj);
      expect(paths).toEqual([
        ['a'],
        ['b'],
        ['c', 0],
        ['d', 'e'],
      ]);
    });
    it('should handle cyclic arraylike structures', () => {
      const obj = [{ a: 1 }];
      obj[1] = obj;
      const paths = traverse(obj);
      expect(paths).toEqual([
        [0, 'a'],
      ]);
    });
    describe('empty likes', () => {
      it('should not crash for empty objects', () => {
        const paths = traverse({});
        expect(paths).toEqual([]);
      });
      it('should not crash for empty arrays', () => {
        const paths = traverse([]);
        expect(paths).toEqual([]);
      });
      it('should not crash for primitives', () => {
        const paths = traverse(1);
        expect(paths).toEqual([]);
      });
    });
  });
});
