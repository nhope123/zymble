const CONFIGURATION_CONSTANTS = Object.freeze({
  packageJson: 'package.json',
  packageLock: 'package.json.lock',
  packageManagers: Object.freeze({ yarn: 'yarn', npm: 'npm' }),
  packageYaml: 'package.yaml',
  react: 'react',
  eslint: 'eslint',
  eslintPluginReact: 'eslint-plugin-react',
  typescript: 'typescript',
  yarnLock: 'yarn.lock',
  yesNoOptions: Object.freeze({ yes: 'Yes', no: 'No' }),
  jsModuleType: {
    default: 'commonjs',
    ESM: 'module',
  },
  type: 'type',
  typescriptExt: {
    component: '.tsx',
    componentTest: '.test.tsx',
    moduleTest: '.test.ts',
    module: '.ts',
  },
  javascriptExt: {
    component: '.jsx',
    componentTest: '.test.jsx',
    moduleTest: '.test.js',
    module: '.js',
  },
  dependencies: 'dependencies',
  devDependencies: 'devDependencies',
});

const CONFIRMATION_CHOICES = Object.freeze(
  Object.values(CONFIGURATION_CONSTANTS.yesNoOptions)
);

const SELECT_FOLDER_OPTION = 'Select Folder';
const CURRENT_FOLDER_OPTION = 'Current Folder';

module.exports = {
  CONFIRMATION_CHOICES,
  CONFIGURATION_CONSTANTS,
  SELECT_FOLDER_OPTION,
  CURRENT_FOLDER_OPTION,
};
