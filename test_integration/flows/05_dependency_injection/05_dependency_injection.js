const getPostContent = (client, postId) => client.query('SELECT * FROM posts WHERE id=?', postId);

const getPostComments = async (client, postId, redisCache) => {
  const votes = await redisCache(postId + 1);
  const regionId = await client.query('SELECT region_id FROM regions where post_id=?', postId);
  return client.pool.pooledQuery('SELECT * FROM comments WHERE post_id=? AND region_id=? AND votes=?', postId, regionId, votes);
};

const getPost = async (dbClient, postId, redisCache) => {
  await getPostContent(dbClient, postId);
  const content = await getPostContent(dbClient, postId);
  const comments = await getPostComments(dbClient, postId, redisCache);
  const votes = await redisCache(postId);
  dbClient.commitSync();
  return { content, comments, votes };
};

module.exports = { getPost, getPostComments };
