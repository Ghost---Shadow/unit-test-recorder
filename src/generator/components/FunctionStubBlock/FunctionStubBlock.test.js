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

const { FunctionStubBlock } = require('./FunctionStubBlock');

describe('FunctionStubBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const meta = {
    path: 'dir/file.js',
    name: 'functionName',
    relativePath: './',
  };
  const captureIndex = 0;
  const packagedArguments = {};
  const capture = {
    mocks: {
      iid1: {
        fn1: {
          captures: [
            { result: 1, types: { result: 'Number' } },
            { result: 2, types: { result: 'Number' } },
          ],
        },
      },
      iid2: {
        fn2: { captures: [{ result: 3, types: { result: 'Number' } }] },
        fn3: { captures: [{ result: 4, types: { result: 'Number' } }] },
      },
    },
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
  };
  const props = {
    meta,
    captureIndex,
    packagedArguments,
    capture,
  };
  it('should generate code when payload is small', () => {
    jest.spyOn(utils, 'shouldMoveToExternal').mockReturnValue(false);
    const code = FunctionStubBlock(props);
    expect(code).toMatchInlineSnapshot(`
      "iid1.fn1.mockReturnValueOnce(1)
      iid1.fn1.mockReturnValueOnce(2)
      iid2.fn2.mockReturnValueOnce(3)
      iid2.fn3.mockReturnValueOnce(4)
      dbClient.pool.query = 
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
    const code = FunctionStubBlock(props);
    const path = eda.AggregatorManager.addExternalData.mock.calls[0][0];
    const externalData = eda.AggregatorManager.addExternalData.mock.calls;
    expect(code).toMatchInlineSnapshot(`
      "iid1.fn1.mockReturnValueOnce(functionName0iid1Fn10)
      iid1.fn1.mockReturnValueOnce(functionName0iid1Fn11)
      iid2.fn2.mockReturnValueOnce(functionName0iid2Fn20)
      iid2.fn3.mockReturnValueOnce(functionName0iid2Fn30)
      dbClient.pool.query = 
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
              "filePath": "dir/file/functionName_0_iid1Fn10.mock.js",
              "fileString": "module.exports = 1;
      ",
              "identifier": "functionName0iid1Fn10",
              "importPath": "./file/functionName_0_iid1Fn10.mock.js",
            },
          ],
        ],
        Array [
          "dir/file.js",
          Array [
            Object {
              "filePath": "dir/file/functionName_0_iid1Fn11.mock.js",
              "fileString": "module.exports = 2;
      ",
              "identifier": "functionName0iid1Fn11",
              "importPath": "./file/functionName_0_iid1Fn11.mock.js",
            },
          ],
        ],
        Array [
          "dir/file.js",
          Array [
            Object {
              "filePath": "dir/file/functionName_0_iid2Fn20.mock.js",
              "fileString": "module.exports = 3;
      ",
              "identifier": "functionName0iid2Fn20",
              "importPath": "./file/functionName_0_iid2Fn20.mock.js",
            },
          ],
        ],
        Array [
          "dir/file.js",
          Array [
            Object {
              "filePath": "dir/file/functionName_0_iid2Fn30.mock.js",
              "fileString": "module.exports = 4;
      ",
              "identifier": "functionName0iid2Fn30",
              "importPath": "./file/functionName_0_iid2Fn30.mock.js",
            },
          ],
        ],
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
    const code = FunctionStubBlock(props1);
    expect(code).toMatchInlineSnapshot(`
      "
      "
    `);
  });
});
