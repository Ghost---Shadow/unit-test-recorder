const { default: traverse } = require('@babel/traverse');
const parser = require('@babel/parser');

const { parserPlugins } = require('./used-plugins');

const { captureFunForDi } = require('./capture-logic');

describe('capture-logic', () => {
  describe('captureFunForDi', () => {
    it('should capture typescript exports', () => {
      const outerFun = 'outerFun';
      const injFun = 'injFun';
      const code = `exports.${outerFun} = obj => obj.${injFun}();`;
      const visitor = {
        Program: {
          enter() {
            this.injectionBlackList = {};
            this.injectedFunctions = {};
            this.captureFunForDi = captureFunForDi.bind(this);
          },
          exit() {
            expect(this.injectedFunctions[injFun][outerFun].paths).toBeTruthy();
          },
        },
        CallExpression(path) {
          this.captureFunForDi(path);
        },
      };
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: parserPlugins,
      });
      traverse(ast, visitor, null, {});
    });
  });
});
