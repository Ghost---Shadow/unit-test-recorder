const { exportTest1 } = require('./09_typescript_exports');
const { default: exportTest2 } = require('./09_typescript_exports');
const { exportTest3 } = require('./09_typescript_exports');
const { fetchFromDb } = require('./09_typescript_exports');

describe('09_typescript_exports', () => {
  describe('exportTest1', () => {
    it('should work for case 1', () => {
      let a = 2;
      let result = 2;

      const actual = exportTest1(a);
      expect(actual).toEqual(result);
    });
  });

  describe('exportTest2', () => {
    it('should work for case 1', () => {
      let a = 3;
      let result = 'b => [a, b]';

      const actual = exportTest2(a);
      expect(actual.toString()).toEqual(result);
    });
  });

  describe('exportTest3', () => {
    it('should work for case 1', () => {
      let a = 4;
      let result = 8;

      const actual = exportTest3(a);
      expect(actual).toEqual(result);
    });
  });

  describe('fetchFromDb', () => {
    it('should work for case 1', () => {
      let client = {};
      let result = {
        rows: [
          {
            a: 42
          }
        ]
      };

      client.query = jest.fn();
      client.query.mockReturnValueOnce({
        rows: [
          {
            a: 42
          }
        ]
      });
      const actual = fetchFromDb(client);
      expect(actual).toMatchObject(result);
    });
  });
});
