import { ConfigurationTarget } from 'vscode';

const {
  getCurrentWorkspaceFolders,
  loadJsonPackages,
  showQuickPick,
  showInformationMessage,
} = require('../vscodeHelpers');
const fs = require('fs');

const PRETTIER_REGEX = /prettier/gi;

const SETUP_STATIC_VALUES = Object.freeze({
  packageJson: 'package.json',
  packageLock: 'package.json.lock',
  packageManagers: Object.freeze({ yarn: 'yarn', npm: 'npm' }),
  packageYaml: 'package.yaml',
  prettier: 'prettier',
  react: 'react',
  eslint: 'eslint',
  eslintPluginReact: 'eslint-plugin-react',
  typescript: 'typescript',
  yarnLock: 'yarn.lock',
  yesNoOptions: Object.freeze({ yes: 'Yes', no: 'No' }),
  prettierConfigFiles: Object.freeze([
    '.prettierrc.json',
    '.prettierrc.yaml',
    'prettier.config.js', // type: both
    'prettier.config.mjs', // export default - type: module
    'prettier.config.cjs', // module.exports - type: commonjs
  ]),
  jsModuleType: {
    default: 'commonjs',
    ESM: 'module',
  },
  type: 'type',
});

const PRETTIER_CONFIG_PACKAGES = [
  SETUP_STATIC_VALUES.type,
  SETUP_STATIC_VALUES.react,
  SETUP_STATIC_VALUES.typescript,
  SETUP_STATIC_VALUES.prettier,
  SETUP_STATIC_VALUES.eslint,
];

const selectPrettierConfigFile = () =>
  showQuickPick(
    SETUP_STATIC_VALUES.prettierConfigFiles,
    {
      placeholder: 'Choose a Prettier configuration file',
      title: 'Prettier Configuration Selection'
    }
  );

const promptForConfigOverride = async (configLocation) => {
  const overrideConfig =
    (await showQuickPick(
      Object.values(SETUP_STATIC_VALUES.yesNoOptions),
      {
        placeholder: `Prettier config already exists at ${configLocation}. Override?`,
        title: 'Override Configuration'
      }
    )) === SETUP_STATIC_VALUES.yesNoOptions.yes;

  if (!overrideConfig) {
    processErrorMessage(
      `Cancel setup: ${configLocation} config already exist!`
    );
  }
  return true;
};

// severity: minor | sever
const processErrorMessage = (message, severity = 'sever') => {
  if (severity === 'minor') {
    console.error(message);
    return;
  }
  console.error(message);
  throw new Error(message);
};

const setupPrettierConfig = async () => {
  try {
    const yesNoOptions = Object.values(SETUP_STATIC_VALUES.yesNoOptions);
    let allowConfigOverride = false;
    let configExists;
    let packageInstallationQueue = [];
    let packageJson;
    let packageManager;
    let prettierConfigFileName;
    let isReactProject = false;
    let isTypescriptProject = false;
    let moduleType = SETUP_STATIC_VALUES.jsModuleType.default;

    //     steps:
    // 1. ensure a workspace : error throw
    const workspace = getCurrentWorkspaceFolders();

    // 2. get workspace dirs.
    const workspaceFolders = fs.readdirSync(workspace[0].uri.fsPath);

    workspaceFolders.forEach(async (i) => {
      switch (true) {
        case PRETTIER_REGEX.test(i):
          const isOverrideNeeded = await promptForConfigOverride(i);
          if (isOverrideNeeded) {
            configExists = i;
          }
          break;

        case i === SETUP_STATIC_VALUES.packageJson:
        case i === SETUP_STATIC_VALUES.packageYaml:
          packageJson = loadJsonPackages();
          break;

        case i === SETUP_STATIC_VALUES.yarnLock:
          packageManager = SETUP_STATIC_VALUES.packageManagers.yarn;
          break;
        case i === SETUP_STATIC_VALUES.packageLock:
          packageManager = SETUP_STATIC_VALUES.packageManagers.npm;
          break;

        default:
          break;
      }
    });

    if (!packageJson || (!packageJson && !packageManager)) {
      const shouldContinueSetup =
        showQuickPick(
          yesNoOptions,
          {
            placeholder: 'No packages found. Do you want to continue with the setup?',
            title: 'Package Installation Missing'
          }
        ) === SETUP_STATIC_VALUES.yesNoOptions.yes;

      if (!shouldContinueSetup) {
        processErrorMessage('Cancel setup: no package installation in project');
      } else {
        prettierConfigFileName = selectPrettierConfigFile();
      }
      /*
        handle things here
        3. create content
        4. create file and add content
        5. inform user of success
      */
    }

    // 4. Check if package manager exist
    if (!packageManager && packageJson) {
      const { yarn, npm } = SETUP_STATIC_VALUES.packageManagers;
      const chosenPackageManager = showQuickPick(
        [yarn, npm, 'Exit'],
        {
          placeholder: 'Project .lock file is missing. Choose a package manager or exit setup.',
          title: 'Missing Project Lock File'
        }
      );

      if ([yarn, npm].includes(chosenPackageManager)) {
        packageManager = chosenPackageManager;
      } else {
        processErrorMessage('Cancelled process: no package manager.');
      }
    }

    PRETTIER_CONFIG_PACKAGES.forEach(async (i) => {
      const isDependencyPresent = (key) =>
        packageJson.dependencies[key] || packageJson.devDependencies[key];

      switch (true) {
        case i === SETUP_STATIC_VALUES.type && packageJson[i]:
          moduleType = packageJson[i];
          break;

        case i === SETUP_STATIC_VALUES.react && isDependencyPresent(i):
          isReactProject = true;
          break;

        case i === SETUP_STATIC_VALUES.typescript && isDependencyPresent(i):
          isTypescriptProject = true;
          break;

        case i === SETUP_STATIC_VALUES.prettier && packageJson[i]:
          const packageKey = 'package.json key';
          const isOverrideNeeded = await promptForConfigOverride(packageKey);
          if (isOverrideNeeded) {
            configExists = packageKey;
          }

        case i === SETUP_STATIC_VALUES.prettier && !isDependencyPresent(i):
          packageInstallationQueue.push(i);
          packageInstallationQueue.push(`@types/${i}`);
          break;

        case i === SETUP_STATIC_VALUES.eslint &&
          isDependencyPresent(i) &&
          !isDependencyPresent(SETUP_STATIC_VALUES.eslintPluginReact) &&
          isReactProject:
          const confirmPluginInstallation =
            showQuickPick(
              yesNoOptions,
              {
                placeholder: `The ${SETUP_STATIC_VALUES.eslintPluginReact} is not yet installed. Do you want to queue it for installation?`,
                title: 'Install ESLint Plugin'
              }
            ) === SETUP_STATIC_VALUES.yesNoOptions.yes;

          if (confirmPluginInstallation) {
            packageInstallationQueue.push(
              SETUP_STATIC_VALUES.eslintPluginReact
            );
          }
          break;

        default:
          break;
      }
    });

    if (!prettierConfigFileName) {
      prettierConfigFileName = selectPrettierConfigFile();
    }

    // 9. check module type for file format and file extension
    // 	if default use module format
    // 	else ask which file format (Json, Yaml, default export)
    // 10. check for missing @types (node, prettier)
    // 11. create file content
    // 12. install packages
    // 13. create files
    // 14. confirm file exist and inform user
    showInformationMessage('Prettier config setup success!');
  } catch (error) {
    processErrorMessage(error.message);
  }
};

module.exports = setupPrettierConfig;
