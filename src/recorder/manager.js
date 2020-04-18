const fs = require('fs');
const path = require('path');

const _ = require('lodash');
// const rimraf = require('rimraf');
const mkdirp = require('mkdirp');

const walker = require('../util/walker');

const {
  safeStringify,
  removeNullCaptures,
  removeEmptyFiles,
  removeInvalidFunctions,
} = require('./utils/manager-helpers');

// TODO: Get from CLI args
const DEFAULT_BASE_PATH = './utr_activity';

// TODO: Use redux
const RecorderManager = {
  recorderState: {},
  clear() {
    this.recorderState = {};
  },
  removeInvalidCaptures() {
    this.recorderState = removeNullCaptures(this.recorderState);
    this.recorderState = removeEmptyFiles(this.recorderState);
    this.recorderState = removeInvalidFunctions(this.recorderState);
  },
  getSerialized() {
    this.removeInvalidCaptures();
    // This JSON should be serializeable
    return JSON.stringify(this.recorderState, null, 2);
  },
  getSerializedArray() {
    this.removeInvalidCaptures();
    return Object.keys(this.recorderState).map((scriptFilePath) => {
      // This JSON should be serializeable
      const data = JSON.stringify(this.recorderState[scriptFilePath], null, 2);
      const activityPath = `${scriptFilePath}on`; // .js -> .json
      return { activityPath, data };
    });
  },
  // TOOD: Make async
  loadFromDisk(baseDir = DEFAULT_BASE_PATH) {
    RecorderManager.clear();
    if (!fs.existsSync(baseDir)) return;
    console.log('Found existing state');
    const filePaths = walker.walk(baseDir, () => false);
    filePaths.forEach((filePath) => {
      try {
        console.log('Loading activity', filePath);
        const data = fs.readFileSync(filePath);
        // .json -> .js
        const fixedFilePath = filePath
          .slice(0, filePath.length - 2);
        const removedBase = path.normalize(fixedFilePath.replace(/\\/g, '/'))
          .replace(path.normalize(`${DEFAULT_BASE_PATH}/`), '');
        RecorderManager.recorderState[removedBase] = JSON.parse(data);
      } catch (e) {
        console.error(e);
      }
    });
  },
  // TOOD: Make async
  dumpToDisk(baseDir = DEFAULT_BASE_PATH) {
    // rimraf.sync(baseDir);
    const arr = this.getSerializedArray();
    arr.forEach(({ activityPath, data }) => {
      try {
        console.log('Dumping activity to disk', activityPath);
        const fullPath = path.join(baseDir, activityPath);
        console.log(path.dirname(fullPath));
        mkdirp.sync(path.dirname(fullPath));
        fs.writeFileSync(fullPath, data);
      } catch (e) {
        console.error(e);
      }
    });
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
  recordTrio(address, params, result, types) {
    const paramAddr = [...address, 'params'];
    if (!_.get(this, paramAddr)) {
      _.set(this, paramAddr, []);
    }
    params.forEach((innerParam, innerParamIndex) => {
      const addr = [...paramAddr, innerParamIndex];
      this.record(addr, innerParam);
    });
    const resultAddr = [...address, 'result'];
    if (result !== undefined) {
      this.record(resultAddr, result);
    }
    const typesAddr = [...address, 'types'];
    this.record(typesAddr, types);
  },
};

module.exports = RecorderManager;
