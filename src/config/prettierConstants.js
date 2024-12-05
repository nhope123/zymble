const { type, react, typescript, eslint } =
  require('./configurationConstants').CONFIGURATION_CONSTANTS;

const PRETTIER_CONSTANTS = Object.freeze({
  prettier: 'prettier',
  prettierConfigFiles: Object.freeze([
    '.prettierrc.json',
    '.prettierrc.yaml',
    'prettier.config.js', // type: both
    'prettier.config.mjs', // export default - type: module
    'prettier.config.cjs', // module.exports - type: commonjs
  ]),
});

const PRETTIER_REGEX = /prettier/gi;

const PRETTIER_PACKAGE_LIST = [
  type,
  react,
  typescript,
  PRETTIER_CONSTANTS.prettier,
  eslint,
];

module.exports = {
  PRETTIER_PACKAGE_LIST,
  PRETTIER_CONSTANTS,
  PRETTIER_REGEX,
};
