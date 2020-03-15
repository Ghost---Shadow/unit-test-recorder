const prettier = require('prettier');
const { captureArrayToLutFun } = require('./lutFunGen');

describe('lutFunGen', () => {
  describe('captureArrayToLutFun', () => {
    it('should work for happy path', () => {
      const captures = [
        { params: [1, 2], result: 1 },
        { params: [3], result: 3 },
        { params: ['a', 'b'], result: 'c' },
        { params: [{ foo: 'bar' }, 'd'], result: 'e' },
        { params: ['foo.exe'], result: 'yep' },
        { params: [], result: { loo: 'car' } },
      ];
      const code = prettier.format(captureArrayToLutFun(captures), {
        singleQuote: true,
        parser: 'babel',
      });
      expect(code).toMatchInlineSnapshot(`
        "(...params) => {
          const safeParams = params.length === 0 ? [undefined] : params;
          return safeParams.reduce(
            (acc, param) => {
              if (typeof param === 'string') return acc[param];
              return acc[JSON.stringify(param)];
            },
            {
              '1': {
                '2': 1
              },
              '3': 3,
              a: {
                b: 'c'
              },
              '{\\"foo\\":\\"bar\\"}': {
                d: 'e'
              },
              'foo.exe': 'yep',
              undefined: {
                loo: 'car'
              }
            }
          );
        };
        "
      `);
      // eslint-disable-next-line
      const fn = eval(code);
      captures.forEach((capture) => {
        expect(fn(...capture.params)).toEqual(capture.result);
      });
    });
  });
});
