const { getPost } = require('./05_dependency_injection');
const { getPostComments } = require('./05_dependency_injection');

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
      dbClient.query = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce(
          (acc, param) => {
            if (typeof param === 'string') return acc[param];
            const stringifiedParam = JSON.stringify(param);
            if (stringifiedParam && stringifiedParam.length > 10000)
              return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam];
          },
          {
            'SELECT * FROM posts WHERE id=?': {
              '1': {
                title: 'content'
              }
            },
            'SELECT region_id FROM regions where post_id=?': {
              '1': 42
            }
          }
        );
      };
      redisCache = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce(
          (acc, param) => {
            if (typeof param === 'string') return acc[param];
            const stringifiedParam = JSON.stringify(param);
            if (stringifiedParam && stringifiedParam.length > 10000)
              return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam];
          },
          {
            '1': 350,
            '2': 350
          }
        );
      };
      dbClient.pool.pooledQuery = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce(
          (acc, param) => {
            if (typeof param === 'string') return acc[param];
            const stringifiedParam = JSON.stringify(param);
            if (stringifiedParam && stringifiedParam.length > 10000)
              return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam];
          },
          {
            'SELECT * FROM comments WHERE post_id=? AND region_id=? AND votes=?': {
              '1': {
                '42': {
                  '350': [
                    {
                      comment: 'comment 1'
                    },
                    {
                      comment: 'comment 2'
                    }
                  ]
                }
              }
            },
            'SELECT * FROM users WHERE moderator=true AND postid=?': {
              '1': [
                {
                  comment: 'comment 1'
                },
                {
                  comment: 'comment 2'
                }
              ]
            }
          }
        );
      };
      dbClient.commitSync = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce((acc, param) => {
          if (typeof param === 'string') return acc[param];
          const stringifiedParam = JSON.stringify(param);
          if (stringifiedParam && stringifiedParam.length > 10000)
            return acc['KEY_TOO_LARGE'];
          return acc[stringifiedParam];
        }, {});
      };
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
      redisCache = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce(
          (acc, param) => {
            if (typeof param === 'string') return acc[param];
            const stringifiedParam = JSON.stringify(param);
            if (stringifiedParam && stringifiedParam.length > 10000)
              return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam];
          },
          {
            '1': 350,
            '2': 350
          }
        );
      };
      client.query = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce(
          (acc, param) => {
            if (typeof param === 'string') return acc[param];
            const stringifiedParam = JSON.stringify(param);
            if (stringifiedParam && stringifiedParam.length > 10000)
              return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam];
          },
          {
            'SELECT region_id FROM regions where post_id=?': {
              '1': 42
            }
          }
        );
      };
      client.pool.pooledQuery = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce(
          (acc, param) => {
            if (typeof param === 'string') return acc[param];
            const stringifiedParam = JSON.stringify(param);
            if (stringifiedParam && stringifiedParam.length > 10000)
              return acc['KEY_TOO_LARGE'];
            return acc[stringifiedParam];
          },
          {
            'SELECT * FROM comments WHERE post_id=? AND region_id=? AND votes=?': {
              '1': {
                '42': {
                  '350': [
                    {
                      comment: 'comment 1'
                    },
                    {
                      comment: 'comment 2'
                    }
                  ]
                }
              }
            },
            'SELECT * FROM users WHERE moderator=true AND postid=?': {
              '1': [
                {
                  comment: 'comment 1'
                },
                {
                  comment: 'comment 2'
                }
              ]
            }
          }
        );
      };
      client.commitSync = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce((acc, param) => {
          if (typeof param === 'string') return acc[param];
          const stringifiedParam = JSON.stringify(param);
          if (stringifiedParam && stringifiedParam.length > 10000)
            return acc['KEY_TOO_LARGE'];
          return acc[stringifiedParam];
        }, {});
      };
      const actual = await getPostComments(client, postId, redisCache);
      expect(actual).toEqual(result);
    });
  });
});
