const mocksios = (email, request) => new Promise((resolve) => {
  setTimeout(() => {
    resolve({ email, request });
  }, 1);
});

const getSocialInfo = async (email) => {
  const facebookInfo = await mocksios(email, 'facebook');
  const twitterInfo = await mocksios(email, 'twitter');

  return { facebookInfo, twitterInfo };
};

module.exports = getSocialInfo;
