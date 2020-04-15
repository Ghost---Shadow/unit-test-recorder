// TODO: Use babel template
const prettier = require('prettier');
const { filePathToFileName, getOutputFilePath } = require('./utils');

const { TestFileBlock } = require('./components/TestFileBlock/TestFileBlock');
const { AggregatorManager } = require('./external-data-aggregator');

// maxTestsPerFunction: -1 == inf
// outputDir === null means use the same directory as inputDir
const extractTestsFromState = (state, packagedArguments) => Object
  .keys(state)
  .map((filePath) => {
    try {
      // Generate output file path and store it in the state meta
      const { outputDir } = packagedArguments;
      const { outputFilePath, importPath, relativePath } = getOutputFilePath(filePath, outputDir);
      Object.keys(state[filePath].exportedFunctions).forEach((functionName) => {
        state[filePath].exportedFunctions[functionName].meta.importPath = importPath;
        state[filePath].exportedFunctions[functionName].meta.relativePath = relativePath;
      });
      state[filePath].importPath = importPath;
      state[filePath].relativePath = relativePath;

      // Generate file name from file path
      const fileName = filePathToFileName(filePath);

      // Generate tests
      console.log('Generating tests for ', fileName);
      const code = TestFileBlock({
        fileName,
        filePath,
        fileData: state[filePath],
        packagedArguments,
      });
      let fileString = '';

      // Prettify the results
      try {
        fileString = prettier.format(code, {
          singleQuote: true,
          parser: 'babel',
        });
      } catch (e) {
        console.error(e);
        fileString = code;
      }

      const externalData = AggregatorManager.getExternalData(filePath);

      return { filePath: outputFilePath, fileString, externalData };
    } catch (e) {
      console.error('Error tests for ', filePath);
      return { filePath, fileString: `'${e.stack.toString()}'`, externalData: [] };
    }
  });

module.exports = {
  extractTestsFromState,
};
