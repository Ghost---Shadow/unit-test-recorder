const cp = require('child_process');
const fs = require('fs');

const rimraf = require('rimraf');

const compileAndGetOutputDir = (typescriptConfig) => {
  if (fs.existsSync(typescriptConfig)) {
    console.log(`Typescript config found at ${typescriptConfig}`);
    const config = JSON.parse(fs.readFileSync(typescriptConfig).toString());
    const tsBuildDir = config.compilerOptions.outDir;
    console.log('Purging build directory');
    rimraf.sync(tsBuildDir);
    console.log('Recompiling');
    cp.execSync('tsc');
    console.log('Compiled');
    return tsBuildDir;
  }
  return null;
};

module.exports = {
  compileAndGetOutputDir,
};
