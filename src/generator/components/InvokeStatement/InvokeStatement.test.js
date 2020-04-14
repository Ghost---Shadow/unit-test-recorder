const { InvokeStatement } = require('./InvokeStatement');

describe('InvokeStatement', () => {
  const meta = {
    doesReturnPromise: true,
    paramIds: ['a', 'b'],
    name: 'functionIdentifier',
  };
  it('should generate code', () => {
    const props = { meta };

    const code = InvokeStatement(props);
    expect(code).toMatchInlineSnapshot(
      '"const actual = await functionIdentifier(a,b)"',
    );
  });
});
