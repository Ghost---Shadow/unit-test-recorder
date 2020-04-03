const {
  safeStringify,
  removeNullCaptures,
  removeEmptyFiles,
  removeInvalidFunctions,
} = require('./utils/manager-helpers');

// TODO: Use redux
const RecorderManager = {
  recorderState: {},
  clear() {
    this.recorderState = {};
  },
  getSerialized() {
    this.recorderState = removeNullCaptures(this.recorderState);
    this.recorderState = removeEmptyFiles(this.recorderState);
    this.recorderState = removeInvalidFunctions(this.recorderState);
    return safeStringify(this.recorderState);
  },
};

module.exports = RecorderManager;
