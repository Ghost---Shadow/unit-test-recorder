const { ExpectStatement } = require('./ExpectStatement');

describe('ExpectStatement', () => {
  it('should generate code when result is Number', () => {
    const capture = {
      types: {
        result: 'Number',
      },
    };
    const props = { capture };
    const code = ExpectStatement(props);
    expect(code).toMatchInlineSnapshot('"expect(actual).toEqual(result)"');
  });
  it('should generate code when result is Object', () => {
    const capture = {
      types: {
        result: 'Object',
      },
    };
    const props = { capture };
    const code = ExpectStatement(props);
    expect(code).toMatchInlineSnapshot(
      '"expect(actual).toMatchObject(result)"',
    );
  });
  it('should generate code when result is Function', () => {
    const capture = {
      types: {
        result: 'Function',
      },
    };
    const props = { capture };
    const code = ExpectStatement(props);
    expect(code).toMatchInlineSnapshot(
      '"expect(actual.toString()).toEqual(result)"',
    );
  });
});
