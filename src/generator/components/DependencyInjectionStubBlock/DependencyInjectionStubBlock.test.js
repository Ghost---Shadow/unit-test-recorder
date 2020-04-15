jest.mock('../../utils', () => {
  const actualUtils = jest.requireActual('../../utils');
  const originalImplementation = actualUtils.shouldMoveToExternal;

  return {
    ...actualUtils,
    shouldMoveToExternal: jest.fn().mockImplementation(originalImplementation),
  };
});
jest.mock('../../external-data-aggregator', () => ({
  AggregatorManager: { addExternalData: jest.fn() },
}));

const utils = require('../../utils');
const eda = require('../../external-data-aggregator');

const {
  DependencyInjectionStubBlock,
} = require('./DependencyInjectionStubBlock');

describe('DependencyInjectionStubBlock', () => {
  const meta = {
    path: 'dir/file.js',
    name: 'functionName',
    relativePath: './',
    paramIds: ['obj'],
  };
  const packagedArguments = {};
  const captureIndex = 0;
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
  const props = {
    capture,
    captureIndex,
    meta,
    packagedArguments,
  };
  it('should generate code when payload is small', () => {
    jest.spyOn(utils, 'shouldMoveToExternal').mockReturnValue(false);
    const code = DependencyInjectionStubBlock(props);
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
    expect(eda.AggregatorManager.addExternalData.mock.calls.length).toBe(0);
  });
  it('should generate code when payload is large', () => {
    jest.spyOn(utils, 'shouldMoveToExternal').mockReturnValue(true);
    const code = DependencyInjectionStubBlock(props);
    const path = eda.AggregatorManager.addExternalData.mock.calls[0][0];
    const externalData = eda.AggregatorManager.addExternalData.mock.calls;
    expect(code).toMatchInlineSnapshot(`
      "dbClient.pool.query = 
        (...params) => {
          const safeParams = params.length === 0 ? [undefined] : params
          return safeParams.reduce((acc, param) => {
            if(typeof(param) === 'string') return acc[param]
            const stringifiedParam = JSON.stringify(param)
            if(stringifiedParam && stringifiedParam.length > 10000) return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam]
          },functionName0dbClientPoolQuery)
        }
        ;"
    `);
    expect(path).toEqual(meta.path);
    expect(externalData).toMatchInlineSnapshot(`
      Array [
        Array [
          "dir/file.js",
          Array [
            Object {
              "filePath": "dir/file/functionName_0_dbClientPoolQuery.mock.js",
              "fileString": "module.exports = {
        'SELECT * FROM posts WHERE id=?': {
          '1': {
            title: 'content'
          }
        }
      };
      ",
              "identifier": "functionName0dbClientPoolQuery",
              "importPath": "./file/functionName_0_dbClientPoolQuery.mock.js",
            },
          ],
        ],
      ]
    `);
  });
  it('should return empty string if no mocks', () => {
    const props1 = {
      meta,
      captureIndex,
      packagedArguments,
      capture: {},
    };
    const code = DependencyInjectionStubBlock(props1);
    expect(code).toMatchInlineSnapshot('""');
  });
});
