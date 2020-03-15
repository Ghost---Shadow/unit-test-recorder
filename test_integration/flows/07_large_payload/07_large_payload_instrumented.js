const {
  mockRecorderWrapper,
  recorderWrapper
} = require('../../../src/recorder');
const getClickCountsHelper = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/07_large_payload/07_large_payload.js',
      name: 'getClickCountsHelper',
      paramIds: 'imgObjs',
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    imgObjs => {
      const result = imgObjs.map(imgObj => ({
        ...imgObj,
        clicks: imgObj.imageId * 100
      }));
      return result;
    },
    ...p
  );

const getClickCounts = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/07_large_payload/07_large_payload.js',
      name: 'getClickCounts',
      paramIds: '',
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    () => {
      const imgObjs = [...Array(100)].map((_, index) => ({
        imageId: index
      }));

      return getClickCountsHelper(imgObjs);
    },
    ...p
  );

module.exports = { getClickCounts, getClickCountsHelper };
