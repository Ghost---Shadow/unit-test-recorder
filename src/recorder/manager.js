const _ = require('lodash');

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
  record(address, obj, fallback = {}) {
    try {
      const safeObject = JSON.parse(safeStringify(obj));
      _.set(this, address, safeObject);
    } catch (e) {
      console.error(e);
      _.set(this, address, fallback);
    }
  },
};

module.exports = RecorderManager;
