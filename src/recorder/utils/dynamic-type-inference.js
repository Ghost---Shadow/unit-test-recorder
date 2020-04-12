const _ = require('lodash');

// https://github.com/lodash/lodash/issues/1845#issuecomment-339773840
const inferTypeOfObject = (obj) => {
  try {
    if (_.isArray(obj)) return 'Array';

    const matches = Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/);
    if (matches === null) return matches;
    const inferedType = matches[1];
    const isUnknownObject = ['Date', 'Function'].indexOf(inferedType) === -1 && _.isObjectLike(obj);
    return isUnknownObject ? 'Object' : inferedType;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const generateTypesObj = (capture) => {
  const params = capture.params.map(p => inferTypeOfObject(p));
  const result = inferTypeOfObject(capture.result);
  return { params, result };
};

module.exports = {
  inferTypeOfObject,
  generateTypesObj,
};
