const { foo } = require('./01_module_exports');
const { bar } = require('./01_module_exports');
const { specialParams } = require('./01_module_exports');
const { specialParams2 } = require('./01_module_exports');

describe('01_module_exports', () => {
  describe('foo', () => {
    it('test 0', () => {
      const a = 1;
      const b = 2;
      const result = 3;
      const actual = foo(a, b);
      expect(actual).toEqual(result);
    });

    it('test 1', () => {
      const a = 'A';
      const b = 'B';
      const result = 'AB';
      const actual = foo(a, b);
      expect(actual.toString()).toEqual(result);
    });

    it('test 2', () => {
      const a = 2;
      const b = 1;
      const result = 3;
      const actual = foo(a, b);
      expect(actual).toEqual(result);
    });
  });

  describe('bar', () => {
    it('test 0', () => {
      const a = 2;
      const b = 2;
      const result = 0;
      const actual = bar(a, b);
      expect(actual).toEqual(result);
    });
  });

  describe('specialParams', () => {
    it('test 0', () => {
      const a = 1;
      const _obj = {
        b: 1,
        c: 1
      };
      const d = undefined;
      const result = 4;
      const actual = specialParams(a, _obj, d);
      expect(actual).toEqual(result);
    });

    it('test 1', () => {
      const a = 1;
      const _obj = {
        b: 1,
        c: 1
      };
      const d = 2;
      const result = 5;
      const actual = specialParams(a, _obj, d);
      expect(actual).toEqual(result);
    });
  });

  describe('specialParams2', () => {
    it('test 0', () => {
      const a = 1;
      const _obj2 = {
        b: 1,
        c: 1
      };
      const d = undefined;
      const result = 4;
      const actual = specialParams2(a, _obj2, d);
      expect(actual).toEqual(result);
    });
  });
});
