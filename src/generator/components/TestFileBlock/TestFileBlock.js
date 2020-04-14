const { DescribeFunctionBlock } = require('../DescribeFunctionBlock/DescribeFunctionBlock');
const { MockStatements } = require('../MockStatements/MockStatements');
const { ImportStatements } = require('../ImportStatements/ImportStatements');

const TestFileBlock = (props) => {
  const {
    fileName, filePath, fileData, packagedArguments,
  } = props;
  const { mocks, exportedFunctions, relativePath } = fileData;
  const describeBlocks = Object
    .keys(exportedFunctions)
    .map((functionName) => {
      const code = DescribeFunctionBlock({
        functionActivity: exportedFunctions[functionName],
        packagedArguments,
      });
      return code;
    });

  const mockStatements = MockStatements({
    filePath, mocks, relativePath, packagedArguments,
  });
  const importStatements = ImportStatements({
    exportedFunctions,
    path: filePath,
  });

  const result = `
  ${importStatements}
  ${mockStatements}
  describe('${fileName}',()=>{
    ${describeBlocks.join('\n')}
  })
  `;

  return result;
};

module.exports = { TestFileBlock };
