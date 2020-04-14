const prettier = require('prettier');

const { TestFileBlock } = require('./TestFileBlock');

jest.mock('../../external-data-aggregator', () => ({
  AggregatorManager: { getExternalData: jest.fn() },
}));

const { AggregatorManager } = require('../../external-data-aggregator');

describe('TestFileBlock', () => {
  const filePath = 'dir/file.js';
  const meta = {
    path: filePath,
    name: 'functionName',
    relativePath: './',
    paramIds: ['a', 'b'],
    importPath: './functionName',
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
  const mocks = {
    fs: {
      readFileSync: {
        captures: [
          {
            params: ['a'],
            result: ['a'],
            types: {
              params: ['String'],
              result: 'String',
            },
          },
        ],
      },
    },
  };
  const functionActivity = { meta, captures: [capture, capture] };
  it('should generate code', () => {
    AggregatorManager.getExternalData.mockReturnValueOnce([
      { importPath: 'dir1/foo.mock.js', identifier: 'foo' },
      { importPath: 'dir1/bar.mock.js', identifier: 'bar' },
      { importPath: 'dir1/baz.mock.js', identifier: 'baz', isMock: true },
    ]);

    const props = {
      fileName: 'file',
      filePath,
      fileData: {
        mocks,
        exportedFunctions: {
          [meta.name]: functionActivity,
        },
        relativePath: './',
      },
      packagedArguments,
    };

    const code = TestFileBlock(props);
    const formattedCode = prettier.format(code, {
      singleQuote: true,
      parser: 'babel',
    });
    expect(formattedCode).toMatchInlineSnapshot(`
      "const { functionName } = require('./functionName');

      const foo = require('dir1/foo.mock.js');
      const bar = require('dir1/bar.mock.js');

      jest.mock('fs', () => {
        return {
          readFileSync: (...params) => {
            const safeParams = params.length === 0 ? [undefined] : params;
            return safeParams.reduce(
              (acc, param) => {
                if (typeof param === 'string') return acc[param];
                const stringifiedParam = JSON.stringify(param);
                if (stringifiedParam && stringifiedParam.length > 10000)
                  return acc['KEY_TOO_LARGE'];
                return acc[stringifiedParam];
              },
              {
                a: ['a']
              }
            );
          }
        };
      });
      describe('file', () => {
        describe('functionName', () => {
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
      });
      "
    `);
  });
});
