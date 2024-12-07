module.exports = {
  // env: {
  //   browser: false,
  //   commonjs: true,
  //   es6: true,
  //   node: true,
  //   mocha: true,
  // },
  languageOptions: {
    // parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'script', // Set to 'script' for CommonJS
    // }
  },
  
  rules: {
    'no-const-assign': 'warn',
    'no-this-before-super': 'warn',
    'no-undef': 'warn',
    'no-unreachable': 'warn',
    'no-unused-vars': 'warn',
    'constructor-super': 'warn',
    'valid-typeof': 'warn',
  },
  ignores: [
    '.vscode',
    '.vscode-test',
    'node_modules',
  ]
};
