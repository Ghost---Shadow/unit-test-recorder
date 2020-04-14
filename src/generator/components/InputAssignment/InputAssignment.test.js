const prettier = require('prettier');

const {
  InputAssignment,
  primeObjectForInjections,
} = require('./InputAssignment');

describe('InputAssignment', () => {
  describe('InputAssignment', () => {
    const meta = {
      path: 'dir/file.js',
      name: 'functionName',
      relativePath: './',
      paramIds: ['a', 'b'],
    };
    const packagedArguments = {};
    const captureIndex = 0;
    const capture = {
      params: [1, 2],
      result: 3,
      types: {
        params: ['Number', 'Number'],
        result: 'Number',
      },
    };
    it('should generate code when payload is small', () => {
      const props = {
        capture,
        meta,
        captureIndex,
        packagedArguments,
      };

      const code = InputAssignment(props);
      const formattedCode = prettier.format(code, {
        singleQuote: true,
        parser: 'babel',
      });
      expect(formattedCode).toMatchInlineSnapshot(`
        "let a = 1;
        let b = 2;
        let result = 3;
        "
      `);
    });
  });
  describe('primeObjectForInjections', () => {
    it('should add extra dependencies', () => {
      const obj = {};
      const paramId = 'obj1';
      const injections = {
        'obj1.foo': {},
        'obj1.bar.__proto__.baz': {},
        'obj2.faz': {},
      };
      const expected = { bar: {} };
      expect(primeObjectForInjections(obj, paramId, injections)).toEqual(
        expected,
      );
    });
    it('should not crash for non-object likes', () => {
      const obj = 2;
      const paramId = 'obj1';
      const injections = {
        'obj1.foo': {},
        'obj1.bar.__proto__.baz': {},
        'obj2.faz': {},
      };
      const expected = 2;
      expect(primeObjectForInjections(obj, paramId, injections)).toEqual(
        expected,
      );
    });
    it('should not if injections is undefined for null', () => {
      const obj = {};
      const paramId = 'obj1';
      const injections = null;
      const expected = {};
      expect(primeObjectForInjections(obj, paramId, injections)).toEqual(
        expected,
      );
    });
  });
});
