const getClickCountsHelper = (imgObjs) => {
  const result = imgObjs
    .map(imgObj => ({ ...imgObj, clicks: imgObj.imageId * 100 }));
  return result;
};

const getClickCounts = () => {
  const imgObjs = [...Array(100)].map((_, index) => ({
    imageId: index,
  }));
  return getClickCountsHelper(imgObjs);
};

module.exports = { getClickCounts, getClickCountsHelper };
