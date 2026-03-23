const fs = require('fs');

jest.mock('fs');

const { getCompletedTodos } = require('./19_demo');
const { getTodos } = require('./19_demo');
const { saveTodos } = require('./19_demo');

describe('19_demo', () => {
  describe('getCompletedTodos', () => {
    it('should work for case 1', () => {
      let todos = [
        {
          done: true,
          title: 'Get eggs'
        },
        {
          done: false,
          title: 'Boil eggs'
        }
      ];
      let result = [
        {
          done: true,
          title: 'Get eggs'
        }
      ];

      const actual = getCompletedTodos(todos);
      expect(actual).toEqual(result);
    });
  });

  describe('getTodos', () => {
    it('should work for case 1', () => {
      let result = [
        {
          done: true,
          title: 'Get eggs'
        },
        {
          done: false,
          title: 'Boil eggs'
        }
      ];
      fs.readFileSync.mockReturnValueOnce(
        '[\n  {\n    "title": "Get eggs",\n    "done": true\n  },\n  {\n    "title": "Boil eggs",\n    "done": false\n  }\n]'
      );

      const actual = getTodos();
      expect(actual).toEqual(result);
    });
  });

  describe('saveTodos', () => {
    it('should work for case 1', async () => {
      let dbClient = {};
      let result = {
        message: '1 rows added'
      };
      fs.readFileSync.mockReturnValueOnce(
        '[\n  {\n    "title": "Get eggs",\n    "done": true\n  },\n  {\n    "title": "Boil eggs",\n    "done": false\n  }\n]'
      );
      dbClient.bulkInsert = jest.fn();
      dbClient.bulkInsert.mockReturnValueOnce({
        message: '1 rows added'
      });
      const actual = await saveTodos(dbClient);
      expect(actual).toMatchObject(result);
    });
  });
});
