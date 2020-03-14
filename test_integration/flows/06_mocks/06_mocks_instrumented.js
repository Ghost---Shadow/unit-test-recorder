const {
  mockRecorderWrapper,
  recorderWrapper
} = require('../../../src/recorder');
const fs = require('fs');
(() => {
  const readFileSync = fs.readFileSync;
  fs.readFileSync = (...p) =>
    mockRecorderWrapper(
      {
        path: 'test_integration/flows/06_mocks/06_mocks.js',
        moduleName: 'fs',
        name: 'readFileSync'
      },
      readFileSync,
      ...p
    );
})();

const getTodo = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      name: 'getTodo',
      paramIds: '',
      isDefault: true,
      isEcmaDefault: false,
      isAsync: false
    },
    () =>
      JSON.parse(
        fs
          .readFileSync('test_integration/flows/06_mocks/response.json', 'utf8')
          .toString()
      ),
    ...p
  );

module.exports = getTodo;
