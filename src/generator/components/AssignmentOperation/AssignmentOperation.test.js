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

const { AssignmentOperation } = require('./AssignmentOperation');

describe('AssignmentOperation', () => {
  describe('javascript', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const meta = {
      path: 'dir/file.js',
      name: 'functionName',
      relativePath: './',
    };
    const packagedArguments = {};
    const maybeObject = 42;
    const lIdentifier = 'lIdentifier';
    const captureIndex = 0;
    const paramType = 'Number';
    it('should generate code when payload is small', () => {
      jest.spyOn(utils, 'shouldMoveToExternal').mockReturnValueOnce(false);
      const props = {
        meta,
        packagedArguments,
        maybeObject,
        lIdentifier,
        captureIndex,
        paramType,
      };

      const code = AssignmentOperation(props);
      expect(code).toMatchInlineSnapshot('"let lIdentifier = 42"');
      expect(eda.AggregatorManager.addExternalData.mock.calls.length).toBe(0);
    });
    it('should generate code when payload is large', () => {
      const props = {
        meta,
        packagedArguments,
        maybeObject,
        lIdentifier,
        captureIndex,
        paramType,
      };
      jest.spyOn(utils, 'shouldMoveToExternal').mockReturnValueOnce(true);
      const code = AssignmentOperation(props);
      const path = eda.AggregatorManager.addExternalData.mock.calls[0][0];
      const externalData = eda.AggregatorManager.addExternalData.mock.calls[0][1];
      expect(code).toMatchInlineSnapshot(
        '"let lIdentifier = functionName0lIdentifier"',
      );
      expect(path).toEqual(meta.path);
      expect(externalData).toMatchInlineSnapshot(`
              Array [
                Object {
                  "filePath": "dir/file/functionName_0_lIdentifier.mock.js",
                  "fileString": "module.exports = 42;
              ",
                  "identifier": "functionName0lIdentifier",
                  "importPath": "./file/functionName_0_lIdentifier.mock",
                },
              ]
          `);
    });
  });
  describe('typescript', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const meta = {
      path: 'dir/file.js',
      name: 'functionName',
      relativePath: './',
    };
    const packagedArguments = { isTypescript: true };
    const maybeObject = 42;
    const lIdentifier = 'lIdentifier';
    const captureIndex = 0;
    const paramType = 'Number';
    it('should generate code when payload is small', () => {
      jest.spyOn(utils, 'shouldMoveToExternal').mockReturnValueOnce(false);
      const props = {
        meta,
        packagedArguments,
        maybeObject,
        lIdentifier,
        captureIndex,
        paramType,
      };

      const code = AssignmentOperation(props);
      expect(code).toMatchInlineSnapshot(
        '"let lIdentifier = 42 as any"',
      );
      expect(eda.AggregatorManager.addExternalData.mock.calls.length).toBe(0);
    });
    it('should generate code when payload is large', () => {
      const props = {
        meta,
        packagedArguments,
        maybeObject,
        lIdentifier,
        captureIndex,
        paramType,
      };
      jest.spyOn(utils, 'shouldMoveToExternal').mockReturnValueOnce(true);
      const code = AssignmentOperation(props);
      const path = eda.AggregatorManager.addExternalData.mock.calls[0][0];
      const externalData = eda.AggregatorManager.addExternalData.mock.calls[0][1];
      expect(code).toMatchInlineSnapshot(
        '"let lIdentifier = functionName0lIdentifier as any"',
      );
      expect(path).toEqual(meta.path);
      expect(externalData).toMatchInlineSnapshot(`
        Array [
          Object {
            "filePath": "dir/file/functionName_0_lIdentifier.mock.js",
            "fileString": "export default 42;
        ",
            "identifier": "functionName0lIdentifier",
            "importPath": "./file/functionName_0_lIdentifier.mock",
          },
        ]
      `);
    });
  });
});
