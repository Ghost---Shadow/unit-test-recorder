const shouldRecordStubParams = () => {
  try {
    return !!JSON.parse(process.env.UTR_RECORD_STUB_PARAMS);
  } catch (e) {
    return false;
  }
};

module.exports = { shouldRecordStubParams };
