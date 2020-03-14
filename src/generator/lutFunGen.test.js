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
      ];
      expect(captureArrayToLutFun(captures)).toMatchInlineSnapshot(`
        "(...params) =>
          params
            .filter(param => param !== undefined)
            .reduce(
              (acc, param) => {
                if (typeof param === 'string') return acc[param]
                return acc[JSON.stringify(param)]
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
                'foo.exe': 'yep'
              }
            )
        "
      `);
    });
  });
});
