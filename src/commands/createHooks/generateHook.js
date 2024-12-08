const {
  processErrorMessage,
  showQuickPick,
  showInformationMessage,
} = require('../vscodeHelper/message.js');
const vscode = require('vscode');
const path = require('path');
const {
  getComponentName,
  processContextMenuPath,
} = require('../vscodeHelper/vscodeHelpers.js');
const {
  CONFIGURATION_CONSTANTS: { yesNoOptions },
  CONFIRMATION_CHOICES,
} = require('../../config/configurationConstants.js');
const generateHookFiles = require('./hookTemplateUtils.js');
const {
  createDirectory,
  createFilesWithContent,
  getCurrentWorkspaceFolders,
  getTargetFolder,
  findDirectory,
} = require('../vscodeHelper/fileOperations');

const regex = /^use/i;

const generateHook = async (uri) => {
  try {
    const workspaceFolder = getCurrentWorkspaceFolders()[0].uri.fsPath;

    // Get hook name
    let hookName = await getComponentName(
      {
        prompt: 'Enter Hook Name. (eg. State)',
        title: 'Hook Name',
      },
      'Hook Name cannot be empty'
    );

    if (!hookName) {
      processErrorMessage('Operation cancelled: Unsatisfied hook name.');
      return;
    }

    if (regex.test(hookName)) {
      hookName = 'use' + hookName.charAt(3).toLowerCase() + hookName.slice(4);
    } else {
      hookName = 'use' + hookName;
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

    let hooksFolder =
      menuContextPath || (await findDirectory(workspaceFolder, 'hooks'));

    if (!hooksFolder) {
      hooksFolder = await getTargetFolder([
        {
          path: path.resolve(workspaceFolder, 'src/hooks'),
          option: 'src/hooks',
        },
      ]);

      if (!hooksFolder) {
        processErrorMessage('Operation cancelled: Target folder error.');
        return;
      }
    }

    // Create the folder for the new component
    const componentFolderPath = path.join(hooksFolder, hookName);
    await createDirectory(componentFolderPath, hookName);

    // generate hook files
    const files = await generateHookFiles(hookName, hasUseState, hasUseEffect);

    // Create each file with its corresponding content
    await createFilesWithContent(componentFolderPath, files);

    showInformationMessage(`Custom hook ${hookName} created successfully!`);
  } catch (error) {
    processErrorMessage(error.message, 'minor');
    vscode.window.showErrorMessage(error.message);
  }
};

module.exports = generateHook;
