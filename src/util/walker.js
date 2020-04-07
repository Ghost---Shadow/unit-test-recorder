const fs = require('fs');
const path = require('path');

// TODO: Ignore all directories listed in .gitignore
const checkIfDirectoryShouldBeIgnored = fullPath => !!fullPath
  .match(/node_modules/);

// TODO: Ignore all directories listed in .gitignore
const checkIfFileShouldBeIgnored = (fullPath) => {
  const hasJsExtension = fullPath.trim().match(/\.[jt]sx?$/);
  const isTestFile = fullPath.trim().match(/(test.jsx?|spec.jsx?)/);

  return !(hasJsExtension && !isTestFile);
};

const walkHelper = (rootDir, allFiles = []) => {
  const files = fs.readdirSync(rootDir);
  files.forEach((file) => {
    const fullPath = path.join(rootDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!checkIfDirectoryShouldBeIgnored(fullPath)) {
        walkHelper(fullPath, allFiles);
      }
    } else if (!checkIfFileShouldBeIgnored(fullPath)) {
      allFiles.push(fullPath);
    }
  });
  return allFiles;
};

const walk = (rootDir) => {
  const allFiles = walkHelper(rootDir);
  // Dont use windows style paths
  const rectifiedPaths = allFiles.map(p => p.replace(/\\/g, '/'));
  return rectifiedPaths;
};

const filterFiles = (packagedArguments, allFiles) => {
  const { entryPoint, exceptFiles, onlyFiles } = packagedArguments;

  const lut = { };
  allFiles.forEach((fileName) => { lut[path.resolve(fileName)] = !onlyFiles.length; });
  lut[path.resolve(entryPoint)] = false;
  onlyFiles.forEach((fileName) => { lut[path.resolve(fileName)] = true; });
  exceptFiles.forEach((fileName) => { lut[path.resolve(fileName)] = false; });

  return allFiles.filter(fileName => lut[path.resolve(fileName)]);
};

module.exports = {
  walk,
  filterFiles,
  checkIfDirectoryShouldBeIgnored,
  checkIfFileShouldBeIgnored,
};
