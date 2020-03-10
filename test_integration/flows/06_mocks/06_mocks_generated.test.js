const { default: getTodo } = require('./06_mocks');
describe('06_mocks', () => {
  describe('getTodo', () => {
    it('test 0', async () => {
      const id = 1;
      const result = {
        userId: 1,
        id: 1,
        title: 'delectus aut autem',
        completed: false
      };
      const actual = await getTodo(id);
      expect(actual).toMatchObject(result);
    });
  });
});
