const _ = require('lodash');

const JestMockStatement = ({ importPath }) => `jest.mock('${importPath}');`;

const MockImportBlock = ({ exportedFunctions }) => {
  const importPaths = Object.keys(exportedFunctions).reduce((acc, fnName) => {
    const { captures } = exportedFunctions[fnName];
    return acc.concat(captures.reduce((innerAcc, capture) => {
      if (!capture.mocks) return [];
      return innerAcc.concat(Object.keys(capture.mocks));
    }, []));
  }, []);

  const uniqImportPaths = (_.uniq(importPaths)).sort();

  const mockStatements = uniqImportPaths
    .map(importPath => JestMockStatement({ importPath }));
  return mockStatements.join('\n');
};

module.exports = {
  JestMockStatement,
  MockImportBlock,
};
