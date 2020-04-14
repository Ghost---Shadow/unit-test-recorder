const prettier = require('prettier');

const { ItBlock } = require('./ItBlock');

describe('ItBlock', () => {
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
  it('should generate code', () => {
    const props = {
      meta,
      captureIndex,
      functionIdentifier: 'functionName',
      packagedArguments,
      capture,
    };

    const code = ItBlock(props);
    const formattedCode = prettier.format(code, {
      singleQuote: true,
      parser: 'babel',
    });
    expect(formattedCode).toMatchInlineSnapshot(`
      "it('should work for case 1', () => {
        let a = 1;
        let b = 2;
        let result = 3;

        const actual = functionName(a, b);
        expect(actual).toEqual(result);
      });
      "
    `);
  });
});
