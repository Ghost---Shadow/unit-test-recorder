const getPost = require('./05_dependency_injection');
describe('05_dependency_injection', () => {
  describe('getPost', () => {
    it('test 0', async () => {
      const dbClient = {
        pool: {
          pooledQuery: (...params) =>
            params
              .filter(param => param !== undefined)
              .reduce(
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
              )
        },
        query: (...params) =>
          params
            .filter(param => param !== undefined)
            .reduce(
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
            )
      };
      const postId = 1;
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
        ]
      };
      const actual = await getPost(dbClient, postId);
      expect(actual).toMatchObject(result);
    });
  });
});
