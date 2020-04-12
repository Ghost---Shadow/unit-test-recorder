// https://github.com/lodash/lodash/issues/1845#issuecomment-339773840
const inferTypeOfObject = (obj) => {
  try {
    // https://stackoverflow.com/a/59666904/1217998
    if (obj && obj[Symbol.toStringTag]) return 'Object';
    const matches = Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/);
    if (matches === null) return matches;
    return matches[1];
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
