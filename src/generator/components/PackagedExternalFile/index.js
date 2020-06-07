const prettier = require('prettier');

const { wrapSafely } = require('../../utils');

const PackagedExternalFile = obj => prettier.format(
  `module.exports = ${wrapSafely(obj)}`,
  {
    singleQuote: true,
    parser: 'babel',
  },
);

module.exports = {
  PackagedExternalFile,
};
