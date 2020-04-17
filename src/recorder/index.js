const RecorderManager = require('./manager');
const { mockRecorderWrapper } = require('./mock');
const { recorderWrapper } = require('./user-functions');
const { recordFileMeta } = require('./file-meta');

module.exports = {
  recorderWrapper,
  mockRecorderWrapper,
  RecorderManager,
  recordFileMeta,
};
