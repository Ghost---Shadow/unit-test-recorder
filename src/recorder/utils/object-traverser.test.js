const { traverse, traverseBfs } = require('./object-traverser');

const degenerate = (iterator) => {
  const arr = [];
  for (
    let path = iterator.next().value;
    path !== undefined;
    path = iterator.next().value
  ) {
    arr.push(path);
  }
  return arr;
};

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
      const paths = degenerate(traverse(obj));
      expect(paths).toEqual([
        ['fun'],
        ['__proto__', 'fun'],
        ['__proto__', '__proto__', 'fun']]);
    });
    it('should list all paths excluding prototypes when flagged', () => {
      const obj = {
        fun: () => 'baz',
        __proto__: {
          fun: () => 'foo',
          __proto__: {
            fun: () => 'bar',
          },
        },
      };
      const paths = degenerate(traverse(obj, false));
      expect(paths).toEqual([
        ['fun'],
      ]);
    });
    it('should not crash if getter throws exception', () => {
      console.error = () => null;
      const obj = {
        get foo() {
          throw new Error('sample');
        },
      };
      const paths = degenerate(traverse(obj));
      expect(paths).toEqual([]);
    });
    it('should not crash if object is cyclic', () => {
      const obj = { a: 1, bar: {} };
      obj.obj = obj;
      obj.bar.obj = obj;
      const paths = degenerate(traverse(obj));
      expect(paths).toEqual([['a']]);
    });
    it('should not remove if duplicate references', () => {
      const inner = { a: 1 };
      const outer = { foo: inner, bar: inner };
      const paths = degenerate(traverse(outer));
      expect(paths).toEqual([
        ['foo', 'a'],
        ['bar', 'a'],
      ]);
    });
    it('should handle arrays correctly', () => {
      const arr = [{ a: 1 }, 3, [1, 2, [3, 4]]];
      const paths = degenerate(traverse(arr));
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
      const paths = degenerate(traverse(obj));
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
      const paths = degenerate(traverse(obj));
      expect(paths).toEqual([
        [0, 'a'],
      ]);
    });
    describe('empty likes', () => {
      it('should not crash for empty objects', () => {
        const paths = degenerate(traverse({}));
        expect(paths).toEqual([]);
      });
      it('should not crash for empty arrays', () => {
        const paths = degenerate(traverse([]));
        expect(paths).toEqual([]);
      });
      it('should not crash for primitives', () => {
        const paths = degenerate(traverse(1));
        expect(paths).toEqual([]);
      });
    });
  });
  describe('traverseBfs', () => {
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
      const paths = degenerate(traverseBfs(obj));
      expect(paths).toEqual([
        ['fun'],
        ['__proto__', 'fun'],
        ['__proto__', '__proto__', 'fun']]);
    });
    it('should list all paths excluding prototypes when flagged', () => {
      const obj = {
        fun: () => 'baz',
        __proto__: {
          fun: () => 'foo',
          __proto__: {
            fun: () => 'bar',
          },
        },
      };
      const paths = degenerate(traverseBfs(obj, [], false));
      expect(paths).toEqual([
        ['fun'],
      ]);
    });
    it('should not crash if getter throws exception', () => {
      console.error = () => null;
      const obj = {
        get foo() {
          throw new Error('sample');
        },
      };
      const paths = degenerate(traverseBfs(obj));
      expect(paths).toEqual([]);
    });
    it('should not crash if object is cyclic', () => {
      const obj = { a: 1, bar: {} };
      obj.obj = obj;
      obj.bar.obj = obj;
      const paths = degenerate(traverseBfs(obj));
      expect(paths).toEqual([['a']]);
    });
    it('should not remove if duplicate references', () => {
      const inner = { a: 1 };
      const outer = { foo: inner, bar: inner };
      const paths = degenerate(traverseBfs(outer));
      expect(paths).toEqual([
        ['foo', 'a'],
        ['bar', 'a'],
      ]);
    });
    it('should handle arrays correctly', () => {
      const arr = [{ a: 1 }, 3, [1, 2, [3, 4]]];
      const paths = degenerate(traverseBfs(arr));
      expect(paths).toEqual([
        [1],
        [0, 'a'],
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
      const paths = degenerate(traverseBfs(obj));
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
      const paths = degenerate(traverseBfs(obj));
      expect(paths).toEqual([
        [0, 'a'],
      ]);
    });
    it('should early exit if all leaves are found', () => {
      const leavesToFind = ['fun', 'fun2'];
      const obj = {
        fun: () => null,
        a: {
          arr: [{ a: { fun2: () => null } }],
          b: { c: {}, d: { e: { f: {} } } },
        },
      };
      const paths = degenerate(traverseBfs(obj, leavesToFind));
      expect(paths).toEqual([
        ['fun'],
        ['a', 'b', 'c'],
        ['a', 'arr', 0, 'a', 'fun2'],
        // ['a', 'b', 'd', 'e', 'f'],
      ]);
    });
    describe('empty likes', () => {
      it('should not crash for empty objects', () => {
        const paths = degenerate(traverseBfs({}));
        expect(paths).toEqual([]);
      });
      it('should not crash for empty arrays', () => {
        const paths = degenerate(traverseBfs([]));
        expect(paths).toEqual([]);
      });
      it('should not crash for primitives', () => {
        const paths = degenerate(traverseBfs(1));
        expect(paths).toEqual([]);
      });
    });
  });
});
