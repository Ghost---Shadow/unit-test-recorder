const { bar } = require('./01_module_exports');
const { foo } = require('./01_module_exports');
const { specialParams } = require('./01_module_exports');
const { specialParams2 } = require('./01_module_exports');

describe('01_module_exports', () => {
  describe('bar', () => {
    it('should work for case 1', () => {
      let a = 2;
      let b = 2;
      let result = 0;

      const actual = bar(a, b);
      expect(actual).toEqual(result);
    });
  });

  describe('foo', () => {
    it('should work for case 1', () => {
      let a = 1;
      let b = 2;
      let result = 3;

      const actual = foo(a, b);
      expect(actual).toEqual(result);
    });

    it('should work for case 2', () => {
      let a = 'A';
      let b = 'B';
      let result = 'AB';

      const actual = foo(a, b);
      expect(actual).toEqual(result);
    });
  });

  describe('specialParams', () => {
    it('should work for case 1', () => {
      let a = 1;
      let _obj = {
        b: 1,
        c: 1
      };
      let d = undefined;
      let result = 4;

      const actual = specialParams(a, _obj, d);
      expect(actual).toEqual(result);
    });

    it('should work for case 2', () => {
      let a = 1;
      let _obj = {
        b: 1,
        c: 1
      };
      let d = 2;
      let result = 5;

      const actual = specialParams(a, _obj, d);
      expect(actual).toEqual(result);
    });
  });

  describe('specialParams2', () => {
    it('should work for case 1', () => {
      let a = 1;
      let _obj2 = {
        b: 1,
        c: 1
      };
      let d = undefined;
      let result = 4;

      const actual = specialParams2(a, _obj2, d);
      expect(actual).toEqual(result);
    });
  });
});
