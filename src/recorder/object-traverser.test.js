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
  });
});
