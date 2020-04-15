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
  MockFunctionStubBlock,
} = require('./MockFunctionStubBlock');

describe('MockFunctionStubBlock', () => {
  const meta = {
    path: 'dir/file.js',
    name: 'functionName',
    relativePath: './',
  };
  const captureIndex = 0;
  const packagedArguments = {};
  beforeEach(() => {
    jest.clearAllMocks();
  });
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
  };
  const props = {
    meta,
    captureIndex,
    packagedArguments,
    capture,
  };
  it('should generate code when payload is small', () => {
    jest.spyOn(utils, 'shouldMoveToExternal').mockReturnValue(false);
    const code = MockFunctionStubBlock(props);
    expect(code).toMatchInlineSnapshot(`
        "iid1.fn1.mockReturnValueOnce(1)
        iid1.fn1.mockReturnValueOnce(2)
        iid2.fn2.mockReturnValueOnce(3)
        iid2.fn3.mockReturnValueOnce(4)"
      `);
    expect(eda.AggregatorManager.addExternalData.mock.calls.length).toBe(0);
  });
  it('should generate code when payload is large', () => {
    jest.spyOn(utils, 'shouldMoveToExternal').mockReturnValue(true);
    const code = MockFunctionStubBlock(props);
    const path = eda.AggregatorManager.addExternalData.mock.calls[0][0];
    const externalData = eda.AggregatorManager.addExternalData.mock.calls;
    expect(code).toMatchInlineSnapshot(`
        "iid1.fn1.mockReturnValueOnce(functionName0iid1Fn10)
        iid1.fn1.mockReturnValueOnce(functionName0iid1Fn11)
        iid2.fn2.mockReturnValueOnce(functionName0iid2Fn20)
        iid2.fn3.mockReturnValueOnce(functionName0iid2Fn30)"
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
    const code = MockFunctionStubBlock(props1);
    expect(code).toMatchInlineSnapshot('""');
  });
});
