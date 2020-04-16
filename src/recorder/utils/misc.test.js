const { shouldRecordStubParams } = require('./misc');

describe('recorder.misc', () => {
  describe('shouldRecordStubParams', () => {
    it('should work if boolean like', () => {
      process.env.UTR_RECORD_STUB_PARAMS = true;
      expect(shouldRecordStubParams()).toBe(true);
      process.env.UTR_RECORD_STUB_PARAMS = false;
      expect(shouldRecordStubParams()).toBe(false);
    });
    it('should work if string like', () => {
      process.env.UTR_RECORD_STUB_PARAMS = 'true';
      expect(shouldRecordStubParams()).toBe(true);
      process.env.UTR_RECORD_STUB_PARAMS = 'false';
      expect(shouldRecordStubParams()).toBe(false);
    });
    it('should work if undefined', () => {
      process.env.UTR_RECORD_STUB_PARAMS = undefined;
      expect(shouldRecordStubParams()).toBe(false);
    });
  });
});
