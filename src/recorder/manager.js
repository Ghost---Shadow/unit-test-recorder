const { safeStringify } = require('./utils');

// TODO: Use redux
const RecorderManager = {
  recorderState: {},
  clear() {
    this.recorderState = {};
  },
  getSerialized() {
    return safeStringify(this.recorderState);
  },
};

module.exports = RecorderManager;
