const prettier = require('prettier');

const { JestMockStatement, MockImportBlock } = require('./MockImportBlock');

describe('MockImportBlock', () => {
  describe('JestMockStatement', () => {
    it('should generate code', () => {
      const props = { importPath: 'fs' };
      const code = JestMockStatement(props);
      expect(code).toMatchInlineSnapshot("\"jest.mock('fs');\"");
    });
  });
  describe('MockImportBlock', () => {
    it('should generate code', () => {
      const props = {
        meta: {
          mocks: ['m1', 'm2', 'm3', 'm4', 'm5'],
        },
        packagedArguments: {},
      };
      const code = MockImportBlock(props);
      const formattedCode = prettier.format(code, {
        singleQuote: true,
        parser: 'babel',
      });
      expect(formattedCode).toMatchInlineSnapshot(`
        "const m1 = require('m1');
        const m2 = require('m2');
        const m3 = require('m3');
        const m4 = require('m4');
        const m5 = require('m5');

        jest.mock('m1');
        jest.mock('m2');
        jest.mock('m3');
        jest.mock('m4');
        jest.mock('m5');
        "
      `);
    });
  });
});
