const getTodo = require('./06_mocks');
jest.mock('fs', () => ({
  readFileSync: (...params) =>
    params
      .filter(param => param !== undefined)
      .reduce(
        (acc, param) => {
          if (typeof param === 'string') return acc[param];
          return acc[JSON.stringify(param)];
        },
        {
          'test_integration/flows/06_mocks/response.json': {
            utf8:
              '{\n  "userId": 1,\n  "id": 1,\n  "title": "delectus aut autem",\n  "completed": false\n}'
          }
        }
      )
}));
describe('06_mocks', () => {
  describe('getTodo', () => {
    it('test 0', () => {
      const result = {
        userId: 1,
        id: 1,
        title: 'delectus aut autem',
        completed: false
      };
      const actual = getTodo();
      expect(actual).toMatchObject(result);
    });
  });
});
