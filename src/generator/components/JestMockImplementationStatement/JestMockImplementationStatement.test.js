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
  JestMockImplementationStatement,
} = require('./JestMockImplementationStatement');

describe('JestMockImplementationStatement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const meta = {
    path: 'dir/file.js',
    name: 'functionName',
    relativePath: './',
  };
  const captureIndex = 0;
  const innerCaptureIndex = 0;
  const packagedArguments = {};
  const payload = 42;
  const lIdentifier = 'lIdentifier';
  const paramType = 'Number';
  const importIdentifier = 'fs';
  it('should generate code when payload is small', () => {
    jest.spyOn(utils, 'shouldMoveToExternal').mockReturnValueOnce(false);
    const props = {
      meta,
      captureIndex,
      innerCaptureIndex,
      importIdentifier,
      lIdentifier,
      payload,
      paramType,
      packagedArguments,
    };

    const code = JestMockImplementationStatement(props);
    expect(code).toMatchInlineSnapshot(
      '"fs.lIdentifier.mockReturnValueOnce(42)"',
    );
    expect(eda.AggregatorManager.addExternalData.mock.calls.length).toBe(0);
  });
  it('should generate code when payload is large', () => {
    const props = {
      meta,
      captureIndex,
      importIdentifier,
      lIdentifier,
      payload,
      paramType,
      packagedArguments,
    };
    jest.spyOn(utils, 'shouldMoveToExternal').mockReturnValueOnce(true);
    const code = JestMockImplementationStatement(props);
    const path = eda.AggregatorManager.addExternalData.mock.calls[0][0];
    const externalData = eda.AggregatorManager.addExternalData.mock.calls[0][1];
    expect(code).toMatchInlineSnapshot(
      '"fs.lIdentifier.mockReturnValueOnce(functionName0fsLIdentifierundefined)"',
    );
    expect(path).toEqual(meta.path);
    expect(externalData).toMatchInlineSnapshot(`
      Array [
        Object {
          "filePath": "dir/file/functionName_0_fsLIdentifierundefined.mock.js",
          "fileString": "module.exports = 42;
      ",
          "identifier": "functionName0fsLIdentifierundefined",
          "importPath": "./file/functionName_0_fsLIdentifierundefined.mock.js",
        },
      ]
    `);
  });
});
