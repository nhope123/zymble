const config = [
  {
    name: 'zymble-extension',
    files: ['src/**/*.js'],
    ignores: [
      'node_modules/*',
      '.vscode/',
      '.vscode-test/',
      'eslint.config.js',
    ],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      // 'no-undef': 'error',
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['error'] }],
      'no-redeclare': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-path-concat': 'error',
      'global-require': 'error',
      'no-new-require': 'error',
      'callback-return': 'warn',
      semi: 'warn',
    },
  },
];

module.exports = config;
