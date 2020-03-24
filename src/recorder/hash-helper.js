const crypto = require('crypto');
const { safeStringify } = require('./utils');

const generateHashForParam = (params) => {
  // TODO: safeStringify converts functions to null
  const str = safeStringify(params);
  const hash = crypto.createHash('md5').update(str).digest('base64');
  return hash;
};

module.exports = {
  generateHashForParam,
};
