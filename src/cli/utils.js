const cp = require('child_process');
const fs = require('fs');
const ts = require('typescript');

const rimraf = require('rimraf');

const compileAndGetOutputDir = (typescriptConfig) => {
  if (fs.existsSync(typescriptConfig)) {
    console.log(`Typescript config found at ${typescriptConfig}`);
    const contents = fs.readFileSync(typescriptConfig).toString();
    const { config, error } = ts.parseConfigFileTextToJson(typescriptConfig, contents);

    if (error) throw new Error(error);

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
