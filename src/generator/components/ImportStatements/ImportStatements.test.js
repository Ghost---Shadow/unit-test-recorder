const prettier = require('prettier');

const { ImportStatements } = require('./ImportStatements');

jest.mock('../../external-data-aggregator', () => ({
  AggregatorManager: { getExternalData: jest.fn() },
}));

const { AggregatorManager } = require('../../external-data-aggregator');

describe('ImportStatements', () => {
  describe('ImportStatements', () => {
    it('should generate code', () => {
      const exportedFunctions = {
        fun1: {
          meta: {
            isDefault: false,
            isEcmaDefault: false,
            importPath: './fun1',
          },
        },
        fun2: {
          meta: {
            isDefault: true,
            isEcmaDefault: false,
            importPath: './fun2',
          },
        },
        fun3: {
          meta: {
            isDefault: false,
            isEcmaDefault: true,
            importPath: './fun3',
          },
        },
        'obj.fun4': {
          meta: {
            isDefault: false,
            isEcmaDefault: false,
            importPath: './fun4',
          },
        },
      };
      const path = 'dir1/file.js';
      const packagedArguments = {};
      const props = { exportedFunctions, path, packagedArguments };

      AggregatorManager.getExternalData.mockReturnValueOnce([
        { importPath: 'dir1/foo.mock.js', identifier: 'foo' },
        { importPath: 'dir1/bar.mock.js', identifier: 'bar' },
        { importPath: 'dir1/baz.mock.js', identifier: 'baz', isMock: true },
      ]);

      const code = ImportStatements(props);
      const formattedCode = prettier.format(code, {
        singleQuote: true,
        parser: 'babel',
      });
      expect(formattedCode).toMatchInlineSnapshot(`
        "const { fun1 } = require('./fun1');
        const fun2 = require('./fun2');
        const { default: fun3 } = require('./fun3');
        const { obj } = require('./fun4');

        const foo = require('dir1/foo.mock.js');
        const bar = require('dir1/bar.mock.js');
        "
      `);
    });
    it('should generate code for typescript', () => {
      const exportedFunctions = {
        fun1: {
          meta: {
            isDefault: false,
            isEcmaDefault: false,
            importPath: './fun1',
          },
        },
        fun2: {
          meta: {
            isDefault: true,
            isEcmaDefault: false,
            importPath: './fun2',
          },
        },
        fun3: {
          meta: {
            isDefault: false,
            isEcmaDefault: true,
            importPath: './fun3',
          },
        },
        'obj.fun4': {
          meta: {
            isDefault: false,
            isEcmaDefault: false,
            importPath: './fun4',
          },
        },
      };
      const path = 'dir1/file.js';
      const packagedArguments = { isTypescript: true };
      const props = { exportedFunctions, path, packagedArguments };

      AggregatorManager.getExternalData.mockReturnValueOnce([
        { importPath: 'dir1/foo.mock.js', identifier: 'foo' },
        { importPath: 'dir1/bar.mock.js', identifier: 'bar' },
        { importPath: 'dir1/baz.mock.js', identifier: 'baz', isMock: true },
      ]);

      const code = ImportStatements(props);
      const formattedCode = prettier.format(code, {
        singleQuote: true,
        parser: 'babel',
      });
      expect(formattedCode).toMatchInlineSnapshot(`
        "import { fun1 } from './fun1';
        import * as fun2 from './fun2';
        import fun3 from './fun3';
        import { obj } from './fun4';

        import foo from 'dir1/foo.mock.js';
        import bar from 'dir1/bar.mock.js';
        "
      `);
    });
  });
});
