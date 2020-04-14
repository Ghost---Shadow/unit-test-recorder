const { InputAssignment } = require('./InputAssignment');

describe('InputAssignment', () => {
  const meta = {
    path: 'dir/file.js',
    name: 'functionName',
    relativePath: './',
    paramIds: ['a', 'b'],
  };
  const packagedArguments = {};
  const testIndex = 0;
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
      testIndex,
      packagedArguments,
    };

    const code = InputAssignment(props);
    expect(code).toMatchInlineSnapshot(`
      "let a = 1
      let b = 2"
    `);
  });
});
