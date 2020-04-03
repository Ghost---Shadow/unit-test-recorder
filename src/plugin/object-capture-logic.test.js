const { default: generate } = require('@babel/generator');

const { memberExpressionFromFqn } = require('./object-capture-logic');

describe('object-capture-logic', () => {
  describe('memberExpressionFromFqn', () => {
    it('should generate appropriate code', () => {
      const ast = memberExpressionFromFqn('foo.bar.baz');
      const { code } = generate(ast);
      expect(code).toMatchInlineSnapshot('"foo.bar.baz"');
    });
  });
});
