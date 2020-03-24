const crypto = require('crypto');
const { safeStringify } = require('./utils');

const generateHashForParam = (params) => {
  const str = safeStringify(params);
  const hash = crypto.createHash('md5').update(str).digest('base64');
  return hash;
};

const doesParamExist = (hashTable, params) => {
  const hash = generateHashForParam(params);
  return hashTable[hash];
};

module.exports = {
  generateHashForParam,
  doesParamExist,
};
