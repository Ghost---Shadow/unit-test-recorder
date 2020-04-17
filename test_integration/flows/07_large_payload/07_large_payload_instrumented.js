const { recordFileMeta } = require('../../../src/recorder');
const { recorderWrapper } = require('../../../src/recorder');
const getClickCountsHelper = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/07_large_payload/07_large_payload.js',
      name: 'getClickCountsHelper',
      paramIds: ['requestDataCb'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    requestDataCb => {
      const imgObjs = requestDataCb();
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
      paramIds: [],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    () => {
      const requestDataCb = () =>
        [...Array(100)].map((_, index) => ({
          imageId: index
        }));

      return getClickCountsHelper(requestDataCb);
    },
    ...p
  );

module.exports = { getClickCounts, getClickCountsHelper };
recordFileMeta({
  path: 'test_integration/flows/07_large_payload/07_large_payload.js',
  mocks: []
});
