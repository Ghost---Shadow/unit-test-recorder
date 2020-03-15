const getClickCounts = () => [...Array(100)].map((_, index) => ({
  imageId: index,
  clicks: index * 100,
}));

module.exports = getClickCounts;
