const { DescribeFunctionBlock } = require('../DescribeFunctionBlock/DescribeFunctionBlock');
const { MockImportBlock } = require('../MockImportBlock/MockImportBlock');
const { ImportStatements } = require('../ImportStatements/ImportStatements');

const TestFileBlock = (props) => {
  const {
    fileName, filePath, fileData, packagedArguments,
  } = props;
  const { exportedFunctions } = fileData;
  const describeBlocks = Object
    .keys(exportedFunctions)
    .map((functionName) => {
      const code = DescribeFunctionBlock({
        functionActivity: exportedFunctions[functionName],
        packagedArguments,
      });
      return code;
    });

  const importStatements = ImportStatements({
    packagedArguments,
    exportedFunctions,
    path: filePath,
  });

  const mockImportStatements = MockImportBlock({ ...fileData, packagedArguments });

  const result = `
  ${mockImportStatements}

  ${importStatements}

  describe('${fileName}',()=>{
    ${describeBlocks.join('\n')}
  })
  `;

  return result;
};

module.exports = { TestFileBlock };
