module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true
  },
  extends: 'airbnb',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'react/jsx-filename-extension': 0,
    // Babel AST transform is not pure
    'no-param-reassign': 0,
    // Code is less "indenty" with continue
    'no-continue': 0,
    // Match existing code style
    'arrow-parens': 0,
    'function-paren-newline': 0,
    'no-multiple-empty-lines': 0,
    'no-promise-executor-return': 0,
    'import/no-useless-path-segments': 0,
    'default-param-last': 0,
    'quotes': 0,
    'implicit-arrow-linebreak': 0,
    'comma-dangle': 0,
    'operator-linebreak': 0,
  },
};
