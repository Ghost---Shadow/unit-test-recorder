const { DependencyInjectionMocking } = require('./DependencyInjectionMocking');
const eda = require('../../external-data-aggregator');

jest.mock('../../external-data-aggregator', () => ({
  addExternalData: jest.fn(),
}));

describe('DependencyInjectionMocking', () => {
  const meta = {
    path: 'dir/file.js',
    name: 'functionName',
    relativePath: './',
    paramIds: ['obj'],
  };
  const packagedArguments = {
    sizeLimit: 1e3,
  };
  const testIndex = 0;
  const capture = {
    params: [{}],
    result: 3,
    injections: {
      'dbClient.__proto__.pool.__proto__.query': {
        captures: [
          {
            params: ['SELECT * FROM posts WHERE id=?', 1],
            result: {
              title: 'content',
            },
            types: {
              params: ['String', 'Number'],
              result: 'Object',
            },
          },
        ],
      },
    },
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

    const code = DependencyInjectionMocking(props);
    const externalData = eda.addExternalData.mock.calls[0][0];
    expect(externalData).toMatchInlineSnapshot('Array []');
    expect(code).toMatchInlineSnapshot(`
      "dbClient.pool.query = 
        (...params) => {
          const safeParams = params.length === 0 ? [undefined] : params
          return safeParams.reduce((acc, param) => {
            if(typeof(param) === 'string') return acc[param]
            const stringifiedParam = JSON.stringify(param)
            if(stringifiedParam && stringifiedParam.length > 10000) return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam]
          },{
        \\"SELECT * FROM posts WHERE id=?\\": {
          \\"1\\": {
            \\"title\\": \\"content\\"
          }
        }
      })
        }
        ;"
    `);
  });
});