const { safeStringify, removeNullCaptures, removeEmptyFiles } = require('./utils/manager-helpers');

// TODO: Use redux
const RecorderManager = {
  recorderState: {},
  clear() {
    this.recorderState = {};
  },
  getSerialized() {
    this.recorderState = removeNullCaptures(this.recorderState);
    this.recorderState = removeEmptyFiles(this.recorderState);
    return safeStringify(this.recorderState);
  },
};

module.exports = RecorderManager;
