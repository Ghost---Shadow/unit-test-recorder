const {
  recorderWrapper,
  asyncRecorderWrapper
} = require('../../../src/recorder');
const getPostContent = (client, postId) =>
  client.query('SELECT * FROM posts WHERE id=?', postId);

const getPostComments = async (client, postId) => {
  const regionId = await client.query(
    'SELECT region_id FROM regions where post_id=?',
    postId
  );
  return client.pool.pooledQuery(
    'SELECT * FROM comments WHERE post_id=? AND region_id=?',
    postId,
    regionId
  );
};

const getPost = async (...p) =>
  asyncRecorderWrapper(
    {
      path:
        'test_integration/flows/05_dependency_injection/05_dependency_injection.js',
      name: 'getPost',
      paramIds: 'dbClient,postId',
      isDefault: true,
      isEcmaDefault: false,
      isAsync: true
    },
    async (dbClient, postId) => {
      const content = await getPostContent(dbClient, postId);
      const comments = await getPostComments(dbClient, postId);
      return { content, comments };
    },
    ...p
  );

module.exports = getPost;
