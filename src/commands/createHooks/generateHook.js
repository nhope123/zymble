const fs = require('fs');
const path = require('path');
const {
  createFilesWithContent,
  findDirectory,
  getComponentName,
  getTargetFolder,
  showErrorMessage,
  showQuickPick,
  processContextMenuPath,
  showInformationMessage,
} = require('../vscodeHelper/vscodeHelpers.js');
const {
  CONFIGURATION_CONSTANTS: { yesNoOptions },
  CONFIRMATION_CHOICES,
} = require('../../config/configurationConstants.js');
const generateHookFiles = require('./hookTemplateUtils.js');
const {
  getCurrentWorkspaceFolders,
} = require('../vscodeHelper/fileOperations');

const regex = /^use/i;

const generateHook = async (uri) => {
  try {
    const workspaceFolders = getCurrentWorkspaceFolders()[0].uri.fsPath;

    // Get hook name
    let hookName = await getComponentName(
      {
        prompt: 'Enter Hook Name. (eg. State)',
        title: 'Hook Name',
      },
      'Hook Name cannot be empty'
    );

    if (hookName) {
      if (regex.test(hookName)) {
        hookName = 'use' + hookName.charAt(3).toLowerCase() + hookName.slice(4);
      } else {
        hookName = 'use' + hookName;
      }
    } else if (!hookName) {
      throw new Error('Operation cancelled: Unsatisfied hook name.');
    }

    const hasUseState =
      (await showQuickPick(CONFIRMATION_CHOICES, {
        placeholder: 'Should the hook have persisted state (useState)?',
        title: 'Hook State Management',
      })) === yesNoOptions.yes;

    const hasUseEffect =
      (await showQuickPick(CONFIRMATION_CHOICES, {
        placeholder: 'Should hook have a useEffect?',
        title: 'Hook Effect',
      })) === yesNoOptions.yes;

    // Get destination folder
    const menuContextPath = processContextMenuPath(uri);
    let hooksFolder;
    if (menuContextPath) {
      hooksFolder = menuContextPath;
    } else {
      hooksFolder = await findDirectory(workspaceFolders, 'hooks');

      if (!hooksFolder) {
        hooksFolder = await getTargetFolder([
          {
            path: path.resolve(workspaceFolders, 'src/hooks'),
            option: 'src/hooks',
          },
        ]);

        if (!hooksFolder) {
          const targetError = 'Operation cancelled: Target folder error.';
          console.error(targetError);
          throw new Error(targetError);
        }
      }
    }

    // Create the folder for the new component
    const componentFolderPath = path.join(hooksFolder, hookName);
    fs.mkdirSync(componentFolderPath, { recursive: true });

    // generate hook files
    const files = await generateHookFiles(hookName, hasUseState, hasUseEffect);

    // Create each file with its corresponding content
    createFilesWithContent(componentFolderPath, files);

    showInformationMessage(`Custom hook ${hookName} created successfully!`);
  } catch (error) {
    showErrorMessage(error.message);
  }
};

module.exports = generateHook;
