const auxilary = require('./auxilary');

jest.mock('./auxilary');

const { fun } = require('./18_record_stub_params');

describe('18_record_stub_params', () => {
  describe('fun', () => {
    it('should work for case 1', () => {
      let obj = {};
      let result = 3;
      auxilary.fun.mockReturnValueOnce(2);
      obj.fun = jest.fn();
      obj.fun.mockReturnValueOnce(1);
      const actual = fun(obj);
      expect(actual).toEqual(result);
    });
  });
});
