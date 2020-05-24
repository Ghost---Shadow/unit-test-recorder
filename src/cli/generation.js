const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { promisify } = require('util');

const { RecorderManager } = require('../recorder');
const { extractTestsFromState } = require('../generator');
const { getTestFileNameForFile } = require('../util/misc');

const writeFileAsync = promisify(fs.writeFile);

const writeTestAndExternalData = async ({ testObj, packagedArguments }) => {
  console.log('Writing test for: ', testObj.filePath);
  mkdirp.sync(path.dirname(testObj.filePath));
  const { testExt } = packagedArguments;
  const testFileName = getTestFileNameForFile(testObj.filePath, testExt);
  const testFilePromise = writeFileAsync(testFileName, testObj.fileString);
  const externalDataPromises = testObj.externalData.map((ed) => {
    console.log('Creating dir:', path.dirname(ed.filePath));
    console.log('Dumping: ', ed.filePath);
    mkdirp.sync(path.dirname(ed.filePath)); // TODO: Make async
    return writeFileAsync(ed.filePath, ed.fileString);
  });
  return Promise.all([testFilePromise, ...externalDataPromises]);
};

const generateAllTests = async (packagedArguments) => {
  try {
    console.log('Serializing activities. This may take a while...');
    // Make sure activity.json is the source of truth for generaton
    RecorderManager.dumpToDisk();
    RecorderManager.loadFromDisk();

    console.log('Generating test cases');
    const testData = await extractTestsFromState(RecorderManager.recorderState, packagedArguments);

    console.log('Dumping test cases to disk');
    const writePromises = testData
      .map(testObj => ({ testObj, packagedArguments }))
      .map(writeTestAndExternalData);
    await Promise.all(writePromises);
    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

module.exports = { generateAllTests };
