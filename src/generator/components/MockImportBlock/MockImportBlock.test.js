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
    describe('javascript', () => {
      it('should generate code', () => {
        const props = {
          meta: {
            mocks: ['m1', '../dir1/m2', 'm3', '../dir1/m4', 'm5'],
            originalMocks: ['m1', './m2', 'm3', './m4', 'm5'],
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
          const m2 = require('../dir1/m2');
          const m3 = require('m3');
          const m4 = require('../dir1/m4');
          const m5 = require('m5');

          jest.mock('m1');
          jest.mock('../dir1/m2');
          jest.mock('m3');
          jest.mock('../dir1/m4');
          jest.mock('m5');
          "
        `);
      });
    });
    describe('typescript', () => {
      it('should generate code', () => {
        const props = {
          meta: {
            mocks: ['m1', '../dir1/m2', 'm3', '../dir1/m4', 'm5'],
            originalMocks: ['m1', './m2', 'm3', './m4', 'm5'],
          },
          packagedArguments: { isTypescript: true },
        };
        const code = MockImportBlock(props);
        const formattedCode = prettier.format(code, {
          singleQuote: true,
          parser: 'typescript',
        });
        expect(formattedCode).toMatchInlineSnapshot(`
          "import * as m1Original from 'm1';
          import * as m2Original from '../dir1/m2';
          import * as m3Original from 'm3';
          import * as m4Original from '../dir1/m4';
          import * as m5Original from 'm5';

          const m1 = m1Original as any;
          const m2 = m2Original as any;
          const m3 = m3Original as any;
          const m4 = m4Original as any;
          const m5 = m5Original as any;

          jest.mock('m1');
          jest.mock('../dir1/m2');
          jest.mock('m3');
          jest.mock('../dir1/m4');
          jest.mock('m5');
          "
        `);
      });
    });
  });
});
