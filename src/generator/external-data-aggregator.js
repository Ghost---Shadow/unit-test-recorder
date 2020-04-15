const _ = require('lodash');

// TODO: Use redux
const AggregatorManager = {
  validatePath(path) {
    const addr = ['externalData', path];
    if (!_.get(this, addr)) {
      _.set(this, addr, []);
    }
  },
  clear() {
    this.externalData = {};
  },
  addExternalData(path, externalData) {
    this.validatePath(path);
    this.externalData[path].push(...externalData);
  },
  getExternalData(path) {
    this.validatePath(path);
    return this.externalData[path];
  },
};

module.exports = { AggregatorManager };
