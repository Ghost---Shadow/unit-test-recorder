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
  });
});
