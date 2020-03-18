const getPost = require('./05_dependency_injection');

describe('05_dependency_injection', () => {
  describe('getPost', () => {
    it('test 0', async () => {
      const dbClient = {
        __proto__: {
          __proto__: {
            pool: {}
          }
        },
        query: (...params) => {
          const safeParams = params.length === 0 ? [undefined] : params;
          return safeParams.reduce(
            (acc, param) => {
              if (typeof param === 'string') return acc[param];
              return acc[JSON.stringify(param)];
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
        },
        pool: {
          pooledQuery: (...params) => {
            const safeParams = params.length === 0 ? [undefined] : params;
            return safeParams.reduce(
              (acc, param) => {
                if (typeof param === 'string') return acc[param];
                return acc[JSON.stringify(param)];
              },
              {
                'SELECT * FROM comments WHERE post_id=? AND region_id=?': {
                  '1': {
                    '42': [
                      {
                        comment: 'comment 1'
                      },
                      {
                        comment: 'comment 2'
                      }
                    ]
                  }
                }
              }
            );
          }
        }
      };
      const postId = 1;
      const redisCache = (...params) => {
        const safeParams = params.length === 0 ? [undefined] : params;
        return safeParams.reduce(
          (acc, param) => {
            if (typeof param === 'string') return acc[param];
            return acc[JSON.stringify(param)];
          },
          {
            '1': 350
          }
        );
      };

      const result = {
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
        votes: 350
      };
      const actual = await getPost(dbClient, postId, redisCache);
      expect(actual).toMatchObject(result);
    });
  });
});
