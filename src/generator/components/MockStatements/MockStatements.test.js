const prettier = require('prettier');

const { MockStatements } = require('./MockStatements');

describe('MockStatements', () => {
  describe('MockStatements', () => {
    it('should generate code', () => {
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
      const props = {
        fileName: 'dir/file.js',
        mocks,
        relativePath: './',
        packagedArguments: {},
      };

      const code = MockStatements(props);
      const formattedCode = prettier.format(code, {
        singleQuote: true,
        parser: 'babel',
      });
      expect(formattedCode).toMatchInlineSnapshot(`
        "jest.mock('fs', () => {
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
        "
      `);
    });
  });
});
