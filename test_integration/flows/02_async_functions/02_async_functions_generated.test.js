const getSocialInfo = require('./02_async_functions');

describe('02_async_functions', () => {
  describe('getSocialInfo', () => {
    it('test 0', async () => {
      const email = 'email';
      const result = {
        facebookInfo: {
          email: 'email',
          request: 'facebook'
        },
        twitterInfo: {
          email: 'email',
          request: 'twitter'
        }
      };
      const actual = await getSocialInfo(email);
      expect(actual).toMatchObject(result);
    });
  });
});
