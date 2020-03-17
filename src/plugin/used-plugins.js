const parserPlugins = [
  'jsx',
  'classProperties', // '@babel/plugin-proposal-class-properties',
  'typescript', // '@babel/preset-typescript',
];

const generatorOptions = {
  retainLines: true,
  retainFunctionParens: true,
};

module.exports = {
  parserPlugins,
  generatorOptions,
};
