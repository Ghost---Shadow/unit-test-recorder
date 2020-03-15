const path = require('path');

const filePathToFileName = (filePath) => {
  const basePath = path.basename(filePath);
  return basePath.substring(0, basePath.length - 3);
};

const wrapSafely = (param) => {
  const result = {
    string: `"${param}"`,
    // Circular jsons should never exist in activity
    object: JSON.stringify(param, null, 2),
  }[typeof (param)];
  return result || param;
};

module.exports = {
  filePathToFileName,
  wrapSafely,
};
