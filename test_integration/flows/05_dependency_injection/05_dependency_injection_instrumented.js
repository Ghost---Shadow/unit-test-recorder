const { recorderWrapper } = require('../../../src/recorder');
const getPostContent = (client, postId) =>
  client.testIntegrationFlows05DependencyInjection05DependencyInjectionJsQuery(
    'SELECT * FROM posts WHERE id=?',
    postId
  );

const getPostComments = async (client, postId) => {
  const regionId = await client.testIntegrationFlows05DependencyInjection05DependencyInjectionJsQuery(
    'SELECT region_id FROM regions where post_id=?',
    postId
  );
  return client.pool.testIntegrationFlows05DependencyInjection05DependencyInjectionJsPooledQuery(
    'SELECT * FROM comments WHERE post_id=? AND region_id=?',
    postId,
    regionId
  );
};

const getPost = async (...p) =>
  recorderWrapper(
    {
      path:
        'test_integration/flows/05_dependency_injection/05_dependency_injection.js',
      name: 'getPost',
      paramIds: ['dbClient', 'postId', 'redisCache'],
      injectionWhitelist: ['query', 'pooledQuery', 'commitSync'],
      isDefault: true,
      isEcmaDefault: false,
      isAsync: true
    },
    async (dbClient, postId, redisCache) => {
      await getPostContent(dbClient, postId);
      const content = await getPostContent(dbClient, postId);
      const comments = await getPostComments(dbClient, postId);
      const votes = await redisCache(postId);
      dbClient.testIntegrationFlows05DependencyInjection05DependencyInjectionJsCommitSync();
      return { content, comments, votes };
    },
    ...p
  );

module.exports = getPost;
