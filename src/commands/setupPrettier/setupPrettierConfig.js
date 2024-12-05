import { ConfigurationTarget } from 'vscode';

const {
  getCurrentWorkspaceFolders,
  loadJsonPackages,
  processErrorMessage,
  showInformationMessage,
  showQuickPick,
} = require('../vscodeHelpers');
const fs = require('fs');
const {
  PRETTIER_CONSTANTS,
  PRETTIER_REGEX,
  PRETTIER_PACKAGE_LIST,
} = require('../../config/prettierConstants');

const {
  CONFIGURATION_CONSTANTS: {
    packageJson,
    packageLock,
    packageManagers,
    packageYaml,
    react,
    eslint,
    eslintPluginReact,
    typescript,
    type: C_C_TYPE,
    jsModuleType,
    yesNoOptions,
    yarnLock,
  },
  CONFIRMATION_CHOICES,
} = require('../../config/configurationConstants');

const selectPrettierConfigFile = () =>
  showQuickPick(PRETTIER_CONSTANTS.prettierConfigFiles, {
    placeholder: 'Choose a Prettier configuration file',
    title: 'Prettier Configuration Selection',
  });

const promptForConfigOverride = async (configLocation) => {
  const overrideConfig =
    (await showQuickPick(CONFIRMATION_CHOICES, {
      placeholder: `Prettier config already exists at ${configLocation}. Override?`,
      title: 'Override Configuration',
    })) === yesNoOptions.yes;

  if (!overrideConfig) {
    processErrorMessage(
      `Cancel setup: ${configLocation} config already exist!`
    );
  }
  return true;
};

const setupPrettierConfig = async () => {
  try {
    let allowConfigOverride = false;
    let configExists;
    let packageInstallationQueue = [];
    let packageJsonData;
    let packageManager;
    let prettierConfigFileName;
    let isReactProject = false;
    let isTypescriptProject = false;
    let moduleType = jsModuleType.default;

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

        case i === packageJson:
        case i === packageYaml:
          packageJsonData = loadJsonPackages();
          break;

        case i === yarnLock:
          packageManager = packageManagers.yarn;
          break;
        case i === packageLock:
          packageManager = packageManagers.npm;
          break;

        default:
          break;
      }
    });

    if (!packageJsonData || (!packageJsonData && !packageManager)) {
      const shouldContinueSetup =
        showQuickPick(CONFIRMATION_CHOICES, {
          placeholder:
            'No packages found. Do you want to continue with the setup?',
          title: 'Package Installation Missing',
        }) === yesNoOptions.yes;

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
    if (!packageManager && packageJsonData) {
      const { yarn, npm } = packageManagers;
      const chosenPackageManager = showQuickPick([yarn, npm, 'Exit'], {
        placeholder:
          'Project .lock file is missing. Choose a package manager or exit setup.',
        title: 'Missing Project Lock File',
      });

      if ([yarn, npm].includes(chosenPackageManager)) {
        packageManager = chosenPackageManager;
      } else {
        processErrorMessage('Cancelled process: no package manager.');
      }
    }

    PRETTIER_PACKAGE_LIST.forEach(async (i) => {
      const isDependencyPresent = (key) =>
        packageJsonData.dependencies[key] ||
        packageJsonData.devDependencies[key];

      switch (true) {
        case i === C_C_TYPE && packageJsonData[i]:
          moduleType = packageJsonData[i];
          break;

        case i === react && isDependencyPresent(i):
          isReactProject = true;
          break;

        case i === typescript && isDependencyPresent(i):
          isTypescriptProject = true;
          break;

        case i === PRETTIER_CONSTANTS.prettier && packageJsonData[i]:
          const packageKey = 'package.json key';
          const isOverrideNeeded = await promptForConfigOverride(packageKey);
          if (isOverrideNeeded) {
            configExists = packageKey;
          }

        case i === PRETTIER_CONSTANTS.prettier && !isDependencyPresent(i):
          packageInstallationQueue.push(i);
          packageInstallationQueue.push(`@types/${i}`);
          break;

        case i === eslint &&
          isDependencyPresent(i) &&
          !isDependencyPresent(eslintPluginReact) &&
          isReactProject:
          const confirmPluginInstallation =
            showQuickPick(CONFIRMATION_CHOICES, {
              placeholder: `The ${eslintPluginReact} is not yet installed. Do you want to queue it for installation?`,
              title: 'Install ESLint Plugin',
            }) === yesNoOptions.yes;

          if (confirmPluginInstallation) {
            packageInstallationQueue.push(eslintPluginReact);
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
