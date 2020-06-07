const prettier = require('prettier');

const { wrapSafely } = require('../../utils');

const PackagedExternalFile = ({ obj, packagedArguments }) => {
  const { isTypescript } = packagedArguments;
  const dialect = isTypescript ? 'typescript' : 'javascript';
  const wrappedObj = wrapSafely(obj);
  const code = {
    typescript: `export default ${wrappedObj}`,
    javascript: `module.exports = ${wrappedObj}`,
  }[dialect];

  return prettier.format(code, {
    singleQuote: true,
    parser: 'babel',
  });
};

module.exports = {
  PackagedExternalFile,
};
