const path = require('path');
const vscode = require('vscode');
const {
  createDirectory,
  createFilesWithContent,
  getComponentName,
  getCurrentWorkspaceFolders,
  getTargetFolder,
  processContextMenuPath,
  showErrorMessage,
  showQuickPick,
} = require('../vscodeHelpers');
const { generateComponentFiles } = require('./componentTemplateUtils');

const generateComponent = async (uri) => {
  try {
    getCurrentWorkspaceFolders();

    // Prompt the user for the component name
    const componentName = await getComponentName(
      {
        prompt: 'Enter the component alphanumeric name',
        title: 'Component Name',
      },
      'Component name cannot be empty'
    );

    // Ask if the component should have props
    const hasProps =
      (await showQuickPick(['Yes', 'No'], 'Does the component have props?')) ===
      'Yes';

    // Get path if command ran from menu context
    const menuContextPath = processContextMenuPath(uri);
    // Get target folder
    let targetFolderPath = menuContextPath
      ? menuContextPath
      : await getTargetFolder();

    if (!targetFolderPath) {
      const errorMessage =
        'Generate component error: target folder path not found!';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Create the folder for the new component
    const componentFolderPath = path.join(targetFolderPath, componentName);
    createDirectory(componentFolderPath, componentName);

    // Define the files and their contents
    const files = await generateComponentFiles(componentName, hasProps);

    // Create each file with its corresponding content
    createFilesWithContent(componentFolderPath, files);

    vscode.window.showInformationMessage(
      `Component ${componentName} created successfully!`
    );
  } catch (error) {
    console.error(error.message);
    showErrorMessage(error.message);
  }
};

module.exports = generateComponent;
