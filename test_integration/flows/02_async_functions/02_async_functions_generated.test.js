const { getSocialInfo } = require('./02_async_functions');
const { getFacebookInfo } = require('./02_async_functions');

describe('02_async_functions', () => {
  describe('getSocialInfo', () => {
    it('test 0', async () => {
      let email = 'email';

      let result = {
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

  describe('getFacebookInfo', () => {
    it('test 0', async () => {
      let email = 'email';

      let result = {
        email: 'email',
        request: 'facebook'
      };
      const actual = await getFacebookInfo(email);
      expect(actual).toMatchObject(result);
    });
  });
});
