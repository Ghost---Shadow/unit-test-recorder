const getClickCountsHelper = (requestDataCb) => {
  const imgObjs = requestDataCb();
  const result = imgObjs
    .map(imgObj => ({ ...imgObj, clicks: imgObj.imageId * 100 }));
  return result;
};

const getClickCounts = () => {
  const requestDataCb = () => [...Array(100)].map((_, index) => ({
    imageId: index,
  }));
  return getClickCountsHelper(requestDataCb);
};

module.exports = { getClickCounts, getClickCountsHelper };
