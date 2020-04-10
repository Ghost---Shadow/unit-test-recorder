const { primeObjectForInjections } = require('./statement-helpers');

describe('statement-helpers', () => {
  describe('primeObjectForInjections', () => {
    it('should add extra dependencies', () => {
      const obj = {};
      const paramId = 'obj1';
      const injections = { 'obj1.foo': {}, 'obj1.bar.__proto__.baz': {}, 'obj2.faz': {} };
      const expected = { bar: { } };
      expect(primeObjectForInjections(obj, paramId, injections)).toEqual(expected);
    });
    it('should not crash for non-object likes', () => {
      const obj = 2;
      const paramId = 'obj1';
      const injections = { 'obj1.foo': {}, 'obj1.bar.__proto__.baz': {}, 'obj2.faz': {} };
      const expected = 2;
      expect(primeObjectForInjections(obj, paramId, injections)).toEqual(expected);
    });
    it('should not if injections is undefined for null', () => {
      const obj = {};
      const paramId = 'obj1';
      const injections = null;
      const expected = { };
      expect(primeObjectForInjections(obj, paramId, injections)).toEqual(expected);
    });
  });
});
