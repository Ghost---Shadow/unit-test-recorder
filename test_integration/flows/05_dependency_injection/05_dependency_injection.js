const getPostContent = (client, postId) => client.query('SELECT * FROM posts WHERE id=?', postId);

const getPostComments = (client, postId) => {
  const regionId = client.query('SELECT region_id FROM regions where post_id=?', postId);
  return client.pool.pooledQuery('SELECT * FROM comments WHERE post_id=? AND region_id=?', postId, regionId);
};

const getPost = (dbClient, postId) => {
  const content = getPostContent(dbClient, postId);
  const comments = getPostComments(dbClient, postId);
  return { content, comments };
};

module.exports = getPost;
