const RecorderManager = require('./manager');
const { mockRecorderWrapper } = require('./mock');
const { recorderWrapper } = require('./user-functions');

module.exports = {
  recorderWrapper,
  mockRecorderWrapper,
  RecorderManager,
};
