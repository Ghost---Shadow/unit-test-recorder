const { recorderWrapper } = require('../../../src/recorder');
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
      isDefault: true,
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

module.exports = getSocialInfo;
