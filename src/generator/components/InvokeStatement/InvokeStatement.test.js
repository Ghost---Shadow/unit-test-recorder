const { InvokeStatement } = require('./InvokeStatement');

describe('InvokeStatement', () => {
  const functionIdentifier = 'functionIdentifier';
  const meta = {
    doesReturnPromise: true,
    paramIds: ['a', 'b'],
  };
  it('should generate code', () => {
    const props = {
      functionIdentifier,
      meta,
    };

    const code = InvokeStatement(props);
    expect(code).toMatchInlineSnapshot(
      '"const actual = await functionIdentifier(a,b)"',
    );
  });
});
