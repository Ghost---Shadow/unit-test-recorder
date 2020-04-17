const RecorderManager = require('./manager');

const recordFileMeta = (meta) => {
  try {
    // console.log(meta);
    const { path } = meta;
    const address = ['recorderState', path, 'meta'];
    RecorderManager.record(address, meta, { path });
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  recordFileMeta,
};
