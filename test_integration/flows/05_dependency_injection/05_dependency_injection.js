const getPostContent = (client, postId) => client.query('SELECT * FROM posts WHERE id=?', postId);

const getPostComments = async (client, postId) => {
  const regionId = await client.query('SELECT region_id FROM regions where post_id=?', postId);
  return client.pool.pooledQuery('SELECT * FROM comments WHERE post_id=? AND region_id=?', postId, regionId);
};

const getPost = async (dbClient, postId, redisCache) => {
  const content = await getPostContent(dbClient, postId);
  const comments = await getPostComments(dbClient, postId);
  const votes = await redisCache(postId);
  dbClient.commitSync();
  return { content, comments, votes };
};

module.exports = getPost;
