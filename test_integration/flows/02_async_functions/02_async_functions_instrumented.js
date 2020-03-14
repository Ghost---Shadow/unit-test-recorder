const {
  mockRecorderWrapper,
  recorderWrapper
} = require('../../../src/recorder');
const mocksios = (email, request) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve({ email, request });
    }, 1);
  });

const getSocialInfo = async (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/02_async_functions/02_async_functions.js',
      name: 'getSocialInfo',
      paramIds: 'email',
      isDefault: false,
      isEcmaDefault: false,
      isAsync: true
    },
    async email => {
      const facebookInfo = await mocksios(email, 'facebook');
      const twitterInfo = await mocksios(email, 'twitter');

      return { facebookInfo, twitterInfo };
    },
    ...p
  );

const getFacebookInfo = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/02_async_functions/02_async_functions.js',
      name: 'getFacebookInfo',
      paramIds: 'email',
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false
    },
    email => mocksios(email, 'facebook'),
    ...p
  );

module.exports = { getFacebookInfo, getSocialInfo };
