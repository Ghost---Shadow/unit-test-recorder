const { getPost } = require('./05_dependency_injection');
const { getPostComments } = require('./05_dependency_injection');
const { getActiveUserCount } = require('./05_dependency_injection');

describe('05_dependency_injection', () => {
  describe('getPost', () => {
    it('should work for case 1', async () => {
      let dbClient = {
        pool: {}
      };
      let postId = 1;
      let redisCache = null;
      let result = {
        content: {
          title: 'content'
        },
        comments: [
          {
            comment: 'comment 1'
          },
          {
            comment: 'comment 2'
          }
        ],
        votes: 350,
        moderator: [
          {
            comment: 'comment 1'
          },
          {
            comment: 'comment 2'
          }
        ]
      };

      dbClient.query = jest.fn();
      dbClient.query.mockReturnValueOnce({
        title: 'content'
      });
      dbClient.query.mockReturnValueOnce({
        title: 'content'
      });
      dbClient.query.mockReturnValueOnce(42);
      redisCache = jest.fn();
      redisCache.mockReturnValueOnce(350);
      redisCache.mockReturnValueOnce(350);
      dbClient.pool.pooledQuery = jest.fn();
      dbClient.pool.pooledQuery.mockReturnValueOnce([
        {
          comment: 'comment 1'
        },
        {
          comment: 'comment 2'
        }
      ]);
      dbClient.pool.pooledQuery.mockReturnValueOnce([
        {
          comment: 'comment 1'
        },
        {
          comment: 'comment 2'
        }
      ]);
      dbClient.commitSync = jest.fn();
      dbClient.commitSync.mockReturnValueOnce(undefined);
      const actual = await getPost(dbClient, postId, redisCache);
      expect(actual).toMatchObject(result);
    });
  });

  describe('getPostComments', () => {
    it('should work for case 1', async () => {
      let client = {
        pool: {}
      };
      let postId = 1;
      let redisCache = null;
      let result = [
        {
          comment: 'comment 1'
        },
        {
          comment: 'comment 2'
        }
      ];

      redisCache = jest.fn();
      redisCache.mockReturnValueOnce(350);
      client.query = jest.fn();
      client.query.mockReturnValueOnce(42);
      client.pool.pooledQuery = jest.fn();
      client.pool.pooledQuery.mockReturnValueOnce([
        {
          comment: 'comment 1'
        },
        {
          comment: 'comment 2'
        }
      ]);
      const actual = await getPostComments(client, postId, redisCache);
      expect(actual).toEqual(result);
    });
  });

  describe('getActiveUserCount', () => {
    it('should work for case 1', async () => {
      let dbClient = {};
      let botCount = 1;
      let result = 349;

      dbClient.query = jest.fn();
      dbClient.query.mockReturnValueOnce(350);
      const actual = await getActiveUserCount(dbClient, botCount);
      expect(actual).toEqual(result);
    });

    it('should work for case 2', async () => {
      let dbClient = {};
      let botCount = 2;
      let result = 348;

      dbClient.query = jest.fn();
      dbClient.query.mockReturnValueOnce(350);
      const actual = await getActiveUserCount(dbClient, botCount);
      expect(actual).toEqual(result);
    });
  });
});
