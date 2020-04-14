const prettier = require('prettier');

const { DescribeFunctionBlock } = require('./DescribeFunctionBlock');

describe('DescribeFunctionBlock', () => {
  const meta = {
    path: 'dir/file.js',
    name: 'functionName',
    relativePath: './',
    paramIds: ['a', 'b'],
  };
  const packagedArguments = {};
  const capture = {
    params: [1, 2],
    result: 3,
    types: {
      params: ['Number', 'Number'],
      result: 'Number',
    },
  };
  const activity = { meta, captures: [capture, capture] };
  it('should generate code', () => {
    const props = {
      activity,
      packagedArguments,
    };

    const code = DescribeFunctionBlock(props);
    const formattedCode = prettier.format(code, {
      singleQuote: true,
      parser: 'babel',
    });
    expect(formattedCode).toMatchInlineSnapshot(`
      "describe('functionName', () => {
        it('should work for case 1', () => {
          let a = 1;
          let b = 2;
          let result = 3;

          const actual = functionName(a, b);
          expect(actual).toEqual(result);
        });

        it('should work for case 2', () => {
          let a = 1;
          let b = 2;
          let result = 3;

          const actual = functionName(a, b);
          expect(actual).toEqual(result);
        });
      });
      "
    `);
  });
});
