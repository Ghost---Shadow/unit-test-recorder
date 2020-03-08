var { recorderWrapper } = require('../../../src/recorder');
const getPostContent = (client, postId) =>
  client.query('SELECT * FROM posts WHERE id=?', postId);

const getPostComments = (client, postId) => {
  const regionId = client.query(
    'SELECT region_id FROM regions where post_id=?',
    postId
  );
  return client.pool.pooledQuery(
    'SELECT * FROM comments WHERE post_id=? AND region_id=?',
    postId,
    regionId
  );
};

const getPost = (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/05_dependency_injection/05_dependency_injection.js',
      name: 'getPost',
      paramIds: 'dbClient,postId',
      isDefault: true,
      isEcmaDefault: false
    },
    (dbClient, postId) => {
      const content = getPostContent(dbClient, postId);
      const comments = getPostComments(dbClient, postId);
      return { content, comments };
    },
    ...p
  );

module.exports = getPost;
