const {
  mockRecorderWrapper,
  recorderWrapper
} = require('../../../src/recorder');
const getClickCounts = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/07_large_payload/07_large_payload.js',
      name: 'getClickCounts',
      paramIds: '',
      isDefault: true,
      isEcmaDefault: false,
      isAsync: false
    },
    () =>
      [...Array(100)].map((_, index) => ({
        imageId: index,
        clicks: index * 100
      })),
    ...p
  );

module.exports = getClickCounts;
