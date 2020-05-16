const fs = require('fs');
const auxilary1 = require('./auxilary1');
const auxilary2 = require('./auxilary2');

jest.mock('fs');
jest.mock('./auxilary1');
jest.mock('./auxilary2');

const { expContinuationFn } = require('./06_mocks');
const { getTodo } = require('./06_mocks');
const { localMocksTest } = require('./06_mocks');

const expContinuationFn0result = require('./06_mocks/expContinuationFn_0_result.mock.js');
const expContinuationFn0fsReadFileSync0 = require('./06_mocks/expContinuationFn_0_fsReadFileSync0.mock.js');
const getTodo0result = require('./06_mocks/getTodo_0_result.mock.js');
const getTodo0auxilary1Foo40 = require('./06_mocks/getTodo_0_auxilary1Foo40.mock.js');
const getTodo0fsReadFileSync0 = require('./06_mocks/getTodo_0_fsReadFileSync0.mock.js');
const getTodo0fsReadFileSync1 = require('./06_mocks/getTodo_0_fsReadFileSync1.mock.js');

describe('06_mocks', () => {
  describe('expContinuationFn', () => {
    it('should work for case 1', () => {
      let result = expContinuationFn0result;
      fs.readFileSync.mockReturnValueOnce(expContinuationFn0fsReadFileSync0);

      const actual = expContinuationFn();
      expect(actual).toEqual(result);
    });
  });

  describe('getTodo', () => {
    it('should work for case 1', () => {
      let result = getTodo0result;
      auxilary1.foo4.mockReturnValueOnce(getTodo0auxilary1Foo40);
      fs.readFileSync.mockReturnValueOnce(getTodo0fsReadFileSync0);
      fs.readFileSync.mockReturnValueOnce(getTodo0fsReadFileSync1);

      const actual = getTodo();
      expect(actual).toEqual(result);
    });
  });

  describe('localMocksTest', () => {
    it('should work for case 1', async () => {
      let result = 4;
      auxilary1.foo1.mockReturnValueOnce(1);
      auxilary1.foo1.mockReturnValueOnce(1);
      auxilary1.foo2.mockReturnValueOnce(2);

      const actual = await localMocksTest();
      expect(actual).toEqual(result);
    });
  });
});
