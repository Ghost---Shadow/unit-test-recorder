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

const walkHelper = (rootDir, allFiles = [], cifsbi) => {
  const files = fs.readdirSync(rootDir);
  files.forEach((file) => {
    const fullPath = path.join(rootDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!checkIfDirectoryShouldBeIgnored(fullPath)) {
        walkHelper(fullPath, allFiles, cifsbi);
      }
    } else if (!cifsbi(fullPath)) {
      allFiles.push(fullPath);
    }
  });
  return allFiles;
};

const walk = (rootDir, cifsbi = checkIfFileShouldBeIgnored) => {
  const allFiles = walkHelper(rootDir, [], cifsbi);
  // Dont use windows style paths
  const rectifiedPaths = allFiles.map(p => p.replace(/\\/g, '/'));
  return rectifiedPaths;
};

const filterFiles = (packagedArguments, allFiles) => {
  const { entryPoint, exceptFiles, onlyFiles } = packagedArguments;

  const matchesAny = (val, arr) => arr
    .reduce((acc, next) => acc || val.match(new RegExp(next)), false);

  return allFiles.filter((fileName) => {
    const isBlacklisted = matchesAny(fileName, exceptFiles.concat(entryPoint));
    if (isBlacklisted) return false;
    const isWhitelisted = matchesAny(fileName, onlyFiles);
    // if whitelist is empty then allow all
    return isWhitelisted || !onlyFiles.length;
  });
};

module.exports = {
  walk,
  filterFiles,
  checkIfDirectoryShouldBeIgnored,
  checkIfFileShouldBeIgnored,
};
