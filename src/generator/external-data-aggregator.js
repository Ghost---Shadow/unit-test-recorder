const _ = require('lodash');

// TODO: Use redux
const AggregatorManager = {
  validatePath(path) {
    const addr = ['externalData', path];
    if (!_.get(this, addr)) {
      _.get(this, addr, []);
    }
  },
  addExternalData(path, externalData) {
    this.validatePath(path);
    this.externalData[path].concat(externalData);
  },
  getExternalData(path) {
    this.validatePath(path);
    return this.externalData[path];
  },
};

module.exports = { AggregatorManager };
