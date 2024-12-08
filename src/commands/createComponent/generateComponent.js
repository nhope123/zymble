const path = require('path');
const {
  getComponentName,
  processContextMenuPath,
} = require('../vscodeHelper/vscodeHelpers');
const {
  showInformationMessage,
  showQuickPick,
  processErrorMessage,
} = require('../vscodeHelper/message');
const { generateComponentFiles } = require('./componentTemplateUtils');
const {
  CONFIGURATION_CONSTANTS: { yesNoOptions },
  CONFIRMATION_CHOICES,
} = require('../../config/configurationConstants');
const {
  createDirectory,
  createFilesWithContent,
  getCurrentWorkspaceFolders,
  getTargetFolder,
} = require('../vscodeHelper/fileOperations');
const vscode = require('vscode');

const generateComponent = async (uri) => {
  try {
    getCurrentWorkspaceFolders();

    // Prompt the user for the component name
    const componentName = await getComponentName(
      {
        prompt: 'Enter the component name (alphanumeric only)',
        title: 'Component Name',
      },
      'Component name cannot be empty'
    );

    // Ask if the component should have props
    const hasProps =
      (await showQuickPick(CONFIRMATION_CHOICES, {
        placeholder: 'Should the component contain props?',
        title: 'Component Properties',
      })) === yesNoOptions.yes;

    // Get path if command ran from menu context
    const menuContextPath = processContextMenuPath(uri);
    // Get target folder
    const targetFolderPath = menuContextPath
      ? menuContextPath
      : await getTargetFolder();

    if (!targetFolderPath) {
      processErrorMessage(
        'Error: Target folder path not found. Operation cancelled.'
      );
    }

    // Create the folder for the new component
    const componentFolderPath = path.join(targetFolderPath, componentName);
    createDirectory(componentFolderPath, componentName);

    // Define the files and their contents
    const files = await generateComponentFiles(componentName, hasProps);

    // Create each file with its corresponding content
    createFilesWithContent(componentFolderPath, files);

    showInformationMessage(`Component ${componentName} created successfully!`);
  } catch (error) {
    processErrorMessage(error.message, 'minor');
    vscode.window.showErrorMessage(error.message);
  }
};

module.exports = generateComponent;
